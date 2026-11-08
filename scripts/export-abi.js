/* eslint-disable @typescript-eslint/no-require-imports */
// Derlenmiş MovieVotingDAO ABI'sini src/contracts/abis/MovieVotingDAO.ts dosyasına yazar.
const fs = require('node:fs');
const path = require('node:path');

const ARTIFACT = path.join(__dirname, '..', 'artifacts', 'contracts', 'VotingContract.sol', 'MovieVotingDAO.json');
const TARGET = path.join(__dirname, '..', 'src', 'contracts', 'abis', 'MovieVotingDAO.ts');

function exportAbi() {
  if (!fs.existsSync(ARTIFACT)) {
    throw new Error(`Artifact bulunamadı: ${ARTIFACT}. Önce "npm run compile" çalıştır.`);
  }
  const { abi } = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  const body = JSON.stringify(abi, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : `  ${line}`))
    .join('\n');
  const out = `// scripts/export-abi.js tarafından contracts/VotingContract.sol derlemesinden üretilir; elle düzenleme.\nexport const MovieVotingDAO = {\n  abi: ${body},\n} as const;\n`;
  fs.writeFileSync(TARGET, out);
  console.log(`ABI yazıldı: ${path.relative(process.cwd(), TARGET)} (${abi.length} öğe)`);
}

if (require.main === module) exportAbi();
module.exports = { exportAbi };
