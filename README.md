# 🌐 AREA - Laravel API + React Frontend

[![CircleCI](https://circleci.com/gh/EthanBranchereau/area-cicd-mirror.svg?style=shield)](https://circleci.com/gh/EthanBranchereau/area-cicd-mirror)

AREA est un projet **web** développé dans le cadre d'un projet étudiant avec une pipeline CI/CD complète.

> **🔒 Security Note**: Repository history has been cleaned to remove accidentally committed SSH credentials (September 17, 2025).

## 🚀 CI/CD Workflow

Ce projet utilise un **workflow staging → production** avec CircleCI :

- **Staging** : https://github.com/EthanBranchereau/area-cicd-mirror (Tests et validation)
- **Production** : http://144.24.201.112/ (Déploiement automatique)

**👥 Pour l'équipe** : Voir [TEAM_WORKFLOW.md](./TEAM_WORKFLOW.md) pour le processus de développement.

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

This project uses CircleCI for continuous integration and deployment.

### CI/CD Workflows

#### Backend CI
- Runs PHP setup with Composer installation
- Sets up SQLite database for testing
- Runs Laravel migrations
- Executes backend tests with PHPUnit

#### Frontend CI
- Sets up Node.js environment
- Installs frontend dependencies
- Runs ESLint for code quality (if configured)
- Builds the frontend application
- Stores the build artifacts for deployment

### Deployment

Deployments are managed automatically through CircleCI:

- **Environment**: Server specified by environment variables
- **Trigger**: Automatic on push to `main` branch
  
- **Deployment Process**:
  1. Backend deployment with optimized dependencies
  2. Database migrations and cache optimization
  3. Frontend build with environment-specific variables
  4. Upload of both services to the target server
  5. Health checks for verification

### Setting Up Secrets

For deployments to work properly, set up these CircleCI environment variables:
- `SSH_HOST`: Server hostname (e.g., `144.24.201.112`)
- `SSH_USERNAME`: SSH username
- `SSH_KEY`: SSH private key for authentication
- `DB_PASSWORD`: Database password for deployment

### Server Configuration

The application is configured to use the following ports:
- **Backend API**: Port 8000 (Laravel)
- **Frontend**: Port 80/443 for web access

### Testing the CI/CD Pipeline

To test the CI/CD workflows:

1. **Local Testing**
   ```bash
   # Test backend
   cd backend
   cp .env.example .env
   php artisan key:generate
   php artisan test
   
   # Test frontend
   cd frontend
   echo 'VITE_API_URL=http://localhost:8000' > .env
   npm run typecheck
   npm run build
   ```

2. **CI Testing**
   - Create a pull request to the `main` branch
   - Check GitHub Actions tab to monitor workflow runs
   - Address any failures in the CI workflows
   
3. **Deployment Testing**
   - Go to Actions tab > Deploy workflow > "Run workflow"
   - Select "staging" environment
   - Monitor deployment progress
   - Check backend at http://[your-server-ip]:8000/api/test
   - Check frontend at http://[your-server-ip]
   
4. **Troubleshooting**
   - Check server logs: `cat ~/area-backend.log`
   - Verify Nginx configuration: `sudo nginx -t`
   - Check running services: `ps aux | grep php`
   - Review database status: `sudo systemctl status postgresql`

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

## � CI/CD Pipeline

Le projet utilise CircleCI pour l'intégration continue et le déploiement continu.

### Workflow CI/CD

1. **Backend CI**: Teste et valide le code du backend Laravel
   - Installation des dépendances PHP
   - Préparation de l'environnement Laravel
   - Exécution des migrations
   - Exécution des tests

2. **Frontend CI**: Teste et build le frontend React
   - Installation des dépendances Node.js
   - Exécution du linter ESLint
   - Construction du build de production

3. **Déploiement**: Déploie les applications backend et frontend
   - Se déclenche uniquement sur la branche `main`
   - Nécessite que les jobs CI backend et frontend réussissent
   - Déploie le backend vers le serveur
   - Déploie le frontend vers le serveur

### Variables d'environnement CircleCI requises

Pour que le déploiement fonctionne, les variables d'environnement suivantes doivent être configurées dans CircleCI:

- `SSH_HOST`: Adresse IP ou nom d'hôte du serveur
- `SSH_USERNAME`: Nom d'utilisateur SSH
- `SSH_KEY`: Clé SSH privée pour l'authentification
- `DB_PASSWORD`: Mot de passe de la base de données PostgreSQL

---

## �📂 Structure du projet

