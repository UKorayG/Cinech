/* eslint-disable @typescript-eslint/no-require-imports */
// Hardhat yapılandırması (CommonJS: Next'in tsconfig'i ESM olduğu için .ts yerine .js).
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
require('@nomicfoundation/hardhat-ethers');
require('@nomicfoundation/hardhat-verify');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.20',
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  paths: { sources: './contracts', artifacts: './artifacts', cache: './cache' },
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
      // Dağıtım cüzdanının özel anahtarı yalnızca .env.local içinde durur; depoya asla girmez.
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: { apiKey: process.env.ETHERSCAN_API_KEY || '' },
  sourcify: { enabled: false },
};
