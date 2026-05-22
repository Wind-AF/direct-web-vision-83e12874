import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface CreatePixRequest {
  amount: number; // em centavos
  description: string;
  stage: string;
  customer?: {
    name?: string;
    email?: string;
    document?: string;
    phone?: string;
  };
  tracking?: Record<string, string>;
}

const CYBERHUB_BASE = "https://api.escalecyber.com/v1";

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

function buildCustomer(input?: CreatePixRequest["customer"]) {
  const name = (input?.name || "").trim();
  const email = (input?.email || "").trim();
  const docRaw = (input?.document || "").replace(/\D/g, "");
  const phoneRaw = (input?.phone || "").replace(/\D/g, "");

  if (!name) throw new Error("customer.name é obrigatório");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("customer.email inválido");
  if (!docRaw || !isCpfValido(docRaw)) throw new Error("customer.document (CPF) inválido");
  if (!phoneRaw || phoneRaw.length < 10) throw new Error("customer.phone inválido");

  // CyberHub espera telefone em formato internacional sem máscara (ex: 5511999999999)
  const phoneIntl = phoneRaw.startsWith("55") ? phoneRaw : `55${phoneRaw}`;

  return { name, email, document: docRaw, phone: phoneIntl };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const API_KEY = Deno.env.get("CYBERHUB_SECRET_KEY");
    if (!API_KEY) throw new Error("CYBERHUB_SECRET_KEY ausente");

    const body = (await req.json()) as CreatePixRequest;
    if (!body?.amount || !Number.isFinite(body.amount) || body.amount < 100) {
      throw new Error("amount (centavos) inválido (mínimo 100)");
    }
    if (body.amount > 50000) throw new Error("amount excede o limite permitido");
    const ALLOWED_STAGES = ["seguro", "iof", "up2", "up3"];
    if (!body?.stage || !ALLOWED_STAGES.includes(body.stage)) throw new Error("stage inválido");
    if (body.description && (typeof body.description !== "string" || body.description.length > 200)) {
      throw new Error("description inválida");
    }

    console.log("[cyberhub-create-pix] incoming customer (raw):", JSON.stringify(body.customer ?? null));
    const customer = buildCustomer(body.customer);
    console.log("[cyberhub-create-pix] outgoing customer:", JSON.stringify(customer));

    const amountReais = Math.round(body.amount) / 100;
    const title = body.description || `Bancred - ${body.stage}`;
    const identifier = `${body.stage}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const payload: Record<string, unknown> = {
      amount: amountReais,
      customerName: customer.name,
      customerEmail: customer.email,
      customerDocument: customer.document,
      customerDocumentType: "cpf",
      customerPhone: customer.phone,
      description: title,
    };
    if (body.tracking && Object.keys(body.tracking).length > 0) {
      payload.metadata = { ...body.tracking, reference: identifier };
    } else {
      payload.metadata = { reference: identifier };
    }

    let lastErr: unknown = null;
    let lastStatus = 0;
    let lastData: any = null;
    const delays = [0, 1000, 2000];
    for (let attempt = 0; attempt < delays.length; attempt++) {
      if (delays[attempt] > 0) await new Promise((r) => setTimeout(r, delays[attempt]));
      try {
        const resp = await fetch(`${CYBERHUB_BASE}/payments/transactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
          },
          body: JSON.stringify(payload),
        });
        lastStatus = resp.status;
        const data = await resp.json().catch(() => ({}));
        lastData = data;

        const tx = data?.data ?? data;
        const code = tx?.pix?.qrCode?.emv;
        const txId = tx?.id;
        if (resp.ok && code && txId) {
          return new Response(
            JSON.stringify({
              transaction_id: txId,
              reference: tx?.referenceCode || identifier,
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

    console.error("CyberHub create error", lastStatus, lastData, lastErr);
    return new Response(
      JSON.stringify({ error: lastData?.message || lastData?.error || "Falha ao criar PIX", details: lastData }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("cyberhub-create-pix:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
