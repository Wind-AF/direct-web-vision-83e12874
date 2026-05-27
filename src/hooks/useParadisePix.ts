import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "qrcode";

type Stage = "seguro" | "iof" | "up2" | "up3";

export interface PixData {
  transaction_id: string | number;
  reference: string;
  qr_code: string;
  qr_image: string; // dataURL gerado localmente
  amount: number;
  expires_at?: string;
}

interface CreateArgs {
  amountCents: number;
  description: string;
  stage: Stage;
  customer?: { name?: string; email?: string; document?: string; phone?: string };
}

function captureTracking(): Record<string, string> | undefined {
  const params = new URLSearchParams(window.location.search);
  const fields = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "sck"];
  const out: Record<string, string> = {};
  fields.forEach((f) => {
    const v = params.get(f);
    if (v) out[f] = v;
  });
  return Object.keys(out).length > 0 ? out : undefined;
}

export function useParadisePix(onApproved?: () => void) {
  const [pix, setPix] = useState<PixData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "approved" | "failed" | "refunded">("idle");
  const pollRef = useRef<number | null>(null);
  const stopRef = useRef<number | null>(null);
  const approvedRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (stopRef.current) {
      clearTimeout(stopRef.current);
      stopRef.current = null;
    }
  }, []);

  const create = useCallback(async ({ amountCents, description, stage, customer }: CreateArgs) => {
    setLoading(true);
    setError(null);
    setPix(null);
    setStatus("idle");
    approvedRef.current = false;
    stopPolling();

    // 🧪 MODO DE TESTE: pula a geração de PIX e avança automaticamente.
    // Para reativar o pagamento real, defina TEST_MODE = false.
    const TEST_MODE = false;
    if (TEST_MODE) {
      try {
        const fakeCode = `TEST-${stage}-${Date.now()}`;
        const qrImage = await QRCode.toDataURL(fakeCode, { width: 280, margin: 1 });
        const pixData: PixData = {
          transaction_id: `test-${Date.now()}`,
          reference: fakeCode,
          qr_code: fakeCode,
          qr_image: qrImage,
          amount: amountCents / 100,
        };
        setPix(pixData);
        setStatus("pending");
        stopRef.current = window.setTimeout(() => {
          if (approvedRef.current) return;
          approvedRef.current = true;
          setStatus("approved");
          onApproved?.();
        }, 1200);
        return pixData;
      } finally {
        setLoading(false);
      }
    }

    try {
      const tracking = captureTracking();
      const { data, error: fnError } = await supabase.functions.invoke("duttyfy-create-pix", {
        body: { amount: amountCents, description, stage, customer, tracking },
      });
      if (fnError) throw new Error(fnError.message);
      if (!data || data.error) throw new Error(data?.error || "Falha ao gerar PIX");

      const qrImage = await QRCode.toDataURL(data.qr_code, { width: 280, margin: 1 });
      const pixData: PixData = {
        transaction_id: data.transaction_id,
        reference: data.reference,
        qr_code: data.qr_code,
        qr_image: qrImage,
        amount: data.amount,
        expires_at: data.expires_at,
      };
      setPix(pixData);
      setStatus("pending");

      const projectUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      pollRef.current = window.setInterval(async () => {
        try {
          const r = await fetch(
            `${projectUrl}/functions/v1/duttyfy-check-status?transaction_id=${encodeURIComponent(String(pixData.transaction_id))}`,
            { headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey } },
          );
          const j = await r.json();
          if (j?.status === "approved" && !approvedRef.current) {
            approvedRef.current = true;
            setStatus("approved");
            stopPolling();
            onApproved?.();
          } else if (j?.status === "failed" || j?.status === "refunded") {
            setStatus(j.status);
            stopPolling();
          }
        } catch {
          /* noop */
        }
      }, 5000);

      // Parar após 15min
      stopRef.current = window.setTimeout(() => stopPolling(), 15 * 60 * 1000);

      return pixData;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [onApproved, stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    setPix(null);
    setStatus("idle");
    setError(null);
  }, [stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  return { create, reset, pix, loading, error, status };
}
