#!/bin/bash

# AREA - Script de démarrage complet
# Lance le backend, frontend et scheduler automatiquement

echo "🚀 Starting AREA application..."

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Répertoire du projet
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Fonction pour arrêter tous les processus
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping all services...${NC}"

    # Tuer les processus lancés
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✓${NC} Backend stopped"
    fi

    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✓${NC} Frontend stopped"
    fi

    if [ ! -z "$SCHEDULER_PID" ]; then
        kill $SCHEDULER_PID 2>/dev/null
        echo -e "${GREEN}✓${NC} Scheduler stopped"
    fi

    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT SIGTERM

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "$PROJECT_DIR/backend" ] || [ ! -d "$PROJECT_DIR/frontend" ]; then
    echo -e "${RED}❌ Error: backend or frontend directory not found${NC}"
    exit 1
fi

# 1. Démarrer le Backend
echo -e "\n${BLUE}[1/3]${NC} Starting Backend (Laravel)..."
cd "$PROJECT_DIR/backend"
php artisan serve > /tmp/area-backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend running on http://localhost:8000 (PID: $BACKEND_PID)"
else
    echo -e "${RED}✗${NC} Failed to start backend"
    cat /tmp/area-backend.log
    exit 1
fi

# 2. Démarrer le Frontend
echo -e "\n${BLUE}[2/3]${NC} Starting Frontend (React + Vite)..."
cd "$PROJECT_DIR/frontend"
npm run dev > /tmp/area-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓${NC} Frontend running on http://localhost:5173 (PID: $FRONTEND_PID)"
else
    echo -e "${RED}✗${NC} Failed to start frontend"
    cat /tmp/area-frontend.log
    cleanup
    exit 1
fi

# 3. Démarrer le Scheduler
echo -e "\n${BLUE}[3/3]${NC} Starting AREA Scheduler..."
cd "$PROJECT_DIR/backend"
php artisan schedule:work > /tmp/area-scheduler.log 2>&1 &
SCHEDULER_PID=$!
sleep 2

if ps -p $SCHEDULER_PID > /dev/null; then
    echo -e "${GREEN}✓${NC} Scheduler running (PID: $SCHEDULER_PID)"
else
    echo -e "${RED}✗${NC} Failed to start scheduler"
    cat /tmp/area-scheduler.log
    cleanup
    exit 1
fi

# Afficher le résumé
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ AREA Application is now running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e ""
echo -e "  📡 Backend:   ${BLUE}http://localhost:8000${NC}"
echo -e "  🌐 Frontend:  ${BLUE}http://localhost:5173${NC}"
echo -e "  ⏰ Scheduler: ${GREEN}Active (checks every minute)${NC}"
echo -e ""
echo -e "${YELLOW}Logs:${NC}"
echo -e "  • Backend:   tail -f /tmp/area-backend.log"
echo -e "  • Frontend:  tail -f /tmp/area-frontend.log"
echo -e "  • Scheduler: tail -f /tmp/area-scheduler.log"
echo -e "  • Areas:     tail -f $PROJECT_DIR/backend/storage/logs/areas-check.log"
echo -e ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Garder le script en cours d'exécution
while true; do
    # Vérifier que tous les processus tournent encore
    if ! ps -p $BACKEND_PID > /dev/null; then
        echo -e "${RED}❌ Backend crashed!${NC}"
        cleanup
        exit 1
    fi

    if ! ps -p $FRONTEND_PID > /dev/null; then
        echo -e "${RED}❌ Frontend crashed!${NC}"
        cleanup
        exit 1
    fi

    if ! ps -p $SCHEDULER_PID > /dev/null; then
        echo -e "${RED}❌ Scheduler crashed!${NC}"
        cleanup
        exit 1
    fi

    sleep 5
done
