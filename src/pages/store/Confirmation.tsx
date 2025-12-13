import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Search } from "lucide-react";

export default function StoreConfirmation() {
  const { slug, code } = useParams();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-primary-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Pedido Recebido!</h1>
      <p className="text-muted-foreground mb-4">Seu pedido foi enviado com sucesso</p>
      <div className="bg-card rounded-xl border p-6 mb-6">
        <p className="text-sm text-muted-foreground">Código do pedido</p>
        <p className="text-3xl font-bold text-primary">#{code}</p>
      </div>
      <div className="flex gap-4">
        <Link to={`/r/${slug}`}><Button variant="outline"><Home className="mr-2" />Início</Button></Link>
        <Link to={`/track/${code}`}><Button className="gradient-primary"><Search className="mr-2" />Acompanhar</Button></Link>
      </div>
    </div>
  );
}
