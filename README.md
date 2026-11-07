# 🎬 Cinech - İzledikçe Kazan

Cinech, Ethereum blockchain tabanlı bir "Watch-to-Earn" platformudur. Kullanıcılar telif hakkı gerektirmeyen filmleri izleyerek CINE token'ları kazanabilir, sosyal izleme deneyimi yaşayabilir ve DAO oylamalarına katılabilir.

## ✨ Özellikler

- **🎥 İzledikçe Kazan**: Filmleri sonuna kadar izleyerek CINE token'ları kazanın
- **👥 Sosyal İzleme**: Arkadaşlarınızla aynı anda film izleyin ve chat yapın
- **🗳️ DAO Oylama**: Token'larınızla platform kararlarında oy verin
- **🎨 Bağımsız İçerik**: Telif hakkı gerektirmeyen filmler ve bağımsız yapımcılar
- **🔗 Blockchain Entegrasyonu**: Ethereum tabanlı token sistemi

## 🚀 Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd cinech
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

4. [http://localhost:3000](http://localhost:3000) adresini tarayıcınızda açın.

## 🛠️ Teknolojiler

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Ethereum, Wagmi, RainbowKit
- **UI/UX**: Lucide React, Framer Motion
- **Real-time**: Socket.io

## 📱 Kullanım

1. **Cüzdan Bağlama**: MetaMask veya diğer Web3 cüzdanlarınızı bağlayın
2. **Film İzleme**: Canlı izleme odalarına katılın
3. **Token Kazanma**: Filmleri %90'ını izleyerek CINE token'ları kazanın
4. **DAO Katılımı**: Token'larınızla platform kararlarında oy verin

## 🎯 Hackathon Hedefleri

- ✅ Telif hakkı sorunlarını çözme
- ✅ Blockchain ile değer üretimi
- ✅ Sosyal izleme deneyimi
- ✅ DAO yönetimi
- ✅ Bağımsız yapımcı desteği

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje hakkında sorularınız için issue açabilir veya iletişime geçebilirsiniz.

## Tasarım dili (retro sinema)

Behance'teki KINOROY çalışmasından ilham alan kırmızı-krem retro sinema estetiği.

- **Renkler ("Zeytin" paleti):** `cinech-olive #3C4A32` (soğuk yeşil, ana vurgu ve koyu bantlar), `cinech-cream #EAE4D2` (sıcak krem zemin), `cinech-brown #7A4A24` (raptiye, el yazısı, damga mürekkebi), `cinech-ink #1C2118` (zeytin-siyah). Tailwind'de `tailwind.config.js`.
- **Tipografi:** yalnızca iki marka fontu. Archivo (değişken; `font-display` dar ve 800 ağırlık afiş başlıkları, `font-cinech` 700 menü ve düğmeler, `font-mono` hafif dar HUD etiketleri, gövde metni) ve Yellowtail (`font-script`, el yazısı vurgular).
- **Doku:** `GrainOverlay` tüm sayfaya sabit kâğıt greni; `.paper` krem kâğıt; `.film-strip` perforasyonlu film şeridi; `.text-hard` blok gölgeli başlık; `shadow-hard` sert ofset gölge.
- **Bileşenler (`src/components/retro/`):** `RetroHud` köşe kayıt işaretleri ve `[ETİKET]` HUD yazıları; `FilmStrip` akan yazılı film şeridi ayracı; `TicketCard` perforasyonlu bilet kartı; `Polaroid` raptiyeli krem çerçeve; `FilmFrame` film karesi çerçevesi; `Pin` raptiye; `Display`/`Script` başlık ve el yazısı.
- **Düğmeler:** `.btn-olive`, `.btn-brown`, `.btn-cream`, `.btn-ink`, `.btn-outline` (globals.css).
- Marka adı her zaman büyük harf **CINECH** yazılır (Türkçe `uppercase` dönüşümü "İ" üretir).

- **Logo:** `public/brand/` altında resmi dosyalar: `cinech-sembol-*` (sembol), `cinech-yatay-*` (yatay kilit), `cinech-dikey-*` (dikey kilit); `-seffaf` sürümleri `currentColor` kullanır, `-krem` / `-zeytin` sürümleri sabit renklidir. Favicon `src/app/icon.svg` semboldür.
- **Film Defteri (`/defter`):** izleme koçanları, puan ve el yazısı not, damgalar; tarayıcıda sahibine (cüzdan adresi ya da misafir) göre saklanır (`src/hooks/useJournal.ts`, `src/data/journal.ts`). NFT basımı sonraki aşama.

## Özellik paketi (Kasım 2026)

Yol haritasının on maddesi yerel-öncelikli (localStorage) olarak uygulandı; zincire henüz hiçbir şey yazılmaz.

| # | Özellik | Nerede |
|---|---------|--------|
| 1 | Film Defteri: koçanlar, damgalar, misafir → cüzdan taşıma | `/defter` |
| 2 | Numaralı bilet edisyonları: Gala · Altın Baskı · Gece Yarısı · Standart, kod `YNK-G-0007`, ERC-721 metadata taslağı | `src/data/editions.ts`, koçanlarda rozet |
| 3 | Takvim dışa aktarımı (.ics + Google Takvim bağlantısı) | Program bölümü, bilet modalı, film sayfaları |
| 4 | Film detay sayfaları (künye, takvim, koçanlar, benzer filmler) | `/film/[slug]` |
| 5 | Canlı odalar: Socket.io sunucusu, sohbet, tepkiler, oynatma eşitleme | `server/socket.js`, `npm run socket` |
| 6 | Gişe: cüzdan, Sepolia bakiyesi, türetilmiş CINE puan defteri, JSON dışa aktarım | `/gise` |
| 7 | Ruh hali seçici (katalog filtresi, `?ruh=` parametresi) | Ana sayfa katalog |
| 8 | Afiş yarışması: galeri, oylama, gönderim formu, geri sayım | `/afis` |
| 9 | Stüdyo: yapımcı profilleri ve başvuru formu | `/studyo` |
| 10 | ⌘K arama paleti ve PWA (manifest, ikonlar, çevrimdışı sayfa) | Navbar, `src/app/manifest.ts`, `public/sw.js` |

Canlı odalar için `.env.local` içine `NEXT_PUBLIC_SOCKET_URL=http://localhost:3101` yazıp ayrı bir terminalde `npm run socket` çalıştır. Değişken yoksa odalar "yerel mod"da çalışır. Service worker yalnızca üretim derlemesinde (`next build && next start`) kaydolur.

Yerel depolama anahtarları `cinech:` önekiyle başlar: `cinech:defter:<sahip>`, `cinech:favorites`, `cinech:reminders`, `cinech:afis:*`, `cinech:studyo:basvurular:<sahip>`, `cinech:search:recent`, `cinech:room:name`, `cinech:lang`.

## Sözleşme: Sepolia'ya dağıtım

Depodaki eski DAO adresi bize ait olmayan bir sözleşmeydi ve kaldırıldı. Uygulama artık adresi yalnızca `NEXT_PUBLIC_DAO_CONTRACT_ADDRESS` ortam değişkeninden okur; adres yoksa ya da adresteki bytecode oylama fonksiyonlarını taşımıyorsa DAO sayfası zincir işlemlerini kapalı tutar ve nedenini gösterir.

Kendi sözleşmeni dağıtmak için:

1. `.env.local` içine dağıtım cüzdanının özel anahtarını `PRIVATE_KEY=` olarak ekle (yalnızca test cüzdanı; dosya depoya girmez) ve cüzdanda biraz Sepolia ETH olsun.
2. `npm run compile` ile `contracts/VotingContract.sol` derlenir.
3. `npm run deploy:sepolia` sözleşmeyi dağıtır, adresi `deployments/sepolia.json` ve `.env.local` dosyasına yazar, ABI'yi `src/contracts/abis/MovieVotingDAO.ts` içine eşitler.
4. Dev sunucusunu yeniden başlat; DAO sayfasında "Sözleşme doğrulandı" rozeti görünür. Vercel'de de aynı ortam değişkenini ayarla.

İsteğe bağlı: `ETHERSCAN_API_KEY` ile `npx hardhat verify --network sepolia <adres>`.
