import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Square,
  Volume2,
  Settings,
  Book,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTTS } from '@/hooks/useTTS';
import { EpubBook } from '@/hooks/useEpubReader';

interface AudioPlayerProps {
  book: EpubBook;
  currentChapter: number;
  currentContent: string;
  onNextChapter: () => void;
  onPreviousChapter: () => void;
  onChapterSelect: (index: number) => void;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  book,
  currentChapter,
  currentContent,
  onNextChapter,
  onPreviousChapter,
  onChapterSelect,
  className
}) => {
  const [speed, setSpeed] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [showChapters, setShowChapters] = useState(false);
  
  const {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isLoading,
    progress,
    error,
    isReady
  } = useTTS({ speed });

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (currentContent) {
      if (progress > 0) {
        resume();
      } else {
        speak(currentContent);
      }
    }
  }, [isPlaying, currentContent, progress, pause, resume, speak]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handleSpeedChange = useCallback((value: number[]) => {
    setSpeed(value[0]);
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
  }, []);

  const currentChapterInfo = book.chapters[currentChapter];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Información del libro */}
      <Card className="bg-audio-surface border-audio-muted p-6">
        <div className="text-center space-y-2">
          <h1 className="auto-text-large text-audio-text truncate">
            {book.title}
          </h1>
          <p className="text-audio-muted">
            {book.author}
          </p>
          <div className="flex items-center justify-center gap-2 text-audio-muted">
            <Book className="h-4 w-4" />
            <span>
              Capítulo {currentChapter + 1} de {book.chapters.length}
            </span>
          </div>
        </div>
      </Card>

      {/* Información del capítulo actual */}
      <Card className="bg-audio-surface border-audio-muted p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="auto-ghost"
            size="auto-large"
            onClick={onPreviousChapter}
            disabled={currentChapter === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <div className="flex-1 text-center px-4">
            <p className="auto-text-medium text-audio-text truncate">
              {currentChapterInfo?.label || `Capítulo ${currentChapter + 1}`}
            </p>
          </div>
          
          <Button
            variant="auto-ghost"
            size="auto-large"
            onClick={onNextChapter}
            disabled={currentChapter >= book.chapters.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </Card>

      {/* Progreso de reproducción */}
      <Card className="bg-audio-surface border-audio-muted p-4">
        <div className="space-y-4">
          <div className="w-full">
            <Slider
              value={[progress]}
              max={100}
              step={1}
              className="w-full"
              disabled={!isPlaying && progress === 0}
            />
          </div>
          <div className="flex justify-between text-sm text-audio-muted">
            <span>{Math.round(progress)}%</span>
            <span>
              {isLoading ? 'Cargando...' : isReady ? 'Listo' : 'Preparando...'}
            </span>
          </div>
        </div>
      </Card>

      {/* Controles principales */}
      <Card className="bg-audio-surface border-audio-muted p-6">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="auto-secondary"
            size="auto-large"
            onClick={onPreviousChapter}
            disabled={currentChapter === 0}
          >
            <SkipBack className="h-6 w-6" />
          </Button>

          <Button
            variant="auto"
            size="auto-large"
            onClick={handlePlayPause}
            disabled={!isReady || !currentContent}
            className="h-20 w-20"
          >
            {isLoading ? (
              <div className="animate-pulse-audio">●</div>
            ) : isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8" />
            )}
          </Button>

          <Button
            variant="auto-secondary"
            size="auto-large"
            onClick={handleStop}
            disabled={!isPlaying && progress === 0}
          >
            <Square className="h-6 w-6" />
          </Button>

          <Button
            variant="auto-secondary"
            size="auto-large"
            onClick={onNextChapter}
            disabled={currentChapter >= book.chapters.length - 1}
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>
      </Card>

      {/* Controles de velocidad y volumen */}
      <Card className="bg-audio-surface border-audio-muted p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Settings className="h-5 w-5 text-audio-muted" />
            <span className="text-audio-text min-w-20">Velocidad:</span>
            <Slider
              value={[speed]}
              min={0.5}
              max={2.0}
              step={0.1}
              onValueChange={handleSpeedChange}
              className="flex-1"
            />
            <span className="text-audio-muted min-w-12">{speed.toFixed(1)}x</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Volume2 className="h-5 w-5 text-audio-muted" />
            <span className="text-audio-text min-w-20">Volumen:</span>
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
            <span className="text-audio-muted min-w-12">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </Card>

      {/* Lista de capítulos */}
      <Card className="bg-audio-surface border-audio-muted">
        <div className="p-4 border-b border-audio-muted">
          <Button
            variant="auto-ghost"
            onClick={() => setShowChapters(!showChapters)}
            className="w-full justify-between"
          >
            <span>Capítulos ({book.chapters.length})</span>
            <ChevronRight 
              className={cn(
                "h-5 w-5 transition-transform",
                showChapters && "rotate-90"
              )}
            />
          </Button>
        </div>
        
        {showChapters && (
          <div className="max-h-64 overflow-y-auto">
            {book.chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                onClick={() => onChapterSelect(index)}
                className={cn(
                  "w-full text-left p-4 hover:bg-audio-background transition-colors border-b border-audio-muted last:border-b-0",
                  currentChapter === index && "bg-audio-background"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-audio-muted min-w-8">
                    {index + 1}
                  </span>
                  <span className={cn(
                    "text-audio-text",
                    currentChapter === index && "text-audio-primary font-semibold"
                  )}>
                    {chapter.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Error display */}
      {error && (
        <Card className="bg-destructive/10 border-destructive p-4">
          <p className="text-destructive text-center">
            {error}
          </p>
        </Card>
      )}
    </div>
  );
};