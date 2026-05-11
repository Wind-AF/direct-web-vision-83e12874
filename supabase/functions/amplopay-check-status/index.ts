import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const AMPLOPAY_BASE = "https://app.amplopay.com/api/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const PUBLIC_KEY = Deno.env.get("AMPLOPAY_PUBLIC_KEY");
    const SECRET_KEY = Deno.env.get("AMPLOPAY_SECRET_KEY");
    if (!PUBLIC_KEY || !SECRET_KEY) throw new Error("Credenciais Amplopay ausentes");

    const url = new URL(req.url);
    const transactionId = url.searchParams.get("transaction_id");
    if (!transactionId) throw new Error("transaction_id obrigatório");

    const target = `${AMPLOPAY_BASE}/gateway/transactions?id=${encodeURIComponent(transactionId)}`;
    const resp = await fetch(target, {
      method: "GET",
      headers: {
        "x-public-key": PUBLIC_KEY,
        "x-secret-key": SECRET_KEY,
      },
    });
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      console.error("Amplopay status error", resp.status, data);
      return new Response(JSON.stringify({ error: data?.message || "Falha ao consultar", details: data }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = String(data?.status || "").toUpperCase();
    let status = "pending";
    if (raw === "COMPLETED" || raw === "PAID" || raw === "APPROVED") status = "approved";
    else if (raw === "FAILED" || raw === "CANCELED" || raw === "CANCELLED" || raw === "EXPIRED" || raw === "CHARGED_BACK") status = "failed";
    else if (raw === "REFUNDED") status = "refunded";

    return new Response(
      JSON.stringify({ status, raw_status: data?.status, paid_at: data?.payedAt }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("amplopay-check-status:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
