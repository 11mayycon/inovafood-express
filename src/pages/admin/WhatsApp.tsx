import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, QrCode, RefreshCw, CheckCircle2, XCircle, 
  Wifi, WifiOff, Clock, Loader2, Smartphone, Bot
} from "lucide-react";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface WhatsAppConnection {
  id: string;
  status: string;
  qr_code: string | null;
  connected_at: string | null;
  last_activity: string | null;
  created_at: string;
}

export default function AdminWhatsApp() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [connection, setConnection] = useState<WhatsAppConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    if (profile?.tenant_id) fetchConnection();
  }, [profile]);

  const fetchConnection = async () => {
    const { data } = await supabase
      .from("whatsapp_connections")
      .select("*")
      .eq("tenant_id", profile!.tenant_id)
      .maybeSingle();
    
    if (data) {
      setConnection(data as WhatsAppConnection);
      setStatus(data.status as ConnectionStatus);
    }
    setLoading(false);
  };

  const generateQRCode = async () => {
    setGenerating(true);
    setStatus("connecting");
    
    // Simulate QR code generation (in real app, this would call WhatsApp API)
    const fakeQR = `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <rect fill="white" width="200" height="200"/>
        <rect fill="black" x="20" y="20" width="40" height="40"/>
        <rect fill="black" x="140" y="20" width="40" height="40"/>
        <rect fill="black" x="20" y="140" width="40" height="40"/>
        <rect fill="black" x="80" y="80" width="40" height="40"/>
        <rect fill="black" x="30" y="30" width="20" height="20" fill="white"/>
        <rect fill="black" x="150" y="30" width="20" height="20" fill="white"/>
        <rect fill="black" x="30" y="150" width="20" height="20" fill="white"/>
        <text x="100" y="190" text-anchor="middle" font-size="10">QR Code Demo</text>
      </svg>
    `)}`;

    try {
      if (connection) {
        await supabase
          .from("whatsapp_connections")
          .update({ qr_code: fakeQR, status: "connecting", updated_at: new Date().toISOString() })
          .eq("id", connection.id);
      } else {
        await supabase
          .from("whatsapp_connections")
          .insert({ 
            tenant_id: profile!.tenant_id, 
            qr_code: fakeQR, 
            status: "connecting" 
          });
      }
      
      toast({ title: "QR Code gerado!", description: "Escaneie com seu WhatsApp" });
      fetchConnection();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const confirmConnection = async () => {
    setStatus("connected");
    
    await supabase
      .from("whatsapp_connections")
      .update({ 
        status: "connected", 
        connected_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        qr_code: null 
      })
      .eq("id", connection!.id);
    
    toast({ title: "Conectado!", description: "WhatsApp vinculado com sucesso" });
    fetchConnection();
  };

  const restartConnection = async () => {
    setStatus("disconnected");
    
    if (connection) {
      await supabase
        .from("whatsapp_connections")
        .update({ 
          status: "disconnected", 
          qr_code: null,
          connected_at: null 
        })
        .eq("id", connection.id);
    }
    
    toast({ title: "Conexão reiniciada" });
    fetchConnection();
  };

  const StatusIndicator = () => {
    switch (status) {
      case "connected":
        return (
          <div className="flex items-center gap-2 text-green-500">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <Wifi className="w-5 h-5" />
            <span className="font-medium">Conectado</span>
          </div>
        );
      case "connecting":
        return (
          <div className="flex items-center gap-2 text-yellow-500">
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Conectando...</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2 text-red-500">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Erro na conexão</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-sidebar-foreground/50">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">Desconectado</span>
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-sidebar-foreground">Conexão WhatsApp</h2>
            <p className="text-sidebar-foreground/60">Gerencie a integração com WhatsApp</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code Card */}
          <Card className="bg-sidebar border-sidebar-border">
            <CardHeader>
              <CardTitle className="text-sidebar-foreground flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code
              </CardTitle>
              <CardDescription className="text-sidebar-foreground/60">
                Escaneie o código com seu WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : connection?.qr_code && status === "connecting" ? (
                <div className="relative">
                  <div className="bg-white p-4 rounded-xl flex items-center justify-center">
                    <img 
                      src={connection.qr_code} 
                      alt="QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Aguardando leitura...
                    </div>
                  </div>
                </div>
              ) : status === "connected" ? (
                <div className="h-64 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sidebar-foreground">WhatsApp Conectado</p>
                    <p className="text-sm text-sidebar-foreground/60">
                      Seu bot está ativo e recebendo mensagens
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-sidebar-border rounded-xl">
                  <div className="w-20 h-20 rounded-full bg-sidebar-accent flex items-center justify-center">
                    <Smartphone className="w-10 h-10 text-sidebar-foreground/30" />
                  </div>
                  <div>
                    <p className="font-semibold text-sidebar-foreground">Nenhum QR Code</p>
                    <p className="text-sm text-sidebar-foreground/60">
                      Clique abaixo para gerar um novo código
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={generateQRCode} 
                  disabled={generating || status === "connected"}
                  className="flex-1 gradient-primary"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <QrCode className="w-4 h-4 mr-2" />
                  )}
                  {status === "connecting" ? "Gerar Novo QR" : "Gerar QR Code"}
                </Button>
                
                {status === "connecting" && (
                  <Button onClick={confirmConnection} variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirmar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="bg-sidebar border-sidebar-border">
            <CardHeader>
              <CardTitle className="text-sidebar-foreground flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Status da Conexão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-sidebar-accent">
                <StatusIndicator />
              </div>

              {connection?.connected_at && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sidebar-foreground/60 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Conectado em
                    </span>
                    <span className="text-sidebar-foreground">
                      {new Date(connection.connected_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  {connection.last_activity && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-sidebar-foreground/60 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Última atividade
                      </span>
                      <span className="text-sidebar-foreground">
                        {new Date(connection.last_activity).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={restartConnection} 
                variant="outline" 
                className="w-full border-sidebar-border text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reiniciar Conexão
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bot Animation */}
        <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
          <CardContent className="p-8 flex items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-xl shadow-primary/30 animate-pulse">
                <Bot className="w-12 h-12 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-sidebar-foreground mb-2">
                Atendimento Automático 24/7
              </h3>
              <p className="text-sidebar-foreground/70">
                Seu robô de atendimento responde automaticamente às mensagens dos clientes,
                envia cardápio, registra pedidos e muito mais.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
