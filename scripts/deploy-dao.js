/* eslint-disable @typescript-eslint/no-require-imports */
// MovieVotingDAO'yu seçilen ağa dağıtır, adresi deployments/<ağ>.json ve .env.local içine yazar, ABI'yi eşitler.
// Kullanım: npm run deploy:sepolia   (PRIVATE_KEY ve isteğe bağlı SEPOLIA_RPC_URL .env.local içinde olmalı)
const fs = require('node:fs');
const path = require('node:path');
const hre = require('hardhat');
const { exportAbi } = require('./export-abi');

const ROOT = path.join(__dirname, '..');

function upsertEnv(file, key, value) {
  const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n') : [];
  const idx = lines.findIndex((line) => line.startsWith(`${key}=`));
  if (idx >= 0) lines[idx] = `${key}=${value}`;
  else {
    if (lines.length && lines[lines.length - 1] !== '') lines.push('');
    lines.push(`${key}=${value}`);
  }
  fs.writeFileSync(file, `${lines.join('\n').replace(/\n*$/, '')}\n`);
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error('PRIVATE_KEY tanımlı değil. Dağıtım cüzdanının özel anahtarını .env.local dosyasına PRIVATE_KEY=... olarak ekle (depoya asla yazma).');
  }
  const network = await hre.ethers.provider.getNetwork();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Ağ: ${hre.network.name} (chainId ${network.chainId})`);
  console.log(`Dağıtan: ${deployer.address} · bakiye ${hre.ethers.formatEther(balance)} ETH`);
  if (balance === 0n) throw new Error('Bakiye 0. Dağıtım için Sepolia faucet’ten test ETH al.');

  const factory = await hre.ethers.getContractFactory('MovieVotingDAO');
  const dao = await factory.deploy();
  const tx = dao.deploymentTransaction();
  console.log(`Dağıtım işlemi: ${tx ? tx.hash : '?'}`);
  await dao.waitForDeployment();
  const address = await dao.getAddress();
  console.log(`MovieVotingDAO adresi: ${address}`);

  const dir = path.join(ROOT, 'deployments');
  fs.mkdirSync(dir, { recursive: true });
  const record = {
    contract: 'MovieVotingDAO',
    address,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    txHash: tx ? tx.hash : null,
    deployedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(dir, `${hre.network.name}.json`), `${JSON.stringify(record, null, 2)}\n`);

  upsertEnv(path.join(ROOT, '.env.local'), 'NEXT_PUBLIC_DAO_CONTRACT_ADDRESS', address);
  exportAbi();

  console.log('\nSonraki adımlar:');
  console.log('- Next dev sunucusunu yeniden başlat; DAO sayfası adresi doğrulayıp yazma işlemlerini açar.');
  console.log(`- İsteğe bağlı doğrulama: npx hardhat verify --network ${hre.network.name} ${address}`);
  console.log('- Vercel’de de NEXT_PUBLIC_DAO_CONTRACT_ADDRESS ortam değişkenini ayarla.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
