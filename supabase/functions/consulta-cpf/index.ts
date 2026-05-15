// Edge function: consulta CPF na api.amnesiatecnologia.rocks
// Mantém o token em segredo no servidor.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Simple in-memory rate limiting per IP (best-effort; resets on cold start)
const rateMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 10; // requests
const RATE_WINDOW_MS = 60_000; // per minute

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || entry.reset < now) {
    rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) return false;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting per IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";
    if (!checkRate(ip)) {
      return new Response(
        JSON.stringify({ error: "Muitas requisições. Tente novamente em instantes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validate JWT (anon or authenticated) — blocks direct unauthenticated calls
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const token = Deno.env.get("AMNESIA_API_TOKEN");
    if (!token) {
      console.error("AMNESIA_API_TOKEN não configurada");
      return new Response(
        JSON.stringify({ error: "Configuração indisponível" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawCpf = String(body?.cpf ?? "").replace(/\D/g, "");

    if (rawCpf.length !== 11) {
      return new Response(
        JSON.stringify({ error: "CPF inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const url = `https://bk.elaiflow.dev/consultar-filtrada/cpf?token=${encodeURIComponent(token)}&cpf=${rawCpf}`;
    const upstream = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    const text = await upstream.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!upstream.ok) {
      console.error("amnesiatecnologia erro", upstream.status, text);
      return new Response(
        JSON.stringify({ error: "Falha ao consultar CPF" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // A API pode envelopar em { DADOS: {...} } / { dados: {...} } / { data: {...} } ou retornar direto.
    const payload = data?.DADOS ?? data?.dados ?? data?.data ?? data?.result ?? data;

    // Heurística para extrair os campos independentemente do nome da chave.
    const pick = (...keys: string[]) => {
      for (const k of keys) {
        const candidates = [k, k.toUpperCase(), k.toLowerCase()];
        for (const key of candidates) {
          const v = payload?.[key];
          if (v !== undefined && v !== null && String(v).trim() !== "") {
            return String(v);
          }
        }
      }
      return "";
    };

    const nome = pick("nome", "name", "nome_completo", "NOME", "fullName");
    const nascimento = pick(
      "data_nascimento",
      "nascimento",
      "dataNascimento",
      "DATA_NASC",
      "data_nasc",
      "birthDate",
      "nasc",
    );
    const sexo = pick("sexo", "genero", "SEXO", "sex", "gender");
    const mae = pick("nome_mae", "mae", "nomeMae", "NOME_MAE", "NOME_MAE_PF", "motherName");

    if (!nome) {
      console.error("CPF não encontrado", rawCpf);
      return new Response(
        JSON.stringify({ error: "CPF não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        cpf: rawCpf,
        nome,
        nascimento,
        sexo,
        mae,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("consulta-cpf erro inesperado", err);
    return new Response(
      JSON.stringify({ error: "Erro ao processar requisição" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
