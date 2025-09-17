# 🌐 AREA - Laravel API + React Frontend

AREA est un projet **web** développé dans le cadre d'un projet étudiant.
L'objectif est de créer une application moderne, robuste et efficace grâce à une stack technique complète.

> **🔄 MIGRATION PostgreSQL** : Le projet utilise maintenant PostgreSQL au lieu de SQLite. Voir la section [Database Setup](#database-setup) ci-dessous.

## Project Structure

```
├── backend/          # Laravel 11 API + PostgreSQL
├── frontend/         # React + Vite frontend
```

## Quick Start

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- npm
- **PostgreSQL 15+** (nouveau)

### Two Servers ran

- Laravel API server at http://localhost:8000
- React frontend at http://localhost:5173

## Database Setup

**⚠️ IMPORTANT:** Le projet utilise maintenant PostgreSQL. Si vous récupérez le projet pour la première fois après cette migration, suivez ces étapes :

### 1. Installer PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib php-pgsql

# macOS
brew install postgresql
brew services start postgresql
```

### 2. Créer la base de données
```bash
sudo -u postgres psql
CREATE DATABASE area_db;
CREATE USER area_user WITH PASSWORD 'area_password';
GRANT ALL PRIVILEGES ON DATABASE area_db TO area_user;
GRANT ALL ON SCHEMA public TO area_user;
GRANT CREATE ON SCHEMA public TO area_user;
\q
```

### 3. Configurer Laravel
```bash
cd backend
cp .env.example .env
# Modifier .env avec :
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=area_db
# DB_USERNAME=area_user
# DB_PASSWORD=area_password
```

### Start Servers Individually

#### Backend (Laravel API)
```bash
./start-backend.sh
# Or manually:
cd backend
composer install
php artisan key:generate
php artisan migrate  # ⚠️ Important après migration PostgreSQL
php artisan serve --port=8000
```

#### Frontend (React)
```bash
./start-frontend.sh
# Or manually:
cd frontend
npm install
npm run dev
```

## Configuration

### Backend Configuration
- **Base URL**: http://localhost:8000
- **API Prefix**: `/api`
- **Database**: SQLite (included)
- **Authentication**: Laravel Sanctum
- **CORS**: Configured for frontend at localhost:5173

### Frontend Configuration
- **Base URL**: http://localhost:5173
- **API Proxy**: Configured to proxy `/api/*` to backend
- **Environment**: `.env` file with `VITE_API_URL=http://localhost:8000`

## API Endpoints

### Public Endpoints
- `GET /api/test` - Test API connection
- `POST /api/echo` - Echo back request data

### Protected Endpoints (require authentication)
- `GET /api/user` - Get authenticated user
- `GET /api/protected` - Protected test endpoint

## Features Configured

### Backend
- ✅ Laravel Sanctum for API authentication
- ✅ CORS configuration for frontend communication
- ✅ API routes with proper middleware
- ✅ SQLite database setup
- ✅ Example controllers and routes

### Frontend
- ✅ Vite proxy configuration for API calls
- ✅ Axios HTTP client with interceptors
- ✅ CSRF token handling
- ✅ API service layer
- ✅ Environment variables setup
- ✅ TypeScript support

---REA

AREA est un projet **web** développé dans le cadre d’un projet étudiant.
L’objectif est de créer une application moderne, robuste et efficace grâce à une stack technique complète.

---

## 🚀 Technologies utilisées

- **Frontend :** [React](https://reactjs.org/)
- **Backend :** [Laravel](https://laravel.com/)
- **Liaison Front/Back :** [Inertia.js](https://inertiajs.com/)
- **Base de données :** [SQLite](https://www.sqlite.org/index.html)

👉 Pour une analyse détaillée et comparative des choix techniques, consultez le fichier [**BENCHMARK.md**](./BENCHMARK.md).

---

## 📌 Objectifs du projet

- Développer une application web moderne et réactive.
- Utiliser une architecture claire et maintenable.
- Mettre en place une base de données simple mais efficace.
- Favoriser la rapidité de développement avec une stack adaptée.

---

## 📂 Structure du projet

