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

const KIRVUS_BASE = "https://app.kirvuspay.com.br/api/v1";

function gerarCpfValido(): string {
  const n: number[] = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const calcDV = (base: number[]) => {
    const factorStart = base.length + 1;
    const sum = base.reduce((acc, v, i) => acc + v * (factorStart - i), 0);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  const d1 = calcDV(n);
  const d2 = calcDV([...n, d1]);
  return [...n, d1, d2].join("");
}

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

function gerarCustomer(input?: CreatePixRequest["customer"]) {
  const nomes = ["Ana", "Carlos", "Maria", "Pedro", "Julia", "Lucas", "Fernanda", "Rafael", "Camila", "Bruno"];
  const sobrenomes = ["Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Costa", "Ferreira", "Almeida", "Ribeiro"];
  const ddds = ["11", "21", "31", "41", "51", "61", "71", "81", "85", "27"];

  const name = input?.name || `${nomes[Math.floor(Math.random() * nomes.length)]} ${sobrenomes[Math.floor(Math.random() * sobrenomes.length)]}`;
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  const email = input?.email || `cliente_${ts}_${rand}@mail.com`;

  const inputDoc = (input?.document || "").replace(/\D/g, "");
  const docRaw = inputDoc && isCpfValido(inputDoc) ? inputDoc : gerarCpfValido();

  const ddd = ddds[Math.floor(Math.random() * ddds.length)];
  const phoneRaw = (input?.phone || ddd + "9" + Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("")).replace(/\D/g, "");

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
    const PUBLIC_KEY = Deno.env.get("KIRVUS_PUBLIC_KEY");
    const SECRET_KEY = Deno.env.get("KIRVUS_SECRET_KEY");
    if (!PUBLIC_KEY || !SECRET_KEY) throw new Error("Credenciais Kirvus ausentes");

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

    const customer = gerarCustomer(body.customer);
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
        const resp = await fetch(`${KIRVUS_BASE}/gateway/pix/receive`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-public-key": PUBLIC_KEY,
            "x-secret-key": SECRET_KEY,
          },
          body: JSON.stringify(payload),
        });
        lastStatus = resp.status;
        const rawText = await resp.text();
        let data: any = {};
        try { data = rawText ? JSON.parse(rawText) : {}; } catch { data = { raw: rawText }; }
        lastData = data;
        if (!resp.ok) console.error("Kirvus attempt", attempt, "status", resp.status, "headers:", Object.fromEntries(resp.headers), "body:", rawText);

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

    console.error("Kirvus create error", lastStatus, lastData, lastErr);
    return new Response(
      JSON.stringify({ error: lastData?.message || lastData?.errorCode || "Falha ao criar PIX", details: lastData }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("kirvus-create-pix:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
