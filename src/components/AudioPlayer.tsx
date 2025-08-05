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
  ChevronRight,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTTS, type TTSEngine } from '@/hooks/useTTS';
import { EpubBook } from '@/hooks/useEpubReader';
import { TTSEngineSelector } from './TTSEngineSelector';
import { CurrentTextDisplay } from './CurrentTextDisplay';
import { HuggingFaceModelSelector } from './HuggingFaceModelSelector';
import { ThemeSelector } from './ThemeSelector';
import { ModernHeader } from './ModernHeader';

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
  const [showThemeSelector, setShowThemeSelector] = useState(false);
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
      {/* Header moderno */}
      <ModernHeader
        title={book.title}
        author={book.author}
        onSettingsClick={() => setShowThemeSelector(!showThemeSelector)}
      />

      {/* Selector de tema (si está visible) */}
      {showThemeSelector && (
        <ThemeSelector />
      )}

      {/* Información del capítulo actual con texto que se está leyendo */}
      <Card className="glass hover-lift">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPreviousChapter}
              disabled={currentChapter === 0}
              className="hover-lift h-12 w-12"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <div className="flex-1 text-center px-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <Book className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">
                  Capítulo {currentChapter + 1} de {book.chapters.length}
                </span>
              </div>
              <p className="text-lg font-semibold text-foreground truncate">
                {currentChapterInfo?.label || `Capítulo ${currentChapter + 1}`}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onNextChapter}
              disabled={currentChapter >= book.chapters.length - 1}
              className="hover-lift h-12 w-12"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Texto actual que se está leyendo */}
          <div className="glass-strong rounded-xl p-4 min-h-24">
            <div className="text-center">
              {currentText ? (
                <p className="text-foreground text-sm leading-relaxed">
                  {getCurrentReadingText?.() || currentText}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  {isPlaying ? 'Preparando texto...' : 'Presiona play para comenzar'}
                </p>
              )}
            </div>
          </div>

          {/* Progreso del capítulo con barra visual */}
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center text-xs text-muted-foreground">
              Progreso: {Math.round(progress)}%
            </div>
          </div>
        </div>
      </Card>

      {/* Controles principales modernos */}
      <Card className="glass hover-lift">
        <div className="p-6 space-y-6">
          {/* Controles de reproducción principales */}
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="secondary"
              size="lg"
              onClick={onPreviousChapter}
              disabled={currentChapter === 0}
              className="hover-lift h-14 w-14 rounded-full shadow-surface"
            >
              <SkipBack className="h-6 w-6" />
            </Button>

            <Button
              onClick={handlePlayPause}
              disabled={!isReady || !currentContent}
              className="h-20 w-20 rounded-full bg-gradient-primary shadow-glow hover-lift relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isLoading ? (
                <div className="animate-pulse text-primary-foreground text-2xl">●</div>
              ) : isPlaying ? (
                <Pause className="h-8 w-8 text-primary-foreground relative z-10" />
              ) : (
                <Play className="h-8 w-8 text-primary-foreground relative z-10" />
              )}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleStop}
              disabled={!isPlaying && progress === 0}
              className="hover-lift h-14 w-14 rounded-full shadow-surface"
            >
              <Square className="h-6 w-6" />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={onNextChapter}
              disabled={currentChapter >= book.chapters.length - 1}
              className="hover-lift h-14 w-14 rounded-full shadow-surface"
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>

          {/* Controles de velocidad y volumen en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Velocidad</span>
                <span className="text-xs bg-muted px-2 py-1 rounded-full ml-auto">{speed.toFixed(1)}x</span>
              </div>
              <Slider
                value={[speed]}
                min={0.5}
                max={2.0}
                step={0.1}
                onValueChange={handleSpeedChange}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Volume2 className="h-4 w-4" />
                <span className="text-sm font-medium">Volumen</span>
                <span className="text-xs bg-muted px-2 py-1 rounded-full ml-auto">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de capítulos moderna */}
      <Card className="glass">
        <div className="p-4 border-b border-border/50">
          <Button
            variant="ghost"
            onClick={() => setShowChapters(!showChapters)}
            className="w-full justify-between hover-lift"
          >
            <span className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Capítulos ({book.chapters.length})
            </span>
            <ChevronRight 
              className={cn(
                "h-5 w-5 transition-transform duration-300",
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
                  "w-full text-left p-4 hover:bg-muted/50 transition-all duration-200 border-b border-border/30 last:border-b-0 hover-lift",
                  currentChapter === index && "bg-primary/10 border-l-4 border-l-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-muted-foreground min-w-8 text-sm",
                    currentChapter === index && "text-primary font-semibold"
                  )}>
                    {index + 1}
                  </span>
                  <span className={cn(
                    "text-foreground",
                    currentChapter === index && "text-primary font-semibold"
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