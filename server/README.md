# Cinech canlı oda sunucusu

`server/socket.js`, izleme odalarını (sohbet, izleyici listesi, tepkiler ve oynatma senkronu) yöneten bağımsız bir Socket.io sunucusudur. Next.js uygulamasından ayrı bir süreç olarak çalışır; odalar bellekte tutulur ve son izleyici çıkınca silinir.

## Çalıştırma

```bash
npm run socket            # http://localhost:3101
```

Ortam değişkenleri (isteğe bağlı):

| Değişken              | Varsayılan                                      | Açıklama                              |
| --------------------- | ----------------------------------------------- | ------------------------------------- |
| `SOCKET_PORT`         | `3101`                                          | Dinlenecek port                       |
| `SOCKET_CORS_ORIGINS` | `http://localhost:3100,http://localhost:3000`   | Virgülle ayrılmış izinli kaynaklar    |

Sağlık kontrolü: `GET http://localhost:3101/health` → `{ ok, rooms, viewers, uptime }`

## Uygulamayı bağlama

`.env.local` dosyasına ekle ve Next dev sunucusunu yeniden başlat (`NEXT_PUBLIC_*` değerleri derleme anında gömülür):

```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3101
```

Bu değişken tanımlı değilse `CinemaRoom` **yerel modda** çalışır: sohbet ve tepkiler yalnızca o tarayıcıda görünür, sunucuya bağlanılmaz.

## Protokol

İstemci → sunucu:

- `room:join { roomId, name }` — odaya katıl (film id'si veya slug)
- `chat:message { text }` — en fazla 280 karakter, soket başına 700 ms'de 1 mesaj
- `playback:update { playing, time }` — odadaki diğer izleyicilere yayılır
- `reaction { emoji }` — izinli liste: 🎬 👏 😂 😱 ❤️ 🍿

Sunucu → istemci:

- `room:state { viewers, playback, messages }` — katılan sokete, son 50 mesajla
- `room:presence { viewers }` — izleyici listesi değişince odaya
- `chat:message { id, name, text, at }` — gönderen dahil odaya
- `playback:update { playing, time, updatedAt }` — gönderen hariç odaya
- `reaction { id, name, emoji }` — gönderen dahil odaya

Metinlerdeki kontrol karakterleri sunucuda atılır; HTML kaçışı yapılmaz (React metni güvenli basar).
