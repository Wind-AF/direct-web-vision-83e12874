import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Simulacao from "./pages/Simulacao.tsx";
import CPF from "./pages/CPF.tsx";
import Pessoa from "./pages/Pessoa.tsx";
import Analise from "./pages/Analise.tsx";
import Oferta from "./pages/Oferta.tsx";
import Analisando from "./pages/Analisando.tsx";
import Aprovado from "./pages/Aprovado.tsx";
import Endereco from "./pages/Endereco.tsx";
import Senha from "./pages/Senha.tsx";
import Configurando from "./pages/Configurando.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Saque from "./pages/Saque.tsx";
import SaqueConfirmar from "./pages/SaqueConfirmar.tsx";
import Garantia from "./pages/Garantia.tsx";
import Agendamento from "./pages/Agendamento.tsx";
import Pagamento from "./pages/Pagamento.tsx";
import Downsell from "./pages/Downsell.tsx";
import Up1 from "./pages/Up1.tsx";
import Up2 from "./pages/Up2.tsx";
import Up3 from "./pages/Up3.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cpf" element={<CPF />} />
          <Route path="/analise" element={<Analise />} />
          <Route path="/pessoa" element={<Pessoa />} />
          <Route path="/oferta" element={<Oferta />} />
          <Route path="/analisando" element={<Analisando />} />
          <Route path="/aprovado" element={<Aprovado />} />
          <Route path="/endereco" element={<Endereco />} />
          <Route path="/senha" element={<Senha />} />
          <Route path="/configurando" element={<Configurando />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/saque" element={<Saque />} />
          <Route path="/saque/confirmar" element={<SaqueConfirmar />} />
          <Route path="/garantia" element={<Garantia />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/pagamento" element={<Pagamento />} />
          <Route path="/downsell" element={<Downsell />} />
          <Route path="/up1" element={<Up1 />} />
          <Route path="/up2" element={<Up2 />} />
          <Route path="/up3" element={<Up3 />} />
          <Route path="/simulacao" element={<Simulacao />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
