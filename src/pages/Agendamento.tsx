import { useNavigate, useSearchParams } from "react-router-dom";
import { CalendarClock, MapPin, Phone } from "lucide-react";
import bancredLogo from "@/assets/bancred-logo.png";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const Agendamento = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  return (
    <div style={{ minHeight: "100dvh", background: "#F4F4F7", fontFamily: fontStack, color: "#111827", WebkitFontSmoothing: "antialiased" }}>
      <header style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E7EB", padding: "14px 16px", textAlign: "center" }}>
        <img src={bancredLogo} alt="Bancred" style={{ height: 90, width: "auto", display: "inline-block", objectFit: "contain" }} />
      </header>

      <main style={{ padding: "24px 16px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 24, boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)", border: "1px solid #E5E7EB", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#DBEAFE", color: "#1C68E3", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <CalendarClock size={30} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Agendamento presencial</h1>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 8, marginBottom: 20, lineHeight: 1.5 }}>
            Para liberar seu empréstimo com garantia de bem, é necessário agendar uma avaliação presencial em uma de nossas unidades.
          </p>

          <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, textAlign: "left", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <MapPin size={18} color="#1C68E3" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Próxima unidade</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>Av. Paulista, 1.578 — São Paulo/SP</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Phone size={18} color="#1C68E3" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Atendimento</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>Seg. a Sex. das 9h às 18h</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/dashboard?${params.toString()}`)}
            style={{ width: "100%", padding: "15px 20px", background: "#1C68E3", color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, letterSpacing: -0.2, cursor: "pointer", boxShadow: "0 8px 24px rgba(28,104,227,0.28)", fontFamily: fontStack, minHeight: 52 }}
          >
            Voltar ao painel
          </button>
        </div>
      </main>
    </div>
  );
};

export default Agendamento;
