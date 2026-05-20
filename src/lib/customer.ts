export interface FunnelCustomer {
  name?: string;
  email?: string;
  phone?: string;
  document?: string;
}

export function getFunnelCustomer(params?: URLSearchParams): FunnelCustomer {
  let stored: FunnelCustomer = {};
  try {
    const raw = sessionStorage.getItem("bancred_customer");
    if (raw) stored = JSON.parse(raw) as FunnelCustomer;
  } catch { /* noop */ }

  const p = params || new URLSearchParams(window.location.search);
  const merged: FunnelCustomer = {
    name: p.get("nome") || stored.name || undefined,
    email: p.get("email") || stored.email || undefined,
    phone: p.get("telefone") || stored.phone || undefined,
    document: p.get("cpf") || stored.document || undefined,
  };
  return merged;
}
