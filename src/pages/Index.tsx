import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Store, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen gradient-dark flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-sidebar-foreground">InovaFood</span>
          </div>
          <Link to="/admin/login">
            <Button variant="outline" className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">
              <Shield className="w-4 h-4 mr-2" />
              Área Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 container flex flex-col items-center justify-center text-center py-20">
        <div className="animate-fade-in space-y-8 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-extrabold text-sidebar-foreground leading-tight">
            Gerencie seu <span className="text-gradient">restaurante</span> com facilidade
          </h1>
          <p className="text-xl text-sidebar-foreground/70 max-w-2xl mx-auto">
            Plataforma completa para cardápios, pedidos e vendas. Tudo em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/r/inovafood-demo">
              <Button size="lg" className="gradient-primary text-primary-foreground px-8 py-6 text-lg font-semibold shadow-lg hover:opacity-90 transition-opacity">
                <Store className="w-5 h-5 mr-2" />
                Ver Loja Demo
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button size="lg" variant="outline" className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent px-8 py-6 text-lg">
                Acessar Painel
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl" style={{ animationDelay: "0.2s" }}>
          {[
            { title: "Cardápio Digital", desc: "Gerencie produtos, categorias e preços" },
            { title: "Pedidos em Tempo Real", desc: "Acompanhe e gerencie todos os pedidos" },
            { title: "Análises e Relatórios", desc: "Dashboard com métricas importantes" },
          ].map((f, i) => (
            <div key={i} className="glass-dark rounded-2xl p-6 text-left animate-fade-in" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
              <h3 className="text-lg font-semibold text-sidebar-foreground mb-2">{f.title}</h3>
              <p className="text-sidebar-foreground/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sidebar-foreground/50 text-sm">
        © 2024 InovaFood. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default Index;
