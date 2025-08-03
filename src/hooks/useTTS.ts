import { useState, useEffect, useCallback, useRef } from 'react';
import { pipeline } from '@huggingface/transformers';

export interface TTSOptions {
  model?: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

export const useTTS = (options: TTSOptions = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
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

  // Inicializar el modelo TTS
  useEffect(() => {
    const initTTS = async () => {
      try {
        setIsLoading(true);
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
          setError(`Error al cargar modelo TTS: ${cpuErr instanceof Error ? cpuErr.message : 'Error desconocido'}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initTTS();
  }, [model]);

  // Función para convertir texto a audio
  const speak = useCallback(async (text: string) => {
    if (!synthesizer) {
      setError('Modelo TTS no está listo');
      return;
    }

    if (!text.trim()) {
      setError('Texto vacío');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

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
      setError(`Error en síntesis de voz: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
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
      setIsPlaying(false);
      setProgress(0);
    };

    const startOffset = pauseTimeRef.current;
    source.start(0, startOffset);
    startTimeRef.current = audioContextRef.current.currentTime - startOffset;
    
    sourceRef.current = source;
    setIsPlaying(true);

    // Actualizar progreso
    const updateProgress = () => {
      if (isPlaying && audioBufferRef.current) {
        const elapsed = audioContextRef.current!.currentTime - startTimeRef.current;
        const duration = audioBufferRef.current.duration;
        setProgress(Math.min((elapsed / duration) * 100, 100));
        
        if (elapsed < duration) {
          requestAnimationFrame(updateProgress);
        }
      }
    };
    updateProgress();
  }, [speed, isPlaying]);

  const pause = useCallback(() => {
    if (sourceRef.current && audioContextRef.current) {
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
      pauseTimeRef.current = elapsed;
      sourceRef.current.stop();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioBufferRef.current && !isPlaying) {
      playAudioBuffer();
    }
  }, [playAudioBuffer, isPlaying]);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
    }
    setIsPlaying(false);
    setProgress(0);
    pauseTimeRef.current = 0;
  }, []);

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

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isLoading,
    progress,
    error,
    isReady: !!synthesizer
  };
};