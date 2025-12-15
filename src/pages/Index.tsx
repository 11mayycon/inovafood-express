import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  UtensilsCrossed, Store, Shield, Smartphone, ChartBar, Clock, 
  MessageCircle, Star, ChevronRight, Instagram, Facebook, Twitter,
  Menu as MenuIcon, ShoppingBag, Users, Zap
} from "lucide-react";
import { useEffect, useState } from "react";

const partners = [
  { name: "iFood", logo: "🍔" },
  { name: "Rappi", logo: "🛵" },
  { name: "Uber Eats", logo: "🚗" },
  { name: "99Food", logo: "🏍️" },
  { name: "Aiqfome", logo: "🍕" },
  { name: "Delivery Much", logo: "📦" },
];

const features = [
  { icon: MenuIcon, title: "Cardápio Digital", desc: "Gerencie produtos, categorias e preços em tempo real" },
  { icon: ShoppingBag, title: "Pedidos em Tempo Real", desc: "Acompanhe e gerencie todos os pedidos instantaneamente" },
  { icon: ChartBar, title: "Análises e Relatórios", desc: "Dashboard completo com métricas importantes" },
  { icon: MessageCircle, title: "Integração WhatsApp", desc: "Atendimento automatizado via WhatsApp" },
  { icon: Users, title: "Gestão de Clientes", desc: "Histórico e fidelização de clientes" },
  { icon: Zap, title: "Alta Performance", desc: "Sistema rápido e otimizado para seu negócio" },
];

const testimonials = [
  { name: "Maria Silva", restaurant: "Hamburgueria do Chef", text: "O InovaFood transformou nosso atendimento! Os pedidos nunca foram tão organizados.", avatar: "MS" },
  { name: "João Santos", restaurant: "Pizza Express", text: "A integração com WhatsApp aumentou nossas vendas em 40%. Incrível!", avatar: "JS" },
  { name: "Ana Oliveira", restaurant: "Sushi House", text: "O cardápio digital impressiona os clientes. Super profissional!", avatar: "AO" },
];

const Index = () => {
  const [currentPartner, setCurrentPartner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPartner((prev) => (prev + 1) % partners.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar-background via-sidebar-accent to-sidebar-background overflow-hidden">
      {/* Background Food Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <UtensilsCrossed className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-sidebar-foreground">InovaFood</span>
          </div>
          <Link to="/admin/login">
            <Button 
              variant="outline" 
              className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
            >
              <Shield className="w-4 h-4 mr-2" />
              Área Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="container py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-7xl font-extrabold text-sidebar-foreground leading-tight animate-fade-in">
              Gerencie seu{" "}
              <span className="text-gradient inline-block animate-pulse">restaurante</span>
              <br />com facilidade
            </h1>
            <p className="text-xl text-sidebar-foreground/70 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Plataforma completa para cardápios digitais, pedidos em tempo real e integração com WhatsApp. Tudo em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Link to="/r/inovafood-demo">
                <Button 
                  size="lg" 
                  className="gradient-primary text-primary-foreground px-8 py-6 text-lg font-semibold shadow-xl shadow-primary/30 hover:scale-105 transition-all duration-300 group"
                >
                  <Store className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Ver Loja Demo
                  <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
                >
                  Acessar Painel
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Partners Carousel */}
        <section className="py-12 border-y border-sidebar-border/30 bg-sidebar/30 backdrop-blur-sm">
          <div className="container">
            <p className="text-center text-sidebar-foreground/50 mb-8 text-sm uppercase tracking-wider">
              Integrado com as principais plataformas
            </p>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              {partners.map((partner, i) => (
                <div 
                  key={partner.name}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full bg-sidebar-accent/50 border border-sidebar-border/30 transition-all duration-500 ${
                    i === currentPartner ? "scale-110 border-primary/50 shadow-lg shadow-primary/20" : "opacity-60"
                  }`}
                >
                  <span className="text-2xl">{partner.logo}</span>
                  <span className="font-medium text-sidebar-foreground">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-sidebar-foreground mb-4">
              Recursos <span className="text-gradient">Principais</span>
            </h2>
            <p className="text-center text-sidebar-foreground/60 mb-16 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar seu restaurante de forma profissional
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div 
                  key={f.title}
                  className="group p-6 rounded-2xl bg-sidebar/50 backdrop-blur-sm border border-sidebar-border/30 hover:border-primary/50 hover:bg-sidebar/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 animate-fade-in"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
                    <f.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-sidebar-foreground mb-2">{f.title}</h3>
                  <p className="text-sidebar-foreground/60">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-sidebar/30 backdrop-blur-sm border-y border-sidebar-border/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-sidebar-foreground mb-4">
              O que nossos <span className="text-gradient">clientes</span> dizem
            </h2>
            <p className="text-center text-sidebar-foreground/60 mb-16">
              Milhares de restaurantes já transformaram seus negócios
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div 
                  key={t.name}
                  className="p-6 rounded-2xl bg-sidebar/50 backdrop-blur-sm border border-sidebar-border/30 hover:border-primary/30 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-sidebar-foreground/80 mb-6 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sidebar-foreground">{t.name}</p>
                      <p className="text-sm text-sidebar-foreground/60">{t.restaurant}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
              <h2 className="text-3xl md:text-4xl font-bold text-sidebar-foreground mb-4">
                Pronto para começar?
              </h2>
              <p className="text-sidebar-foreground/70 mb-8">
                Experimente grátis por 14 dias. Sem cartão de crédito.
              </p>
              <Link to="/r/inovafood-demo">
                <Button size="lg" className="gradient-primary text-primary-foreground px-10 py-6 text-lg font-semibold shadow-xl shadow-primary/30 hover:scale-105 transition-all duration-300">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-sidebar-border/30 bg-sidebar/30 backdrop-blur-sm">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-sidebar-foreground">InovaFood</span>
              </div>
              <p className="text-sidebar-foreground/60 text-sm">
                A plataforma completa para gestão de restaurantes e delivery.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sidebar-foreground mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-sidebar-foreground/60">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sidebar-foreground mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-sidebar-foreground/60">
                <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sidebar-foreground mb-4">Redes Sociais</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/60 hover:text-primary hover:bg-primary/20 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/60 hover:text-primary hover:bg-primary/20 transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/60 hover:text-primary hover:bg-primary/20 transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-sidebar-border/30 text-center text-sidebar-foreground/50 text-sm">
            © 2024 InovaFood. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
