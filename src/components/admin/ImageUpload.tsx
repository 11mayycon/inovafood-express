import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
}

export default function ImageUpload({ value, onChange, folder = "uploads" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Erro", description: "Apenas imagens são permitidas", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Erro", description: "Imagem muito grande (máx. 5MB)", variant: "destructive" });
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from("inovafood-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("inovafood-images")
        .getPublicUrl(data.path);

      onChange(publicUrl);
      toast({ title: "Imagem enviada com sucesso!" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ title: "Erro ao enviar imagem", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const removeImage = async () => {
    if (value) {
      // Extract path from URL
      try {
        const url = new URL(value);
        const pathParts = url.pathname.split("/inovafood-images/");
        if (pathParts[1]) {
          await supabase.storage.from("inovafood-images").remove([pathParts[1]]);
        }
      } catch (e) {
        // URL might not be from our storage, just clear it
      }
    }
    onChange("");
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group">
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-40 object-cover rounded-xl border border-sidebar-border"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-1" />
              Trocar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={removeImage}
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300
            flex flex-col items-center justify-center gap-3
            ${dragActive 
              ? "border-primary bg-primary/10" 
              : "border-sidebar-border hover:border-primary/50 hover:bg-sidebar-accent/50"
            }
            ${uploading ? "pointer-events-none" : ""}
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <span className="text-sm text-sidebar-foreground/70">Enviando...</span>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-sidebar-accent flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-sidebar-foreground/50" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-sidebar-foreground">
                  Arraste uma imagem ou clique para selecionar
                </p>
                <p className="text-xs text-sidebar-foreground/50 mt-1">
                  PNG, JPG até 5MB
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
