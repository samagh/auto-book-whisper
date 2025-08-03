import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Smartphone, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TTSEngine } from '@/hooks/useTTS';

interface TTSEngineSelectorProps {
  currentEngine: TTSEngine;
  onEngineChange: (engine: TTSEngine) => void;
  className?: string;
}

export const TTSEngineSelector: React.FC<TTSEngineSelectorProps> = ({
  currentEngine,
  onEngineChange,
  className
}) => {
  return (
    <Card className={cn("bg-audio-surface border-audio-muted p-4", className)}>
      <div className="space-y-3">
        <h3 className="text-sm text-audio-muted font-medium uppercase tracking-wide">
          Motor de voz
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={currentEngine === 'native' ? 'auto' : 'auto-secondary'}
            size="auto-wide"
            onClick={() => onEngineChange('native')}
            className="flex flex-col gap-2 h-auto py-3"
          >
            <Smartphone className="h-5 w-5" />
            <div className="text-center">
              <div className="text-sm font-semibold">Nativo</div>
              <div className="text-xs opacity-75">Android/Sistema</div>
            </div>
          </Button>
          
          <Button
            variant={currentEngine === 'huggingface' ? 'auto' : 'auto-secondary'}
            size="auto-wide"
            onClick={() => onEngineChange('huggingface')}
            className="flex flex-col gap-2 h-auto py-3"
          >
            <Brain className="h-5 w-5" />
            <div className="text-center">
              <div className="text-sm font-semibold">IA</div>
              <div className="text-xs opacity-75">Hugging Face</div>
            </div>
          </Button>
        </div>
        
        <div className="text-xs text-audio-muted text-center">
          {currentEngine === 'native' ? (
            <span>Usando síntesis de voz del sistema</span>
          ) : (
            <span>Usando modelo de IA (requiere descarga inicial)</span>
          )}
        </div>
      </div>
    </Card>
  );
};