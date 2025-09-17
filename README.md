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


## Configuration

### Backend Configuration
- **Base URL**: http://localhost:8000
- **API Prefix**: `/api`
- **Database**: PostgreSQL (area_db)
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
- ✅ PostgreSQL database setup
- ✅ Example controllers and routes

### Frontend
- ✅ Vite proxy configuration for API calls
- ✅ Axios HTTP client with interceptors
- ✅ CSRF token handling
- ✅ API service layer
- ✅ Environment variables setup
- ✅ TypeScript support

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment.

### CI Workflows

#### Backend CI (`backend-ci.yml`)
- Triggers on push/PR to `main` branch when backend files change
- Sets up PostgreSQL test database
- Runs code quality checks:
  - PHP syntax validation
  - PSR-12 coding standards
  - Static analysis with Larastan
- Runs PHPUnit tests
- Migration testing

#### Frontend CI (`frontend-ci.yml`)
- Triggers on push/PR to `main` branch when frontend files change
- Separate jobs for linting, type checking, and building
- Verifies build output
- ESLint code quality checks
- TypeScript type checking

### Deployment

Deployments are managed through the `deploy.yml` workflow:

- **Environments**: Staging (default) and Production
- **Trigger Methods**:
  - Automatic on push to `main` (deploys to Staging)
  - Manual workflow dispatch with environment selection
  
- **Deployment Process**:
  1. Backend deployment with optimized dependencies
  2. Database migrations
  3. Laravel cache optimization
  4. Frontend build with environment-specific variables
  5. Health checks for both services

### Setting Up Secrets

For deployments to work properly, set up these GitHub repository secrets:
- `SSH_HOST`: Server hostname (e.g., `144.24.201.112`)
- `SSH_USERNAME`: SSH username
- `SSH_KEY`: SSH private key for authentication
- `STAGING_API_URL`: Backend API URL for staging (e.g., `http://144.24.201.112:8000`)
- `PROD_API_URL`: Backend API URL for production (e.g., `http://144.24.201.112:8000`)

### Server Configuration

The application is configured to use the following ports:
- **Backend API**: Port 8000 (Laravel)
- **Frontend**: Port 80/443 for web access

---REA

AREA est un projet **web** développé dans le cadre d’un projet étudiant.
L’objectif est de créer une application moderne, robuste et efficace grâce à une stack technique complète.

---

## 🚀 Technologies utilisées

- **Frontend :** [React](https://reactjs.org/)
- **Backend :** [Laravel](https://laravel.com/)
- **Liaison Front/Back :** [Inertia.js](https://inertiajs.com/)
- **Base de données :** [PostgreSQL](https://www.postgresql.org/)

👉 Pour une analyse détaillée et comparative des choix techniques, consultez le fichier [**BENCHMARK.md**](./BENCHMARK.md).

---

## 📌 Objectifs du projet

- Développer une application web moderne et réactive.
- Utiliser une architecture claire et maintenable.
- Mettre en place une base de données robuste et scalable.
- Favoriser la rapidité de développement avec une stack adaptée.

---

## 📂 Structure du projet

