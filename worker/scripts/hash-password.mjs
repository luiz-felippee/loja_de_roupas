// Gera o hash da senha da equipe no formato usado pelo Worker (PBKDF2-SHA256, 100 mil iteracoes).
// Uso: node scripts/hash-password.mjs "minha-senha"
// Depois grave o resultado com: npm run staff:set-password -- "<hash>"
import { pbkdf2Sync, randomBytes } from 'node:crypto';

const senha = process.argv[2];
if (!senha || senha.length < 10) {
  console.error('Use uma senha com pelo menos 10 caracteres.');
  process.exit(1);
}

const ITERACOES = 100000;
const sal = randomBytes(16);
const hash = pbkdf2Sync(senha, sal, ITERACOES, 32, 'sha256');
console.log(`pbkdf2$${ITERACOES}$${sal.toString('base64')}$${hash.toString('base64')}`);
