const fs = require('fs');
const path = require('path');

function createWavBuffer(samples, sampleRate = 44100) {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // 'fmt ' sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // audio format (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // bits per sample

  // 'data' sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write 16-bit audio samples
  for (let i = 0; i < samples.length; i++) {
    // Clamp sample to [-1, 1]
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intVal = Math.floor(s < 0 ? s * 32768 : s * 32767);
    buffer.writeInt16LE(intVal, 44 + i * 2);
  }

  return buffer;
}

const sampleRate = 44100;

// 1. Som de Pedido Novo (Store Chime - C5, E5, G5, C6 triumphant ascending register ring)
// Duration ~ 0.85s
const duration1 = 0.85;
const numSamples1 = Math.floor(sampleRate * duration1);
const samples1 = new Float32Array(numSamples1);

const notes1 = [
  { freq: 523.25, start: 0.0, end: 0.5 },  // C5
  { freq: 659.25, start: 0.12, end: 0.6 }, // E5
  { freq: 783.99, start: 0.24, end: 0.72 },// G5
  { freq: 1046.50, start: 0.36, end: 0.85 } // C6
];

for (let i = 0; i < numSamples1; i++) {
  const t = i / sampleRate;
  let val = 0;
  for (const note of notes1) {
    if (t >= note.start && t <= note.end) {
      const noteT = t - note.start;
      const noteDur = note.end - note.start;
      // Exponential decay envelope
      const env = Math.exp(-noteT * 7) * Math.min(1, noteT * 100);
      // Fundamental + subtle harmonics for crisp bell-like metallic chime
      const wave =
        Math.sin(2 * Math.PI * note.freq * noteT) * 0.7 +
        Math.sin(2 * Math.PI * note.freq * 2 * noteT) * 0.25 +
        Math.sin(2 * Math.PI * note.freq * 3 * noteT) * 0.08;
      val += wave * env;
    }
  }
  samples1[i] = val * 0.6;
}

// 2. Som de Status Alterado (Client Update - Gentle double ping A5 -> D6)
// Duration ~ 0.6s
const duration2 = 0.6;
const numSamples2 = Math.floor(sampleRate * duration2);
const samples2 = new Float32Array(numSamples2);

const notes2 = [
  { freq: 880.0, start: 0.0, end: 0.32 },  // A5
  { freq: 1174.66, start: 0.14, end: 0.58 } // D6
];

for (let i = 0; i < numSamples2; i++) {
  const t = i / sampleRate;
  let val = 0;
  for (const note of notes2) {
    if (t >= note.start && t <= note.end) {
      const noteT = t - note.start;
      // Soft sine decay envelope
      const env = Math.exp(-noteT * 8) * Math.min(1, noteT * 150);
      const wave =
        Math.sin(2 * Math.PI * note.freq * noteT) * 0.85 +
        Math.sin(2 * Math.PI * note.freq * 2 * noteT) * 0.15;
      val += wave * env;
    }
  }
  samples2[i] = val * 0.5;
}

const soundsDir = path.join(__dirname, '../public/sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

fs.writeFileSync(path.join(soundsDir, 'novo_pedido.wav'), createWavBuffer(samples1, sampleRate));
fs.writeFileSync(path.join(soundsDir, 'status_alterado.wav'), createWavBuffer(samples2, sampleRate));

console.log('Audio files generated successfully in public/sounds/:');
console.log(' - novo_pedido.wav');
console.log(' - status_alterado.wav');
