import { ProductCategory } from '../types';

export interface VoiceSearchResult {
  rawTranscript: string;
  cleanedQuery: string;
  matchedCategory?: ProductCategory | 'todas';
  feedbackMessage: string;
}

/**
 * Checks if Web Speech API SpeechRecognition is supported by the current browser.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

/**
 * Normalizes text removing accents and extra spaces for matching.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Analyzes spoken Portuguese speech and identifies product categories or search keywords.
 */
export function parseVoiceQuery(rawTranscript: string): VoiceSearchResult {
  const trimmed = rawTranscript.trim();
  const normalized = normalizeText(trimmed);

  // Stop/Clear phrases
  if (
    normalized === 'todos' ||
    normalized === 'todas' ||
    normalized === 'tudo' ||
    normalized === 'limpar' ||
    normalized === 'limpar busca' ||
    normalized === 'catalogo' ||
    normalized === 'catalogo completo' ||
    normalized === 'todos os produtos' ||
    normalized === 'todas as pecas' ||
    normalized === 'todas as roupas'
  ) {
    return {
      rawTranscript: trimmed,
      cleanedQuery: '',
      matchedCategory: 'todas',
      feedbackMessage: 'Exibindo todos os produtos do catálogo'
    };
  }

  // Common spoken filler prefixes in Portuguese
  let workingQuery = trimmed.replace(
    /^(quero\s+(ver|comprar|olhar)|procure\s+por|procurar|pesquisar\s+por|pesquisar|buscar\s+por|buscar|mostra|mostre|encontre|encontrar|tem\s+ai|tem|onde\s+esta|cadê|cade)\s+/i,
    ''
  ).trim();

  const workingNormalized = normalizeText(workingQuery);

  // Category detection patterns:
  // 1. Times (camisas de time, mantos, futebol)
  const isTimesExact = /^(camisas?\s+de\s+times?|camisas?\s+de\s+futebol|times?|mantos?|manto\s+sagrado)$/i.test(workingNormalized);
  const mentionsTimes = /\b(camisas?\s+de\s+times?|times?|mantos?)\b/i.test(workingNormalized);

  // 2. Polo (camisas polo, piquet)
  const isPoloExact = /^(camisas?\s+polo|polos?|piquet)$/i.test(workingNormalized);
  const mentionsPolo = /\b(camisas?\s+polo|polos?)\b/i.test(workingNormalized);

  // 3. Bermuda (bermudas, shorts)
  const isBermudaExact = /^(bermudas?|shorts?)$/i.test(workingNormalized);
  const mentionsBermuda = /\b(bermudas?|shorts?)\b/i.test(workingNormalized);

  // 4. Regata (camisas regata, regatas, machão)
  const isRegataExact = /^(camisas?\s+regatas?|regatas?|machao|machão)$/i.test(workingNormalized);
  const mentionsRegata = /\b(camisas?\s+regatas?|regatas?|machao|machão)\b/i.test(workingNormalized);

  // Exact category requests
  if (isTimesExact) {
    return {
      rawTranscript: trimmed,
      cleanedQuery: '',
      matchedCategory: 'times',
      feedbackMessage: 'Categoria selecionada: Camisas de Times'
    };
  }
  if (isPoloExact) {
    return {
      rawTranscript: trimmed,
      cleanedQuery: '',
      matchedCategory: 'polo',
      feedbackMessage: 'Categoria selecionada: Camisas Polo'
    };
  }
  if (isBermudaExact) {
    return {
      rawTranscript: trimmed,
      cleanedQuery: '',
      matchedCategory: 'bermuda',
      feedbackMessage: 'Categoria selecionada: Bermudas'
    };
  }
  if (isRegataExact) {
    return {
      rawTranscript: trimmed,
      cleanedQuery: '',
      matchedCategory: 'regata',
      feedbackMessage: 'Categoria selecionada: Camisas Regatas'
    };
  }

  // Category + specific query combo:
  // e.g., "Bermuda preta" -> category: bermuda, query: "preta"
  // e.g., "Camisa do Flamengo" -> category: times, query: "Flamengo"
  // e.g., "Polo ouro" -> category: polo, query: "ouro"
  if (mentionsTimes) {
    const stripped = workingQuery.replace(/\b(camisas?\s+de\s+times?|camisas?\s+de\s+futebol|camisa\s+do|camisas?\s+do|times?|mantos?)\b/gi, '').trim();
    return {
      rawTranscript: trimmed,
      cleanedQuery: stripped || workingQuery,
      matchedCategory: 'times',
      feedbackMessage: stripped
        ? `Filtrando Camisas de Times por "${stripped}"`
        : 'Categoria selecionada: Camisas de Times'
    };
  }

  if (mentionsPolo) {
    const stripped = workingQuery.replace(/\b(camisas?\s+polo|polos?)\b/gi, '').trim();
    return {
      rawTranscript: trimmed,
      cleanedQuery: stripped || workingQuery,
      matchedCategory: 'polo',
      feedbackMessage: stripped
        ? `Filtrando Camisas Polo por "${stripped}"`
        : 'Categoria selecionada: Camisas Polo'
    };
  }

  if (mentionsBermuda) {
    const stripped = workingQuery.replace(/\b(bermudas?|shorts?)\b/gi, '').trim();
    return {
      rawTranscript: trimmed,
      cleanedQuery: stripped || workingQuery,
      matchedCategory: 'bermuda',
      feedbackMessage: stripped
        ? `Filtrando Bermudas por "${stripped}"`
        : 'Categoria selecionada: Bermudas'
    };
  }

  if (mentionsRegata) {
    const stripped = workingQuery.replace(/\b(camisas?\s+regatas?|regatas?)\b/gi, '').trim();
    return {
      rawTranscript: trimmed,
      cleanedQuery: stripped || workingQuery,
      matchedCategory: 'regata',
      feedbackMessage: stripped
        ? `Filtrando Regatas por "${stripped}"`
        : 'Categoria selecionada: Camisas Regatas'
    };
  }

  // Famous team / sport jersey keywords automatically matched to 'times'
  const teamKeywords = [
    'flamengo', 'corinthians', 'palmeiras', 'sao paulo', 'são paulo', 'santos',
    'gremio', 'grêmio', 'internacional', 'inter', 'vasco', 'botafogo', 'fluminense',
    'cruzeiro', 'atletico', 'atlético', 'galo', 'bahia', 'sport', 'fortaleza', 'ceara',
    'real madrid', 'barcelona', 'psg', 'paris', 'manchester', 'liverpool', 'chelsea',
    'arsenal', 'juventus', 'milan', 'bayern', 'brasil', 'selecao', 'seleção', 'argentina'
  ];

  for (const team of teamKeywords) {
    if (workingNormalized.includes(team)) {
      return {
        rawTranscript: trimmed,
        cleanedQuery: workingQuery,
        matchedCategory: 'times',
        feedbackMessage: `Filtrando Camisas de Times por "${workingQuery}"`
      };
    }
  }

  // General product search
  return {
    rawTranscript: trimmed,
    cleanedQuery: workingQuery || trimmed,
    feedbackMessage: `Buscando por "${workingQuery || trimmed}"`
  };
}

/**
 * Play a discreet audio tone on mic start/finish using Web Audio API
 */
export function playVoiceFeedbackTone(type: 'start' | 'success' | 'cancel') {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    } else {
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch {
    // Ignore audio permission or context restrictions
  }
}
