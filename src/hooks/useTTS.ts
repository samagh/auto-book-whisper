import { useState, useEffect, useCallback, useRef } from 'react';
import { pipeline } from '@huggingface/transformers';
import { useNativeTTS } from './useNativeTTS';

export type TTSEngine = 'native' | 'huggingface';

export interface TTSOptions {
  engine?: TTSEngine;
  model?: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

export const useTTS = (options: TTSOptions = {}) => {
  const { engine = 'native' } = options;
  
  // Hook para TTS nativo
  const nativeTTS = useNativeTTS({
    speed: options.speed,
    pitch: options.pitch,
    volume: 0.8
  });

  // Estados para Hugging Face TTS
  const [hfIsPlaying, setHfIsPlaying] = useState(false);
  const [hfIsLoading, setHfIsLoading] = useState(false);
  const [hfProgress, setHfProgress] = useState(0);
  const [hfError, setHfError] = useState<string | null>(null);
  const [synthesizer, setSynthesizer] = useState<any>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  
  const {
    model = 'microsoft/speecht5_tts',
    speed = 1.0,
    pitch = 1.0
  } = options;

  // Inicializar el modelo TTS de Hugging Face solo si se necesita
  useEffect(() => {
    if (engine !== 'huggingface') return;
    const initTTS = async () => {
      try {
        setHfIsLoading(true);
        // Usando el modelo de Microsoft SpeechT5 que es más ligero para el navegador
        const tts = await pipeline('text-to-speech', model, {
          device: 'webgpu', // Intentar usar WebGPU si está disponible
        });
        setSynthesizer(tts);
      } catch (err) {
        console.warn('WebGPU no disponible, usando CPU:', err);
        try {
          // Fallback a CPU
          const tts = await pipeline('text-to-speech', model);
          setSynthesizer(tts);
        } catch (cpuErr) {
          setHfError(`Error al cargar modelo TTS: ${cpuErr instanceof Error ? cpuErr.message : 'Error desconocido'}`);
        }
      } finally {
        setHfIsLoading(false);
      }
    };

    initTTS();
  }, [model, engine]);

  // Función para convertir texto a audio con Hugging Face
  const speakWithHuggingFace = useCallback(async (text: string) => {
    if (!synthesizer) {
      setHfError('Modelo TTS no está listo');
      return;
    }

    if (!text.trim()) {
      setHfError('Texto vacío');
      return;
    }

    try {
      setHfIsLoading(true);
      setHfError(null);

      // Dividir el texto en chunks más pequeños para mejor rendimiento
      const chunks = text.match(/.{1,200}(?:\s|$)/g) || [text];
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Generar audio para el primer chunk (demo)
      const firstChunk = chunks[0];
      const result = await synthesizer(firstChunk);
      
      // El resultado puede variar según el modelo, necesitamos adaptarlo
      let audioData: Float32Array;
      
      if (result.audio instanceof Float32Array) {
        audioData = result.audio;
      } else if (Array.isArray(result.audio)) {
        audioData = new Float32Array(result.audio);
      } else {
        throw new Error('Formato de audio no compatible');
      }

      // Crear AudioBuffer
      const sampleRate = result.sampling_rate || 16000;
      const audioBuffer = audioContextRef.current.createBuffer(1, audioData.length, sampleRate);
      audioBuffer.getChannelData(0).set(audioData);
      
      audioBufferRef.current = audioBuffer;
      
      // Reproducir audio
      playAudioBuffer();
      
    } catch (err) {
      setHfError(`Error en síntesis de voz: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setHfIsLoading(false);
    }
  }, [synthesizer]);

  const playAudioBuffer = useCallback(() => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    if (sourceRef.current) {
      sourceRef.current.stop();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);
    
    // Aplicar velocidad
    source.playbackRate.value = speed;
    
    source.onended = () => {
      setHfIsPlaying(false);
      setHfProgress(0);
    };

    const startOffset = pauseTimeRef.current;
    source.start(0, startOffset);
    startTimeRef.current = audioContextRef.current.currentTime - startOffset;
    
    sourceRef.current = source;
    setHfIsPlaying(true);

    // Actualizar progreso
    const updateProgress = () => {
      if (hfIsPlaying && audioBufferRef.current) {
        const elapsed = audioContextRef.current!.currentTime - startTimeRef.current;
        const duration = audioBufferRef.current.duration;
        setHfProgress(Math.min((elapsed / duration) * 100, 100));
        
        if (elapsed < duration) {
          requestAnimationFrame(updateProgress);
        }
      }
    };
    updateProgress();
  }, [speed, hfIsPlaying]);

  const pauseHuggingFace = useCallback(() => {
    if (sourceRef.current && audioContextRef.current) {
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
      pauseTimeRef.current = elapsed;
      sourceRef.current.stop();
      setHfIsPlaying(false);
    }
  }, []);

  const resumeHuggingFace = useCallback(() => {
    if (audioBufferRef.current && !hfIsPlaying) {
      playAudioBuffer();
    }
  }, [playAudioBuffer, hfIsPlaying]);

  const stopHuggingFace = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
    }
    setHfIsPlaying(false);
    setHfProgress(0);
    pauseTimeRef.current = 0;
  }, []);

  // Funciones principales que delegan según el engine
  const speak = useCallback(async (text: string) => {
    if (engine === 'native') {
      return nativeTTS.speak(text);
    } else {
      return speakWithHuggingFace(text);
    }
  }, [engine, nativeTTS.speak, speakWithHuggingFace]);

  const pause = useCallback(() => {
    if (engine === 'native') {
      return nativeTTS.pause();
    } else {
      return pauseHuggingFace();
    }
  }, [engine, nativeTTS.pause, pauseHuggingFace]);

  const resume = useCallback(() => {
    if (engine === 'native') {
      return nativeTTS.resume();
    } else {
      return resumeHuggingFace();
    }
  }, [engine, nativeTTS.resume, resumeHuggingFace]);

  const stop = useCallback(() => {
    if (engine === 'native') {
      return nativeTTS.stop();
    } else {
      return stopHuggingFace();
    }
  }, [engine, nativeTTS.stop, stopHuggingFace]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Retornar valores según el engine seleccionado
  const currentValues = engine === 'native' ? {
    isPlaying: nativeTTS.isPlaying,
    isLoading: false,
    progress: nativeTTS.progress,
    error: nativeTTS.error,
    isReady: nativeTTS.isReady,
    currentText: nativeTTS.currentText,
    getCurrentReadingText: nativeTTS.getCurrentReadingText
  } : {
    isPlaying: hfIsPlaying,
    isLoading: hfIsLoading,
    progress: hfProgress,
    error: hfError,
    isReady: !!synthesizer,
    currentText: '',
    getCurrentReadingText: () => ''
  };

  return {
    speak,
    pause,
    resume,
    stop,
    ...currentValues,
    engine
  };
};