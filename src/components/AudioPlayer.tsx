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
import { useTTS, type TTSEngine } from '@/hooks/useTTS';
import { EpubBook } from '@/hooks/useEpubReader';
import { TTSEngineSelector } from './TTSEngineSelector';
import { CurrentTextDisplay } from './CurrentTextDisplay';
import { HuggingFaceModelSelector } from './HuggingFaceModelSelector';

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
  const [engine, setEngine] = useState<TTSEngine>('native');
  const [speed, setSpeed] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [showChapters, setShowChapters] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('microsoft/speecht5_tts');
  
  
  const {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isLoading,
    progress,
    error,
    isReady,
    currentText,
    getCurrentReadingText
  } = useTTS({ engine, speed });

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

  const handleEngineChange = useCallback((newEngine: TTSEngine) => {
    if (newEngine === 'huggingface') {
      setShowModelSelector(true);
    } else {
      setEngine(newEngine);
      setShowModelSelector(false);
    }
  }, []);

  const handleModelSelect = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    setEngine('huggingface');
    setShowModelSelector(false);
  }, []);

  const handleBackFromModelSelector = useCallback(() => {
    setShowModelSelector(false);
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

      {/* Información del capítulo actual con texto que se está leyendo */}
      <Card className="bg-audio-surface border-audio-muted p-4">
        <div className="space-y-4">
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

          {/* Texto actual que se está leyendo */}
          <div className="bg-audio-background/50 border border-audio-muted rounded-lg p-4 min-h-24">
            <div className="text-center">
              {currentText ? (
                <p className="text-audio-text text-sm leading-relaxed">
                  {getCurrentReadingText?.() || currentText}
                </p>
              ) : (
                <p className="text-audio-muted text-sm italic">
                  {isPlaying ? 'Preparando texto...' : 'Presiona play para comenzar'}
                </p>
              )}
            </div>
          </div>

          {/* Porcentaje del capítulo */}
          <div className="text-center text-xs text-audio-muted">
            Progreso: {Math.round(progress)}%
          </div>
        </div>
      </Card>

      {/* Controles principales con velocidad y volumen */}
      <Card className="bg-audio-surface border-audio-muted p-6">
        <div className="space-y-6">
          {/* Controles de reproducción */}
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

          {/* Progreso */}
          <div className="w-full">
            <Slider
              value={[progress]}
              max={100}
              step={1}
              className="w-full"
              disabled={!isPlaying && progress === 0}
            />
          </div>

          {/* Controles de velocidad y volumen */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-audio-muted" />
              <span className="text-audio-text text-sm">Velocidad:</span>
              <Slider
                value={[speed]}
                min={0.5}
                max={2.0}
                step={0.1}
                onValueChange={handleSpeedChange}
                className="flex-1"
              />
              <span className="text-audio-muted text-sm min-w-10">{speed.toFixed(1)}x</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-audio-muted" />
              <span className="text-audio-text text-sm">Volumen:</span>
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="flex-1"
              />
              <span className="text-audio-muted text-sm min-w-10">{Math.round(volume * 100)}%</span>
            </div>
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

      {/* Selector de motor TTS o modelo de Hugging Face */}
      {showModelSelector ? (
        <HuggingFaceModelSelector
          onModelSelect={handleModelSelect}
          onBack={handleBackFromModelSelector}
          selectedModel={selectedModel}
          className="mt-8"
        />
      ) : (
        <TTSEngineSelector
          currentEngine={engine}
          onEngineChange={handleEngineChange}
          className="mt-8"
        />
      )}

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