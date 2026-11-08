'use client';

import { useAccount, useBalance, useSwitchChain } from 'wagmi';
import { ExternalLink, FlaskConical, TriangleAlert, Wallet } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ACTIVE_CHAIN } from '@/lib/wagmi';
import WalletConnect from '@/components/WalletConnect';
import { shortAddress } from '@/data/journal';
import BoothCard from './BoothCard';

const EXPLORER = 'https://sepolia.etherscan.io/address/';

/**
 * Cüzdan penceresi: bağlıysa kısa adres, Sepolia test bakiyesi ve Etherscan bağlantısı;
 * değilse tek satır açıklama ve bağlan düğmesi. Hiçbir şey imzalanmaz ya da gönderilmez.
 */
export default function WalletCard() {
  const { language } = useLanguage();
  const en = language === 'en';
  const { address, isConnected, chain } = useAccount();
  const { data: balance, isLoading } = useBalance({ address, chainId: ACTIVE_CHAIN.id });
  const { switchChain, isPending } = useSwitchChain();
  const onTestnet = chain?.id === ACTIVE_CHAIN.id;

  const balanceText = isLoading
    ? '…'
    : balance
      ? `${Number(balance.formatted).toLocaleString(en ? 'en-GB' : 'tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${balance.symbol}`
      : '—';

  const badge = (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-cinech-cream/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cinech-cream/85"
      title={en ? 'Test network' : 'Test ağı'}
    >
      <FlaskConical className="h-3.5 w-3.5" />
      {ACTIVE_CHAIN.name} · testnet
    </span>
  );

  return (
    <BoothCard
      icon={<Wallet className="h-4 w-4" />}
      label={en ? (isConnected ? 'Booth window · open' : 'Booth window · closed') : isConnected ? 'Gişe penceresi · açık' : 'Gişe penceresi · kapalı'}
      aside={badge}
      tilt={-0.8}
    >
      {isConnected && address ? (
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cinech-cream/55">{en ? 'Address' : 'Adres'}</div>
          <div className="mt-1 break-all font-mono text-lg tracking-wide text-cinech-cream" title={address}>
            {shortAddress(address)}
          </div>

          <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-cinech-cream/55">
            {en ? `${ACTIVE_CHAIN.name} balance` : `${ACTIVE_CHAIN.name} bakiyesi`}
          </div>
          <div className="mt-1 font-display text-5xl leading-none text-cinech-cream md:text-6xl">{balanceText}</div>
          <p className="mt-2 text-xs text-cinech-cream/60">
            {en ? 'Testnet ETH has no monetary value. No real money is involved.' : 'Testnet ETH’nin parasal değeri yoktur. Gerçek para söz konusu değil.'}
          </p>

          {!onTestnet ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-sm border border-dashed border-cinech-cream/30 px-3 py-2 text-xs text-cinech-cream/80">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              <span className="flex-1">
                {en
                  ? `Your wallet is on another network; the balance above is read from ${ACTIVE_CHAIN.name}.`
                  : `Cüzdanın başka bir ağda; yukarıdaki bakiye ${ACTIVE_CHAIN.name} üzerinden okunuyor.`}
              </span>
              <button
                type="button"
                onClick={() => switchChain({ chainId: ACTIVE_CHAIN.id })}
                disabled={isPending}
                className="btn-outline !px-3 !py-1 !text-[10px] disabled:opacity-60"
              >
                {isPending ? (en ? 'Switching…' : 'Geçiliyor…') : en ? `Switch to ${ACTIVE_CHAIN.name}` : `${ACTIVE_CHAIN.name}’ya geç`}
              </button>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href={`${EXPLORER}${address}`} target="_blank" rel="noreferrer" className="btn-cream !px-4 !py-2 !text-xs">
              {en ? 'View on Etherscan' : 'Etherscan’de gör'} <ExternalLink className="h-4 w-4" />
            </a>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cinech-cream/50">{en ? 'Read-only' : 'Salt okunur'}</span>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm leading-relaxed text-cinech-cream/80">
            {en
              ? 'No wallet connected. Connect one to see your address and Sepolia test balance here; the guest journal keeps working without it.'
              : 'Cüzdan bağlı değil. Bağlarsan adresin ve Sepolia test bakiyen burada görünür; misafir defteri bağlamadan da çalışır.'}
          </p>
          <div className="mt-5">
            <WalletConnect />
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-cinech-cream/50">
            {en ? 'Testnet only · no real money' : 'Yalnızca testnet · gerçek para yok'}
          </p>
        </div>
      )}
    </BoothCard>
  );
}
