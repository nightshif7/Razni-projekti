#!/bin/bash

# ─────────────────────────────────────────
#  MathQuest — Local Network Server
#  Pokreni: bash start.sh
# ─────────────────────────────────────────

PORT=5173
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "  🧮 MathQuest — pokretanje servera..."
echo ""

# Provjeri Node
if ! command -v node &> /dev/null; then
  echo "  ❌ Node.js nije instaliran!"
  echo "     Instaliraj: https://nodejs.org"
  exit 1
fi

# Provjeri je li build postoji
if [ ! -d "$PROJECT_DIR/dist" ]; then
  echo "  📦 Nema build-a, gradim..."
  cd "$PROJECT_DIR" && npm install && npm run build
fi

# Pokušaj ubiti prethodni server na tom portu
lsof -ti:$PORT | xargs kill -9 2>/dev/null

# Dohvati lokalni IP
LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || ipconfig getifaddr en0 2>/dev/null || echo "localhost")

echo "  ✅ Server se pokreće..."
echo ""
echo "  ┌─────────────────────────────────────────┐"
echo "  │  🌐 Lokalna mreža:                      │"
echo "  │  http://$LOCAL_IP:$PORT          │"
echo "  │                                         │"
echo "  │  💻 Ovo računalo:                       │"
echo "  │  http://localhost:$PORT                 │"
echo "  └─────────────────────────────────────────┘"
echo ""
echo "  📱 Otvori link na mobitelu ili drugom računalu!"
echo "  🛑 Za zaustavljanje: Ctrl+C"
echo ""

# Pokreni Vite preview (servira dist/ folder)
cd "$PROJECT_DIR" && npx vite preview --host 0.0.0.0 --port $PORT
