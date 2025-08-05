import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HuggingFaceModel {
  id: string;
  name: string;
  description: string;
  size: string;
  quality: 'high' | 'medium' | 'fast';
}

const AVAILABLE_MODELS: HuggingFaceModel[] = [
  {
    id: 'microsoft/speecht5_tts',
    name: 'SpeechT5',
    description: 'Modelo equilibrado de Microsoft con buena calidad y velocidad',
    size: '~180MB',
    quality: 'medium'
  },
  {
    id: 'suno/bark',
    name: 'Bark',
    description: 'Modelo avanzado con voces muy naturales',
    size: '~1.2GB',
    quality: 'high'
  },
  {
    id: 'coqui/XTTS-v2',
    name: 'XTTS v2',
    description: 'Síntesis rápida y eficiente',
    size: '~50MB',
    quality: 'fast'
  }
];

interface HuggingFaceModelSelectorProps {
  onModelSelect: (modelId: string) => void;
  onBack: () => void;
  selectedModel?: string;
  className?: string;
}

export const HuggingFaceModelSelector: React.FC<HuggingFaceModelSelectorProps> = ({
  onModelSelect,
  onBack,
  selectedModel,
  className
}) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleModelSelect = async (model: HuggingFaceModel) => {
    setDownloading(model.id);
    // Simular descarga
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDownloading(null);
    onModelSelect(model.id);
  };

  const getQualityIcon = (quality: HuggingFaceModel['quality']) => {
    switch (quality) {
      case 'high': return <Brain className="h-4 w-4 text-green-500" />;
      case 'medium': return <Brain className="h-4 w-4 text-yellow-500" />;
      case 'fast': return <Zap className="h-4 w-4 text-blue-500" />;
    }
  };

  const getQualityText = (quality: HuggingFaceModel['quality']) => {
    switch (quality) {
      case 'high': return 'Alta calidad';
      case 'medium': return 'Calidad media';
      case 'fast': return 'Rápido';
    }
  };

  return (
    <Card className={cn("bg-audio-surface border-audio-muted p-4", className)}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="auto-ghost"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm text-audio-text font-medium">
            Seleccionar modelo de IA
          </h3>
        </div>
        
        <div className="space-y-3">
          {AVAILABLE_MODELS.map((model) => (
            <div
              key={model.id}
              className={cn(
                "border border-audio-muted rounded-lg p-3 transition-colors",
                selectedModel === model.id ? "bg-audio-background border-audio-primary" : "hover:bg-audio-background/50"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {getQualityIcon(model.quality)}
                    <h4 className="text-sm font-semibold text-audio-text">
                      {model.name}
                    </h4>
                    <span className="text-xs text-audio-muted bg-audio-background px-2 py-1 rounded">
                      {model.size}
                    </span>
                  </div>
                  
                  <p className="text-xs text-audio-muted">
                    {model.description}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-audio-muted">
                      {getQualityText(model.quality)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    variant={selectedModel === model.id ? "auto" : "auto-secondary"}
                    size="sm"
                    onClick={() => handleModelSelect(model)}
                    disabled={downloading === model.id}
                    className="min-w-20"
                  >
                    {downloading === model.id ? (
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3 animate-bounce" />
                        <span className="text-xs">...</span>
                      </div>
                    ) : selectedModel === model.id ? (
                      <span className="text-xs">Activo</span>
                    ) : (
                      <span className="text-xs">Usar</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-audio-muted text-center p-2 bg-audio-background/50 rounded-lg">
          <p>Los modelos se descargan una sola vez y se guardan en el dispositivo</p>
        </div>
      </div>
    </Card>
  );
};