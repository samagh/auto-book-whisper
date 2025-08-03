import { useState, useEffect, useCallback } from 'react';
import ePub from 'epubjs';

export interface EpubChapter {
  id: string;
  label: string;
  href: string;
  content?: string;
}

export interface EpubBook {
  title: string;
  author: string;
  chapters: EpubChapter[];
}

export const useEpubReader = () => {
  const [book, setBook] = useState<EpubBook | null>(null);
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadEpub = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const epubBook = ePub(arrayBuffer);
      
      await epubBook.ready;
      
      const navigation = await epubBook.loaded.navigation;
      const metadata = await epubBook.loaded.metadata;
      
      const chapters: EpubChapter[] = await Promise.all(
        navigation.toc.map(async (chapter: any, index: number) => {
          try {
            const section = epubBook.section(chapter.href);
            const content = await section.load(epubBook.load.bind(epubBook));
            const text = content.textContent || '';
            
            return {
              id: chapter.id || `chapter-${index}`,
              label: chapter.label || `Capítulo ${index + 1}`,
              href: chapter.href,
              content: text
            };
          } catch (error) {
            console.warn(`Error loading chapter ${index}:`, error);
            return {
              id: `chapter-${index}`,
              label: `Capítulo ${index + 1}`,
              href: chapter.href,
              content: ''
            };
          }
        })
      );

      const bookData: EpubBook = {
        title: metadata.title || 'Libro Sin Título',
        author: metadata.creator || 'Autor Desconocido',
        chapters: chapters.filter(ch => ch.content) // Solo capítulos con contenido
      };

      setBook(bookData);
      setCurrentChapter(0);
    } catch (err) {
      setError(`Error al cargar el EPUB: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentChapterContent = useCallback(() => {
    if (!book || currentChapter >= book.chapters.length) return '';
    return book.chapters[currentChapter]?.content || '';
  }, [book, currentChapter]);

  const nextChapter = useCallback(() => {
    if (book && currentChapter < book.chapters.length - 1) {
      setCurrentChapter(prev => prev + 1);
    }
  }, [book, currentChapter]);

  const previousChapter = useCallback(() => {
    if (currentChapter > 0) {
      setCurrentChapter(prev => prev - 1);
    }
  }, [currentChapter]);

  const goToChapter = useCallback((index: number) => {
    if (book && index >= 0 && index < book.chapters.length) {
      setCurrentChapter(index);
    }
  }, [book]);

  return {
    book,
    currentChapter,
    loading,
    error,
    loadEpub,
    getCurrentChapterContent,
    nextChapter,
    previousChapter,
    goToChapter
  };
};