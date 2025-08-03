import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
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
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-4">
        <FileText className="mx-auto h-24 w-24 text-audio-muted" />
        <div>
          <h2 className="auto-text-large text-audio-text">
            Audiolibros Android Auto
          </h2>
          <p className="auto-text-medium text-audio-muted mt-2">
            Carga tu archivo EPUB para escucharlo en tu auto
          </p>
        </div>
      </div>

      <div
        className="border-2 border-dashed border-audio-muted rounded-xl p-8 text-center hover:border-audio-primary transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-audio-muted mb-4" />
        <p className="text-audio-text mb-4">
          Arrastra tu archivo EPUB aquí o selecciona uno
        </p>
        
        <label>
          <input
            type="file"
            accept=".epub"
            onChange={handleFileSelect}
            className="hidden"
            disabled={loading}
          />
          <Button 
            variant="auto" 
            size="auto-wide"
            disabled={loading}
            asChild
          >
            <span>
              {loading ? 'Cargando...' : 'Seleccionar EPUB'}
            </span>
          </Button>
        </label>
      </div>

      <div className="text-center">
        <p className="text-sm text-audio-muted">
          Formatos soportados: EPUB • Optimizado para Android Auto
        </p>
      </div>
    </div>
  );
};