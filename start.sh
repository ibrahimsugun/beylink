#!/usr/bin/env bash
# start.sh - BeyLink'i lokalde tek komutla kurar ve başlatır (macOS / Linux)
# Kullanım:  bash start.sh   (veya:  ./start.sh)

set -e
cd "$(dirname "$0")"

BACKEND_PORT=4501
FRONTEND_PORT=5501

# Verilen TCP portunu tutan süreç(ler)i sonlandırır (varsa). Önceki çalıştırmadan kalan
# öksüz backend/frontend süreçlerini temizler → "EADDRINUSE: address already in use" hatasını önler.
# Yalnız BeyLink portlarına (4501/5501) dokunur; NoLnk'ün (4900/5973) veya eski beylink
# kopyalarının (4001/5180) kullandığı portları etkilemez.
free_port() {
  local port="$1"
  local pids
  pids="$(lsof -ti "tcp:${port}" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "    :${port} portunu tutan eski süreç(ler) kapatılıyor → $(echo "$pids" | tr '\n' ' ')"
    kill $pids 2>/dev/null || true
    sleep 1
    # Nazik kill yetmediyse zorla (nodemon→node ağacı inatçı olabilir)
    pids="$(lsof -ti "tcp:${port}" -sTCP:LISTEN 2>/dev/null || true)"
    [ -n "$pids" ] && kill -9 $pids 2>/dev/null || true
  fi
}

echo "==> Node sürümü:"
node -v || { echo "Node.js bulunamadı. Lütfen https://nodejs.org adresinden kurun."; exit 1; }

echo ""
echo "==> [1/3] Backend bağımlılıkları kuruluyor..."
( cd backend && npm install )

echo ""
echo "==> [2/3] Frontend bağımlılıkları kuruluyor..."
( cd frontend && npm install )

# İlk çalıştırmada veritabanını hazırla (tablolar + örnek veri)
if [ ! -f backend/data/beylink.sqlite ]; then
  echo ""
  echo "==> Veritabanı hazırlanıyor (migrate + seed)..."
  ( cd backend && npm run migrate && npm run seed )
fi

echo ""
echo "==> Eski süreçler temizleniyor (varsa)..."
free_port "$BACKEND_PORT"
free_port "$FRONTEND_PORT"

echo ""
echo "==> [3/3] Sunucular başlatılıyor..."
echo "    Backend  -> http://localhost:${BACKEND_PORT}"
echo "    Frontend -> http://localhost:${FRONTEND_PORT}"
echo "    (Durdurmak için: Ctrl + C)"
echo ""

# Backend'i arka planda başlat
( cd backend && npm run dev ) &
BACKEND_PID=$!

# Çıkışta (Ctrl+C dahil) backend'i temiz kapat: subshell'i öldür + portu bırak.
# NOT: subshell (npm) → nodemon → node zinciri spawn ettiğinden, yalnız $BACKEND_PID'i öldürmek
# çocukları öksüz bırakır; bu yüzden ayrıca free_port ile :4501 ağacını da temizliyoruz.
cleanup() {
  echo ""
  echo "Kapatılıyor..."
  kill "$BACKEND_PID" 2>/dev/null || true
  free_port "$BACKEND_PORT"
}
trap cleanup EXIT INT TERM

# Backend'in ayağa kalkması için kısa bekleme
sleep 2

# Frontend'i ön planda çalıştır (Ctrl+C bunu durdurur, trap backend'i kapatır)
( cd frontend && npm run dev )
