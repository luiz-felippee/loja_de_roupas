import { useState, useEffect, useRef, useCallback } from 'react';
import {
  isSpeechRecognitionSupported,
  parseVoiceQuery,
  playVoiceFeedbackTone,
  VoiceSearchResult
} from '../utils/speechRecognition';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
}

interface UseVoiceSearchOptions {
  onSearchResult?: (result: VoiceSearchResult) => void;
  onErrorToast?: (title: string, description: string) => void;
}

export function useVoiceSearch({ onSearchResult, onErrorToast }: UseVoiceSearchOptions = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastResult, setLastResult] = useState<VoiceSearchResult | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isExplicitStopRef = useRef(false);

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());
  }, []);

  const stopListening = useCallback(() => {
    isExplicitStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition already stopped
      }
    }
    setIsListening(false);
    playVoiceFeedbackTone('cancel');
  }, []);

  const startListening = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      if (onErrorToast) {
        onErrorToast(
          'Reconhecimento de Voz Não Suportado',
          'Seu navegador não oferece suporte à Web Speech API. Recomendamos usar o Google Chrome, Edge ou Safari.'
        );
      }
      return;
    }

    // If currently listening, toggle off
    if (isListening) {
      stopListening();
      return;
    }

    try {
      const SpeechRecognitionConstructor =
        (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) return;

      // Abort any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      isExplicitStopRef.current = false;
      setTranscript('');
      setInterimTranscript('');

      recognition.onstart = () => {
        setIsListening(true);
        playVoiceFeedbackTone('start');
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final) {
          const recognizedText = final.trim();
          setTranscript(recognizedText);
          setInterimTranscript('');
          playVoiceFeedbackTone('success');

          const parsed = parseVoiceQuery(recognizedText);
          setLastResult(parsed);

          if (onSearchResult) {
            onSearchResult(parsed);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        setIsListening(false);
        setInterimTranscript('');

        if (isExplicitStopRef.current) return;

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          if (onErrorToast) {
            onErrorToast(
              'Acesso ao Microfone Negado',
              'Por favor, permita o acesso ao microfone no seu navegador para pesquisar peças por voz.'
            );
          }
        } else if (event.error === 'no-speech') {
          if (onErrorToast) {
            onErrorToast(
              'Nenhuma Voz Detectada',
              'Não ouvimos nenhuma palavra. Clique no microfone e tente falar novamente.'
            );
          }
        } else if (event.error === 'audio-capture') {
          if (onErrorToast) {
            onErrorToast(
              'Microfone Não Encontrado',
              'Não foi possível encontrar um microfone ativo no seu dispositivo.'
            );
          }
        } else if (event.error !== 'aborted') {
          if (onErrorToast) {
            onErrorToast(
              'Falha no Reconhecimento de Voz',
              'Ocorreu um erro ao processar sua voz. Tente novamente.'
            );
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Erro ao iniciar reconhecimento de voz:', err);
      setIsListening(false);
      if (onErrorToast) {
        onErrorToast(
          'Erro ao Ativar Microfone',
          'Não foi possível ativar o microfone neste momento.'
        );
      }
    }
  }, [isListening, onErrorToast, onSearchResult, stopListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    lastResult,
    startListening,
    stopListening
  };
}
