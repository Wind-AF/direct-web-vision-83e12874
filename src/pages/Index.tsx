import { ArrowRight, Sparkles, ShieldCheck, UserX, Users, Calculator, Clock, Zap } from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import SocialProofToast from "@/components/SocialProofToast";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const handleCta = () => {
  const search = typeof window !== "undefined" ? window.location.search : "";
  const target = `/cpf${search}`;
  // @ts-ignore
  if (typeof window !== "undefined" && (window as any).redirectWithUtms) {
    (window as any).redirectWithUtms(target);
  } else {
    window.location.href = target;
  }
};

const SectionLabel = ({ icon: Icon, children }: { icon: any; children: React.ReactNode }) => (
  <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        color: "#6B7280",
        letterSpacing: 1.2,
        fontFamily: fontStack,
      }}
    >
      <span style={{ color: "#1C68E3", display: "inline-flex" }}>
        <Icon width={12} height={12} />
      </span>
      {children}
    </span>
  </div>
);

const PrimaryButton = ({
  children,
  large,
  onClick,
}: {
  children: React.ReactNode;
  large?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: large ? 8 : 6,
      width: "100%",
      maxWidth: large ? 360 : undefined,
      padding: large ? "16px 22px" : "13px 16px",
      background: "linear-gradient(135deg, #3B82F6 0%, #1C68E3 100%)",
      color: "#fff",
      border: "none",
      borderRadius: large ? 14 : 12,
      fontSize: large ? 16 : 14,
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 8px 24px rgba(28, 104, 227, 0.28)",
      fontFamily: fontStack,
      letterSpacing: large ? -0.2 : undefined,
      minHeight: large ? 54 : 48,
    }}
  >
    {children}
    <ArrowRight width={large ? 18 : 16} height={large ? 18 : 16} />
  </button>
);

type CardProps = {
  icon: any;
  title: string;
  desc: string;
  badge: string;
  from: string;
  to: string;
  highlight?: boolean;
};

