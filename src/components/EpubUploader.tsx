import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Sparkles, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EpubUploaderProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
  className?: string;
}

export const EpubUploader: React.FC<EpubUploaderProps> = ({
  onFileSelect,
  loading = false,
  className
}) => {
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/epub+zip') {
      onFileSelect(file);
    } else {
      alert('Por favor selecciona un archivo EPUB válido');
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/epub+zip') {
      onFileSelect(file);
    } else {
      alert('Por favor arrastra un archivo EPUB válido');
    }
  }, [onFileSelect]);

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header moderno con gradiente */}
      <div className="text-center space-y-6 relative">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-hero rounded-3xl blur-3xl opacity-20" />
          <div className="relative glass-strong rounded-3xl p-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow">
                <Car className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="p-3 bg-gradient-accent rounded-2xl shadow-glow">
                <Sparkles className="h-8 w-8 text-accent-foreground" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Audio Auto
            </h1>
            <p className="text-lg text-muted-foreground">
              Audiolibros inteligentes para tu viaje
            </p>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <FileText className="h-8 w-8 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Listo para comenzar
            </h2>
          </div>
          <p className="text-muted-foreground">
            Carga tu archivo EPUB y disfruta de la experiencia de audio más avanzada
          </p>
        </div>
      </div>

      {/* Zona de carga moderna */}
      <div
        className="glass hover-lift border-2 border-dashed border-border/50 hover:border-primary/50 rounded-2xl p-12 text-center transition-all duration-300 group"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Upload className="mx-auto h-16 w-16 text-primary relative z-10 transition-transform group-hover:scale-110" />
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              Arrastra tu archivo EPUB aquí
            </p>
            <p className="text-sm text-muted-foreground">
              o selecciona uno desde tu dispositivo
            </p>
          </div>
          
          <label className="block">
            <input
              type="file"
              accept=".epub"
              onChange={handleFileSelect}
              className="hidden"
              disabled={loading}
            />
            <Button 
              size="lg"
              disabled={loading}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-3"
              asChild
            >
              <span className="flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Seleccionar EPUB
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Información adicional */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span>EPUB compatible</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span>Android Auto optimizado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-secondary rounded-full" />
            <span>TTS inteligente</span>
          </div>
        </div>
      </div>
    </div>
  );
};