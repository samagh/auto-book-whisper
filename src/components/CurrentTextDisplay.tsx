import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CurrentTextDisplayProps {
  currentText: string;
  getCurrentReadingText: () => string;
  isPlaying: boolean;
  className?: string;
}

export const CurrentTextDisplay: React.FC<CurrentTextDisplayProps> = ({
  currentText,
  getCurrentReadingText,
  isPlaying,
  className
}) => {
  const readingText = getCurrentReadingText();
  
  if (!currentText && !readingText) {
    return null;
  }

  return (
    <Card className={cn("bg-audio-surface border-audio-muted p-4", className)}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full transition-colors",
            isPlaying ? "bg-audio-primary animate-pulse-audio" : "bg-audio-muted"
          )} />
          <span className="text-sm text-audio-muted font-medium">
            {isPlaying ? 'Leyendo ahora' : 'Texto cargado'}
          </span>
        </div>
        
        {readingText && (
          <div className="space-y-2">
            <p className="text-xs text-audio-muted uppercase tracking-wide">
              Fragmento actual:
            </p>
            <div className="bg-audio-background rounded-lg p-3 border border-audio-muted">
              <p className="text-audio-text text-sm leading-relaxed">
                {readingText}
              </p>
            </div>
          </div>
        )}
        
        {currentText && !readingText && (
          <div className="space-y-2">
            <p className="text-xs text-audio-muted uppercase tracking-wide">
              Texto completo:
            </p>
            <div className="bg-audio-background rounded-lg p-3 border border-audio-muted max-h-32 overflow-y-auto">
              <p className="text-audio-text text-sm leading-relaxed">
                {currentText.substring(0, 200)}
                {currentText.length > 200 && '...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};