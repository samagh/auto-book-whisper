import React from 'react';
import { EpubUploader } from '@/components/EpubUploader';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useEpubReader } from '@/hooks/useEpubReader';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const {
    book,
    currentChapter,
    loading,
    error,
    loadEpub,
    getCurrentChapterContent,
    nextChapter,
    previousChapter,
    goToChapter
  } = useEpubReader();

  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    try {
      await loadEpub(file);
      toast({
        title: "EPUB cargado",
        description: "Tu audiolibro está listo para reproducir",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo cargar el archivo EPUB",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-audio-background p-4">
        <div className="text-center space-y-4">
          <h1 className="auto-text-large text-destructive">Error</h1>
          <p className="text-audio-muted">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-audio-primary hover:underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-audio-background">
      <div className="container mx-auto p-4 max-w-2xl">
        {!book ? (
          <div className="flex items-center justify-center min-h-screen">
            <EpubUploader
              onFileSelect={handleFileSelect}
              loading={loading}
              className="w-full max-w-md"
            />
          </div>
        ) : (
          <div className="py-6">
            <AudioPlayer
              book={book}
              currentChapter={currentChapter}
              currentContent={getCurrentChapterContent()}
              onNextChapter={nextChapter}
              onPreviousChapter={previousChapter}
              onChapterSelect={goToChapter}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;