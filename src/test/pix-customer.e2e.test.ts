import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock supabase client BEFORE importing the hook
const invokeMock = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: (...args: unknown[]) => invokeMock(...args) } },
}));

import { useParadisePix } from "@/hooks/useParadisePix";
import { getFunnelCustomer } from "@/lib/customer";

describe("PIX e2e — customer data flows from funnel to CyberHub without changes", () => {
  beforeEach(() => {
    invokeMock.mockReset();
    sessionStorage.clear();
  });
  afterEach(() => sessionStorage.clear());

  it("getFunnelCustomer returns exactly the data stored by the funnel", () => {
    const funnel = {
      name: "Maria Aparecida da Silva",
      email: "maria.silva@example.com",
      phone: "(11) 98765-4321",
      document: "390.533.447-05",
    };
    sessionStorage.setItem("bancred_customer", JSON.stringify(funnel));
    const c = getFunnelCustomer(new URLSearchParams());
    expect(c).toEqual(funnel);
  });

  it("URL params override sessionStorage and are passed through", () => {
    sessionStorage.setItem(
      "bancred_customer",
      JSON.stringify({ name: "X", email: "x@x.com", phone: "11", document: "1" }),
    );
    const c = getFunnelCustomer(
      new URLSearchParams("nome=Joao&email=j@a.com&telefone=(21) 91234-5678&cpf=529.982.247-25"),
    );
    expect(c).toEqual({
      name: "Joao",
      email: "j@a.com",
      phone: "(21) 91234-5678",
      document: "529.982.247-25",
    });
  });

  it("useParadisePix forwards customer object unchanged to cyberhub-create-pix", async () => {
    invokeMock.mockResolvedValue({
      data: {
        transaction_id: "tx_123",
        reference: "ref_123",
        qr_code: "00020126...",
        amount: 19.9,
      },
      error: null,
    });

    const customer = {
      name: "Maria Aparecida da Silva",
      email: "maria.silva@example.com",
      phone: "(11) 98765-4321",
      document: "390.533.447-05",
    };

    const { result } = renderHook(() => useParadisePix());
    await act(async () => {
      await result.current.create({
        amountCents: 1990,
        description: "Teste",
        stage: "seguro",
        customer,
      });
    });

    expect(invokeMock).toHaveBeenCalledTimes(1);
    const [fnName, opts] = invokeMock.mock.calls[0] as [string, { body: Record<string, unknown> }];
    expect(fnName).toBe("cyberhub-create-pix");
    // The customer payload must be the exact funnel object — no mutation, no random fallback
    expect(opts.body.customer).toEqual(customer);
    expect(opts.body.amount).toBe(1990);
    expect(opts.body.stage).toBe("seguro");
  });
});
