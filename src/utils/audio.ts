/**
 * Sound effects engine powered by Howler.js.
 * Plays distinct audio files for 'pedido novo' (store incoming alert)
 * and 'status alterado' (client order progress notification).
 */

import { Howl } from 'howler';

export class AudioManager {
  private newOrderSound: Howl | null = null;
  private statusUpdateSound: Howl | null = null;
  private fallbackCtx: AudioContext | null = null;

  constructor() {
    this.initHowls();
  }

  private initHowls() {
    if (typeof window === 'undefined') return;

    try {
      // 1. Som de Pedido Novo (Arquivo dedicado para a Loja)
      this.newOrderSound = new Howl({
        src: ['/sounds/novo_pedido.wav'],
        volume: 0.95,
        preload: true,
        format: ['wav'],
        html5: false,
        onloaderror: (_id, err) => {
          console.warn('Falha ao carregar novo_pedido.wav, fallback ativo:', err);
        }
      });

      // 2. Som de Status Alterado (Arquivo dedicado para o Cliente)
      this.statusUpdateSound = new Howl({
        src: ['/sounds/status_alterado.wav'],
        volume: 0.85,
        preload: true,
        format: ['wav'],
        html5: false,
        onloaderror: (_id, err) => {
          console.warn('Falha ao carregar status_alterado.wav, fallback ativo:', err);
        }
      });
    } catch (err) {
      console.warn('Erro ao inicializar Howler.js:', err);
    }
  }

  /**
   * Reproduz o som de Pedido Novo (para a equipe da loja)
   */
  public playNewOrderAlert(): void {
    try {
      if (this.newOrderSound) {
        this.newOrderSound.stop();
        this.newOrderSound.play();
        return;
      }
    } catch {
      // Prossegue para o sintetizador fallback se o browser bloquear áudio
    }
    this.playNewOrderFallback();
  }

  /**
   * Reproduz o som de Status Alterado (para o cliente)
   */
  public playStatusUpdateAlert(): void {
    try {
      if (this.statusUpdateSound) {
        this.statusUpdateSound.stop();
        this.statusUpdateSound.play();
        return;
      }
    } catch {
      // Prossegue para o sintetizador fallback se o browser bloquear áudio
    }
    this.playStatusUpdateFallback();
  }

  /**
   * Reproduz som suave de confirmação/sucesso
   */
  public playSuccess(): void {
    const ctx = this.getFallbackContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // ignore
    }
  }

  /**
   * Reproduz som de caixa registradora/favorito/adicionar
   */
  public playCash(): void {
    const ctx = this.getFallbackContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [659.25, 987.77].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.18, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.22);
      });
    } catch {
      // ignore
    }
  }

  // Contexto sintetizador para contingência caso o dispositivo restrinja carregamento de arquivos
  private getFallbackContext(): AudioContext | null {
    try {
      if (!this.fallbackCtx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.fallbackCtx = new AudioCtx();
        }
      }
      if (this.fallbackCtx && this.fallbackCtx.state === 'suspended') {
        this.fallbackCtx.resume();
      }
      return this.fallbackCtx;
    } catch {
      return null;
    }
  }

  private playNewOrderFallback(): void {
    const ctx = this.getFallbackContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.1);

      gain.gain.setValueAtTime(0, startTime + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.35, startTime + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.1);
      osc.stop(startTime + idx * 0.1 + 0.4);
    });
  }

  private playStatusUpdateFallback(): void {
    const ctx = this.getFallbackContext();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    const freqs = [880.0, 1174.66];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.12);

      gain.gain.setValueAtTime(0, startTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, startTime + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.12 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.12);
      osc.stop(startTime + idx * 0.12 + 0.3);
    });
  }
}

export const audioManager = new AudioManager();
export const soundEffects = audioManager;
