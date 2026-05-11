import logo from "@/assets/bancred-logo.png";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const Simulacao = () => {
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
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "1px solid #E5E7EB",
          padding: "14px 16px",
          textAlign: "center",
          position: "sticky",
          top: 0,
          zIndex: 40,
          paddingTop: "calc(14px + env(safe-area-inset-top))",
        }}
      >
        <img src={logo} alt="Bancred" style={{ height: 90, width: "auto", display: "inline-block", objectFit: "contain" }} />
      </header>

      <main style={{ padding: "40px 20px", textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.6, marginBottom: 12 }}>
          Simulação
        </h1>
        <p style={{ color: "#6B7280", fontSize: 15 }}>
          Em breve. Envie o conteúdo desta seção para preenchermos.
        </p>
      </main>
    </div>
  );
};

export default Simulacao;
