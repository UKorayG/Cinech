'use client';

import { ShieldAlert, ShieldCheck, Loader2, ExternalLink, Wallet } from 'lucide-react';
import type { useDaoContract } from '@/hooks/useDaoContract';
import { useLanguage } from '@/contexts/LanguageContext';

type Contract = ReturnType<typeof useDaoContract>;

const TEXT = {
  unconfigured: {
    tr: 'Zincir işlemleri kapalı: DAO sözleşme adresi tanımlı değil. Sözleşmeyi Sepolia’ya dağıtıp adresi .env.local içine NEXT_PUBLIC_DAO_CONTRACT_ADDRESS olarak ekle (npm run deploy:sepolia bunu kendisi yapar).',
    en: 'On-chain actions are off: no DAO contract address is configured. Deploy the contract to Sepolia and set NEXT_PUBLIC_DAO_CONTRACT_ADDRESS in .env.local (npm run deploy:sepolia does it for you).',
  },
  checking: { tr: 'Sözleşme Sepolia’da doğrulanıyor…', en: 'Verifying the contract on Sepolia…' },
  unreachable: {
    tr: 'Sepolia RPC’ye ulaşılamadı; sözleşme doğrulanamadığı için zincir işlemleri kapalı.',
    en: 'Could not reach the Sepolia RPC; on-chain actions stay off until the contract is verified.',
  },
  'no-code': { tr: 'Yapılandırılan adreste Sepolia’da sözleşme yok. Adresi kontrol et.', en: 'There is no contract at the configured address on Sepolia. Check the address.' },
  foreign: {
    tr: 'Yapılandırılan adresteki sözleşme Cinech DAO değil: oylama fonksiyonlarını taşımıyor. Güvenlik için zincir işlemleri kapatıldı.',
    en: 'The contract at the configured address is not the Cinech DAO: it has no voting functions. On-chain actions are disabled for safety.',
  },
  ready: { tr: 'Sözleşme doğrulandı', en: 'Contract verified' },
  connect: { tr: 'Oy vermek ve teklif açmak için cüzdanını bağla.', en: 'Connect your wallet to vote and open proposals.' },
  switch: { tr: 'Cüzdanın Sepolia ağında değil; üst çubuktan ağı değiştir.', en: 'Your wallet is not on Sepolia; switch networks from the top bar.' },
  etherscan: { tr: 'Etherscan’de aç', en: 'Open on Etherscan' },
} as const;

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/** DAO sayfasının üstünde sözleşme durumu: doğrulandı rozeti ya da yazma işlemlerinin neden kapalı olduğu. */
export default function ContractNotice({ contract }: { readonly contract: Contract }) {
  const { language } = useLanguage();
  const en = language === 'en';
  const t = (k: keyof typeof TEXT) => (en ? TEXT[k].en : TEXT[k].tr);

  if (contract.status === 'ready') {
    const hint = !contract.isConnected ? t('connect') : !contract.onActiveChain ? t('switch') : null;
    return (
      <div className="mx-auto mb-10 flex max-w-3xl flex-wrap items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-cinech-cream/70">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-cinech-olive-light px-3 py-1 text-cinech-cream">
          <ShieldCheck className="h-4 w-4 text-cinech-olive-light" /> {t('ready')} · {contract.address ? short(contract.address) : ''}
        </span>
        {contract.explorerUrl ? (
          <a href={contract.explorerUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 hover:text-cinech-cream">
            {t('etherscan')} <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
        {hint ? (
          <span className="inline-flex items-center gap-2 normal-case tracking-normal text-cinech-brown-light">
            <Wallet className="h-4 w-4" /> {hint}
          </span>
        ) : null}
      </div>
    );
  }

  const checking = contract.status === 'checking';
  return (
    <div
      role="status"
      className={`paper mx-auto mb-10 flex max-w-3xl items-start gap-3 rounded-md border-2 p-4 text-cinech-ink ${
        checking ? 'border-cinech-ink/20' : 'border-cinech-brown shadow-hard-brown'
      }`}
    >
      {checking ? <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-cinech-olive" /> : <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-cinech-brown" />}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cinech-olive">[{en ? 'Contract' : 'Sözleşme'}] · {contract.status}</div>
        <p className="mt-1 text-sm leading-relaxed">{t(contract.status)}</p>
        {contract.explorerUrl && contract.status !== 'checking' ? (
          <a href={contract.explorerUrl} target="_blank" rel="noreferrer noopener" className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-brown hover:text-cinech-olive">
            {t('etherscan')} <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
