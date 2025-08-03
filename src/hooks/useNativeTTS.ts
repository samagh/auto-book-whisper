import { useState, useEffect, useCallback, useRef } from 'react';

export interface NativeTTSOptions {
  voice?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
}

export const useNativeTTS = (options: NativeTTSOptions = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string>('');
  const [currentPosition, setCurrentPosition] = useState(0);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textChunksRef = useRef<string[]>([]);
  const currentChunkRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    speed = 1.0,
    pitch = 1.0,
    volume = 0.8
  } = options;

  // Verificar soporte para Speech Synthesis
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setError('Speech Synthesis no soportado en este navegador');
    }
  }, []);

  // Dividir texto en chunks más pequeños para mejor control
  const splitTextIntoChunks = useCallback((text: string): string[] => {
    // Dividir por oraciones, máximo 200 caracteres por chunk
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
    const chunks: string[] = [];
    
    for (const sentence of sentences) {
      if (sentence.length <= 200) {
        chunks.push(sentence.trim());
      } else {
        // Dividir oraciones largas por comas o espacios
        const subChunks = sentence.match(/.{1,200}(?:\s|$)/g) || [sentence];
        chunks.push(...subChunks.map(chunk => chunk.trim()));
      }
    }
    
    return chunks.filter(chunk => chunk.length > 0);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) {
      setError('Texto vacío');
      return;
    }

    if (!('speechSynthesis' in window)) {
      setError('Speech Synthesis no soportado');
      return;
    }

    try {
      setError(null);
      setCurrentText(text);
      setCurrentPosition(0);
      
      // Detener cualquier síntesis anterior
      speechSynthesis.cancel();
      
      // Dividir texto en chunks
      const chunks = splitTextIntoChunks(text);
      textChunksRef.current = chunks;
      currentChunkRef.current = 0;
      
      setIsPlaying(true);
      setIsPaused(false);
      
      // Empezar a hablar el primer chunk
      speakNextChunk();
      
    } catch (err) {
      setError(`Error en síntesis de voz: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  }, [speed, pitch, volume]);

  const speakNextChunk = useCallback(() => {
    const chunks = textChunksRef.current;
    const currentIndex = currentChunkRef.current;
    
    if (currentIndex >= chunks.length) {
      // Terminamos de leer todo
      setIsPlaying(false);
      setProgress(100);
      setCurrentPosition(chunks.join(' ').length);
      return;
    }

    const chunk = chunks[currentIndex];
    const utterance = new SpeechSynthesisUtterance(chunk);
    
    // Configurar voz
    const voices = speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => 
      voice.lang.startsWith('es') || voice.name.includes('Spanish')
    );
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
    
    // Configurar parámetros
    utterance.rate = speed;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    // Eventos
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      currentChunkRef.current++;
      
      // Actualizar progreso
      const totalText = chunks.join(' ');
      const spokenText = chunks.slice(0, currentChunkRef.current).join(' ');
      const newProgress = (spokenText.length / totalText.length) * 100;
      setProgress(newProgress);
      setCurrentPosition(spokenText.length);
      
      // Continuar con el siguiente chunk
      speakNextChunk();
    };
    
    utterance.onerror = (event) => {
      setError(`Error en la síntesis: ${event.error}`);
      setIsPlaying(false);
    };
    
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [speed, pitch, volume]);

  const pause = useCallback(() => {
    if ('speechSynthesis' in window && speechSynthesis.speaking) {
      speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if ('speechSynthesis' in window && speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentPosition(0);
    setCurrentText('');
    currentChunkRef.current = 0;
    textChunksRef.current = [];
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Obtener el texto actual que se está leyendo
  const getCurrentReadingText = useCallback(() => {
    if (!currentText || currentPosition === 0) return '';
    
    const chunks = textChunksRef.current;
    const currentIndex = currentChunkRef.current;
    
    if (currentIndex < chunks.length) {
      return chunks[currentIndex];
    }
    
    return '';
  }, [currentText, currentPosition]);

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    progress,
    error,
    currentText,
    currentPosition,
    getCurrentReadingText,
    isReady: 'speechSynthesis' in window
  };
};