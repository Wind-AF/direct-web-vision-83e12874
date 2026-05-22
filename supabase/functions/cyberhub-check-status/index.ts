import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const CYBERHUB_BASE = "https://api.escalecyber.com/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const API_KEY = Deno.env.get("CYBERHUB_SECRET_KEY");
    if (!API_KEY) throw new Error("CYBERHUB_SECRET_KEY ausente");

    const url = new URL(req.url);
    const transactionId = url.searchParams.get("transaction_id");
    if (!transactionId) throw new Error("transaction_id obrigatório");

    const resp = await fetch(`${CYBERHUB_BASE}/payments/transactions/${encodeURIComponent(transactionId)}`, {
      method: "GET",
      headers: { "X-API-Key": API_KEY },
    });
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      console.error("CyberHub status error", resp.status, data);
      return new Response(
        JSON.stringify({ error: data?.message || "Falha ao consultar", details: data }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const tx = data?.data ?? data;
    const raw = String(tx?.status || "").toUpperCase();
    let status = "pending";
    if (raw === "PAID" || raw === "APPROVED" || raw === "COMPLETED" || raw === "CONFIRMED") status = "approved";
    else if (raw === "FAILED" || raw === "CANCELED" || raw === "CANCELLED" || raw === "EXPIRED" || raw === "CHARGEDBACK" || raw === "CHARGED_BACK") status = "failed";
    else if (raw === "REFUNDED") status = "refunded";

    return new Response(
      JSON.stringify({ status, raw_status: tx?.status, paid_at: tx?.paidAt || tx?.payedAt }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("cyberhub-check-status:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
