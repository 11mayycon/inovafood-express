import { ReactNode, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, Image, Settings, LogOut, Menu, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Pedidos" },
  { href: "/admin/menu", icon: UtensilsCrossed, label: "Cardápio" },
  { href: "/admin/customers", icon: Users, label: "Clientes" },
  { href: "/admin/banners", icon: Image, label: "Banners" },
  { href: "/admin/settings", icon: Settings, label: "Configurações" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <div className="animate-pulse text-sidebar-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex gradient-dark">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-sidebar-foreground">InovaFood</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                    isActive 
                      ? "gradient-primary text-primary-foreground" 
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                {profile?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.name || "Usuário"}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{profile?.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-sidebar-border bg-sidebar/50 backdrop-blur-xl flex items-center px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden text-sidebar-foreground mr-4" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-sidebar-foreground">
            {navItems.find(n => n.href === location.pathname)?.label || "Admin"}
          </h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
