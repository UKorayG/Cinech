'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useSwitchChain } from 'wagmi';
import { Coins, FlaskConical, TriangleAlert } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ACTIVE_CHAIN } from '@/lib/wagmi';

export default function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { data: ethBalance } = useBalance({ address, chainId: ACTIVE_CHAIN.id });
  const { switchChain, isPending } = useSwitchChain();
  const { language } = useLanguage();
  const en = language === 'en';
  const onTestnet = chain?.id === ACTIVE_CHAIN.id;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {isConnected ? (
        onTestnet ? (
          <span
            className="hidden items-center gap-1.5 rounded-full border border-cinech-cream/30 bg-cinech-ink/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cinech-cream/85 md:flex"
            title={en ? 'Test network' : 'Test ağı'}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            {ACTIVE_CHAIN.name} · testnet
          </span>
        ) : (
          <button
            type="button"
            onClick={() => switchChain({ chainId: ACTIVE_CHAIN.id })}
            disabled={isPending}
            className="hidden items-center gap-1.5 rounded-full bg-cinech-brown px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cinech-cream shadow-hard-sm disabled:opacity-60 md:flex"
          >
            <TriangleAlert className="h-3.5 w-3.5" />
            {isPending ? (en ? 'Switching…' : 'Geçiliyor…') : en ? `Switch to ${ACTIVE_CHAIN.name}` : `${ACTIVE_CHAIN.name}'ya geç`}
          </button>
        )
      ) : null}
      {isConnected && onTestnet ? (
        <div className="hidden items-center gap-2 rounded-lg border border-cinech-cream/30 bg-cinech-ink/30 px-3 py-1.5 lg:flex">
          <Coins className="h-4 w-4 text-cinech-cream" />
          <span className="text-sm font-medium text-cinech-cream">
            {ethBalance ? parseFloat(ethBalance.formatted).toFixed(4) : '0.0000'} {ethBalance?.symbol ?? 'ETH'}
          </span>
        </div>
      ) : null}
      <ConnectButton
        accountStatus="address"
        chainStatus="icon"
        showBalance={false}
        label={isConnected ? (en ? 'Connected' : 'Bağlı') : en ? 'Connect Wallet' : 'Cüzdan Bağla'}
      />
    </div>
  );
}
