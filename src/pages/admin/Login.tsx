import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Mail, Lock, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DEMO_TENANT_ID = "11111111-1111-1111-1111-111111111111";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Erro ao entrar",
        description: error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos. Crie uma conta primeiro se ainda não tem." 
          : error.message,
        variant: "destructive"
      });
    } else {
      toast({ title: "Bem-vindo!", description: "Login realizado com sucesso" });
      navigate("/admin");
    }
    
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
        data: {
          name,
          role: "OWNER",
          tenant_id: DEMO_TENANT_ID
        }
      }
    });
    
    if (error) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive"
      });
    } else if (data.user) {
      toast({ title: "Conta criada!", description: "Você já pode fazer login" });
      // Auto login after signup
      const { error: loginError } = await signIn(email, password);
      if (!loginError) {
        navigate("/admin");
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-sidebar border-sidebar-border">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-sidebar-foreground">InovaFood</CardTitle>
            <CardDescription className="text-sidebar-foreground/60">Acesse o painel administrativo</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-sidebar-accent">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Criar Conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sidebar-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-sidebar-foreground/50" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sidebar-foreground">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-sidebar-foreground/50" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-semibold">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sidebar-foreground">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-sidebar-foreground/50" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sidebar-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-sidebar-foreground/50" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sidebar-foreground">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-sidebar-foreground/50" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-semibold">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loading ? "Criando..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-sidebar-foreground/50 mt-6">
            Crie uma conta com: maiconsillva2025@gmail.com / 1285041
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
