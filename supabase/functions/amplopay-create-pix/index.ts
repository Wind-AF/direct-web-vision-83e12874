import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface CreatePixRequest {
  amount: number; // em centavos
  description: string;
  stage: string; // "seguro" | "iof" | "up2" | "up3"
  customer?: {
    name?: string;
    email?: string;
    document?: string;
    phone?: string;
  };
  tracking?: Record<string, string>;
}

const AMPLOPAY_BASE = "https://app.amplopay.com/api/v1";

function isCpfValido(cpf: string): boolean {
  const c = cpf.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  const calcDV = (base: string, len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(base[i]) * (len + 1 - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  return calcDV(c, 9) === parseInt(c[9]) && calcDV(c, 10) === parseInt(c[10]);
}

function formatDoc(d: string) {
  const c = d.replace(/\D/g, "");
  if (c.length === 11) return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
  return c;
}

function formatPhone(p: string) {
  const c = p.replace(/\D/g, "");
  if (c.length === 11) return `(${c.slice(0, 2)}) ${c.slice(2, 7)}-${c.slice(7)}`;
  if (c.length === 10) return `(${c.slice(0, 2)}) ${c.slice(2, 6)}-${c.slice(6)}`;
  return c;
}

function buildCustomer(input?: CreatePixRequest["customer"]) {
  const name = (input?.name || "").trim();
  const email = (input?.email || "").trim();
  const docRaw = (input?.document || "").replace(/\D/g, "");
  const phoneRaw = (input?.phone || "").replace(/\D/g, "");

  if (!name) throw new Error("customer.name é obrigatório");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("customer.email inválido");
  if (!docRaw || !isCpfValido(docRaw)) throw new Error("customer.document (CPF) inválido");
  if (!phoneRaw || phoneRaw.length < 10) throw new Error("customer.phone inválido");

  return {
    name,
    email,
    phone: formatPhone(phoneRaw),
    document: formatDoc(docRaw),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const PUBLIC_KEY = Deno.env.get("AMPLOPAY_PUBLIC_KEY");
    const SECRET_KEY = Deno.env.get("AMPLOPAY_SECRET_KEY");
    if (!PUBLIC_KEY || !SECRET_KEY) throw new Error("Credenciais Amplopay ausentes");

    const body = (await req.json()) as CreatePixRequest;
    if (!body?.amount || !Number.isFinite(body.amount) || body.amount < 100) {
      throw new Error("amount (centavos) inválido (mínimo 100)");
    }
    if (body.amount > 50000) {
      throw new Error("amount excede o limite permitido");
    }
    const ALLOWED_STAGES = ["seguro", "iof", "up2", "up3"];
    if (!body?.stage || !ALLOWED_STAGES.includes(body.stage)) {
      throw new Error("stage inválido");
    }
    if (body.description && (typeof body.description !== "string" || body.description.length > 200)) {
      throw new Error("description inválida");
    }

    console.log("[amplopay-create-pix] incoming customer (raw):", JSON.stringify(body.customer ?? null));
    const customer = buildCustomer(body.customer);
    console.log("[amplopay-create-pix] outgoing customer (to Amplopay):", JSON.stringify(customer));
    const amountReais = Math.round(body.amount) / 100;
    const title = body.description || `Bancred - ${body.stage}`;
    const identifier = `${body.stage}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const payload: Record<string, unknown> = {
      identifier,
      amount: amountReais,
      client: customer,
      products: [
        {
          id: body.stage,
          name: title,
          quantity: 1,
          price: amountReais,
        },
      ],
    };
    if (body.tracking && Object.keys(body.tracking).length > 0) {
      payload.metadata = body.tracking;
    }

    let lastErr: unknown = null;
    let lastStatus = 0;
    let lastData: any = null;
    const delays = [0, 1000, 2000];
    for (let attempt = 0; attempt < delays.length; attempt++) {
      if (delays[attempt] > 0) await new Promise((r) => setTimeout(r, delays[attempt]));
      try {
        const resp = await fetch(`${AMPLOPAY_BASE}/gateway/pix/receive`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-public-key": PUBLIC_KEY,
            "x-secret-key": SECRET_KEY,
          },
          body: JSON.stringify(payload),
        });
        lastStatus = resp.status;
        const data = await resp.json().catch(() => ({}));
        lastData = data;

        const code = data?.pix?.code;
        const txId = data?.transactionId;
        if (resp.ok && code && txId) {
          return new Response(
            JSON.stringify({
              transaction_id: txId,
              reference: identifier,
              qr_code: code,
              amount: amountReais,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        if (resp.status >= 400 && resp.status < 500) break;
      } catch (e) {
        lastErr = e;
      }
    }

    console.error("Amplopay create error", lastStatus, lastData, lastErr);
    return new Response(
      JSON.stringify({ error: lastData?.message || lastData?.errorCode || "Falha ao criar PIX", details: lastData }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("amplopay-create-pix:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