const ModalityCard = ({ icon: Icon, title, desc, badge, from, to, highlight }: CardProps) => (
  <div
    style={{
      background: "#FFFFFF",
      border: highlight ? "2px solid #1C68E3" : "1px solid #E5E7EB",
      borderRadius: 18,
      padding: "18px 16px 16px",
      position: "relative",
      boxShadow: highlight
        ? "0 12px 32px -16px rgba(28, 104, 227, 0.45)"
        : "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)",
      textAlign: "center",
      fontFamily: fontStack,
    }}
  >
    {highlight && (
      <div
        style={{
          position: "absolute",
          top: -11,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1C68E3",
          color: "#fff",
          padding: "4px 12px",
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 0.6,
          boxShadow: "0 8px 24px rgba(28, 104, 227, 0.28)",
          whiteSpace: "nowrap",
        }}
      >
        MAIS PROCURADO
      </div>
    )}
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "#EFF6FF",
        color: "#1C68E3",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        marginTop: highlight ? 4 : 0,
      }}
    >
      <Icon width={20} height={20} />
    </div>
    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 4, letterSpacing: -0.2 }}>{title}</h3>
    <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 10 }}>{desc}</p>
    <div
      style={{
        display: "inline-block",
        background: "#DCFCE7",
        color: "#15803D",
        padding: "4px 10px",
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 700,
        marginBottom: 12,
      }}
    >
      {badge}
    </div>
    <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 0 }}>De {from} até</p>
    <p
      style={{
        fontSize: 24,
        fontWeight: 800,
        color: "#1C68E3",
        marginBottom: 14,
        letterSpacing: -0.5,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {to}
    </p>
    <PrimaryButton onClick={handleCta}>Simular Grátis</PrimaryButton>
  </div>
);

const StepRow = ({ n, icon: Icon, title, desc }: { n: number; icon: any; title: string; desc: string }) => (
  <div
    style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 14,
      padding: 14,
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontFamily: fontStack,
    }}
  >
    <div
      style={{
        position: "relative",
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "#EFF6FF",
        color: "#1C68E3",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon width={18} height={18} />
      <span
        style={{
          position: "absolute",
          top: -6,
          right: -6,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#1C68E3",
          color: "#fff",
          fontSize: 11,
          fontWeight: 800,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #FFFFFF",
        }}
      >
        {n}
      </span>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#6B7280" }}>{desc}</div>
    </div>
  </div>
);

const Index = () => {
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
        <img src={logo} alt="Bancred" style={{ height: 104, width: "auto", display: "inline-block", objectFit: "contain" }} />
      </header>

      <main style={{ paddingBottom: 40 }}>
        {/* Hero */}
        <section style={{ padding: "32px 20px 24px", textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#111827",
              marginBottom: 16,
              letterSpacing: -0.8,
            }}
          >
            Empréstimo online,
            <br />
            receba hoje via <span style={{ color: "#1C68E3" }}>PIX</span>!
          </h1>
          <p style={{ fontSize: 16, color: "#6B7280", marginBottom: 10, lineHeight: 1.5 }}>
            Mesmo com{" "}
            <span style={{ background: "#FFEDD5", color: "#111827", fontWeight: 700, padding: "2px 6px", borderRadius: 6 }}>
              nome sujo
            </span>{" "}
            ou{" "}
            <span style={{ background: "#FFEDD5", color: "#111827", fontWeight: 700, padding: "2px 6px", borderRadius: 6 }}>
              score baixo
            </span>
          </p>
          <p
            style={{
              color: "#16A34A",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 24,
              fontSize: 14,
            }}
          >
            <Sparkles width={14} height={14} />
            Simule sem compromisso
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
            <PrimaryButton large onClick={handleCta}>
              Começar Simulação
            </PrimaryButton>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 16,
              fontSize: 13,
              color: "#6B7280",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16A34A" }} />
              100% Digital
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1C68E3" }} />
              Sem Taxa
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6" }} />
              Seguro &amp; Rápido
            </span>
          </div>
        </section>

        {/* Modalidades */}
        <section style={{ padding: "20px 16px", maxWidth: 560, margin: "0 auto" }}>
          <SectionLabel icon={ShieldCheck}>MODALIDADES</SectionLabel>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              textAlign: "center",
              color: "#111827",
              marginBottom: 8,
              letterSpacing: -0.4,
            }}
          >
            Escolha sua opção de empréstimo
          </h2>
          <p style={{ textAlign: "center", color: "#6B7280", fontSize: 14, marginBottom: 22 }}>
            Soluções personalizadas para cada situação financeira
          </p>
          <div style={{ display: "grid", gap: 14 }}>
            <ModalityCard
              icon={UserX}
              title="Para Negativados"
              desc="CPF com restrições no Serasa/SPC"
              badge="1ª parcela em 90 dias"
              from="R$ 2.300,00"
              to="R$ 18.000,00"
              highlight
            />
            <ModalityCard
              icon={Users}
              title="Pessoa Física"
              desc="CPF sem restrições, tire planos do papel"
              badge="1ª parcela em 90 dias"
              from="R$ 3.000,00"
              to="R$ 27.000,00"
            />
            <ModalityCard
              icon={Calculator}
              title="Pessoa Jurídica"
              desc="Capital de giro para sua empresa crescer"
              badge="1ª parcela em 120 dias"
              from="R$ 5.000,00"
              to="R$ 50.000,00"
            />
          </div>
        </section>

        {/* Processo */}
        <section style={{ padding: "24px 16px", maxWidth: 560, margin: "0 auto" }}>
          <SectionLabel icon={Clock}>PROCESSO</SectionLabel>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              textAlign: "center",
              color: "#111827",
              marginBottom: 8,
              letterSpacing: -0.4,
            }}
          >
            Como funciona?
          </h2>
          <p style={{ textAlign: "center", color: "#6B7280", fontSize: 14, marginBottom: 22 }}>
            Processo 100% digital e sem burocracias
          </p>
          <div style={{ display: "grid", gap: 12 }}>
            <StepRow n={1} icon={Calculator} title="Simulação gratuita" desc="Formulário online em 2 minutos" />
            <StepRow n={2} icon={Clock} title="Resultado imediato" desc="Análise instantânea pela IA" />
            <StepRow n={3} icon={Zap} title="Recebimento via PIX" desc="Dinheiro na conta em minutos" />
          </div>

          <div style={{ textAlign: "center", marginTop: 28 }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#111827",
                marginBottom: 6,
                letterSpacing: -0.3,
              }}
            >
              Pronto para começar?
            </h3>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 18 }}>
              Descubra quanto você pode receber em menos de 2 minutos
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <PrimaryButton large onClick={handleCta}>
                Fazer Simulação Gratuita
              </PrimaryButton>
            </div>
          </div>
        </section>
      </main>

      <footer
        style={{
          background: "#0F172A",
          color: "#CBD5E1",
          textAlign: "center",
          padding: "24px 16px calc(24px + env(safe-area-inset-bottom))",
          fontSize: 12,
          lineHeight: 1.7,
          fontFamily: fontStack,
        }}
      >
        © 2026 Bancred LTDA. Todos os direitos reservados.
        <br />
        CNPJ 41.906.644/0001-20
        <br />
        <span style={{ color: "#64748B", fontSize: 11 }}>
          Empréstimos rápidos e seguros para realizar seus sonhos
        </span>
      </footer>

      <SocialProofToast />
    </div>
  );
};

export default Index;
