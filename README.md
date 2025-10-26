# 🌐 AREA - Laravel API + React Frontend

[![CircleCI](https://circleci.com/gh/EthanBranchereau/area-cicd-mirror.svg?style=shield)](https://circleci.com/gh/EthanBranchereau/area-cicd-mirror)
AREA is a **web** project developed as part of a student assignment, featuring a complete CI/CD pipeline.

> **🔒 Security Note**: Repository history has been cleaned to remove accidentally committed SSH credentials (September 17, 2025).

## 🚀 CI/CD Workflow

This project uses a **staging → production workflow** with CircleCI:

- **Staging**: https://github.com/EthanBranchereau/area-cicd-mirror (Testing and validation)
- **Production**: http://144.24.201.112/ (Automatic deployment)

**👥 For the team**: See [TEAM_WORKFLOW.md](./TEAM_WORKFLOW.md) for the development process.

> **🔄 PostgreSQL MIGRATION**: The project now uses PostgreSQL instead of SQLite. See the [Database Setup](#database-setup) section below.

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
- **PostgreSQL 15+** (new)

## 🏭 Production Deployment & Process Management

### Backend (Laravel) - Running as a Service
For production, run the Laravel backend as a persistent service using **Supervisor** (recommended) or `systemd`.

#### Using Supervisor
1. Install Supervisor:
   ```bash
   sudo apt-get install supervisor
   ```
2. Create `/etc/supervisor/conf.d/laravel-backend.conf`:
   ```ini
   [program:laravel-backend]
   directory=/home/deploy/area-app/backend
   command=php artisan serve --host=127.0.0.1 --port=8000
   autostart=true
   autorestart=true
   user=deploy
   stdout_logfile=/var/log/supervisor/laravel-backend.log
   stderr_logfile=/var/log/supervisor/laravel-backend-error.log
   ```
3. Reload and start:
   ```bash
   sudo supervisorctl reread
   sudo supervisorctl update
   sudo supervisorctl start laravel-backend
   ```
4. Check status:
   ```bash
   sudo supervisorctl status
   ```

### Frontend (React/Vite)
- Build with:
  ```bash
  npm run build
  ```
- Serve static files via Nginx or another web server.

### Environment Variables
- **Frontend:** Set `VITE_API_URL` in `/frontend/.env` to your backend API root (e.g. `http://your-server-ip/api`).
- **Backend:** Configure your `.env` for database, mail, etc.

### Avoiding Double `/api/api` URLs
When using `VITE_API_URL`, do **not** add `/api` in your frontend code if your env already ends with `/api`.
Example:
```js
// Correct:
axios.post(`${import.meta.env.VITE_API_URL}/login`)
// Not: axios.post(`${import.meta.env.VITE_API_URL}/api/login`)
```

## 🛠️ Troubleshooting

### 502 Bad Gateway / Connection Refused
- Ensure the backend is running (see Supervisor section above).
- After reseeding or migrating the database, restart the backend process:
  ```bash
  sudo supervisorctl restart laravel-backend
  ```
- Check Nginx and Laravel logs for errors.

### Database Reseed
If you reseed the database, always restart the backend process to avoid stale connections or migrations.

### API Not Found or 404
- Check for double `/api/api` in your URLs.
- Make sure your `.env` and frontend build are up to date.

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

AREA is a **web** project developed as part of a student assignment.
The goal is to create a modern, robust, and efficient application using a complete technical stack.

---

## 🚀 Technologies Used

- **Frontend:** [React](https://reactjs.org/)
- **Backend:** [Laravel](https://laravel.com/)
- **Frontend/Backend Bridge:** [Inertia.js](https://inertiajs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)

👉 For a detailed analysis and comparison of technical choices, see [**BENCHMARK.md**](./BENCHMARK.md).

---

## 📌 Project Objectives

- Develop a modern and responsive web application.
- Use a clear and maintainable architecture.
- Set up a robust and scalable database.
- Enable rapid development with an adapted stack.

---

## 🚀 CI/CD Pipeline

The project uses CircleCI for continuous integration and deployment.

### CI/CD Workflow

1. **Backend CI:** Tests and validates Laravel backend code
   - Installs PHP dependencies
   - Prepares the Laravel environment
   - Runs migrations
   - Executes tests

2. **Frontend CI:** Tests and builds the React frontend
   - Installs Node.js dependencies
   - Runs ESLint linter
   - Builds the production bundle

3. **Deployment:** Deploys backend and frontend applications
   - Triggered only on the `main` branch
   - Requires successful backend and frontend CI jobs
   - Deploys backend to the server
   - Deploys frontend to the server

### Required CircleCI Environment Variables

To enable deployment, configure the following environment variables in CircleCI:

- `SSH_HOST`: Server IP address or hostname
- `SSH_USERNAME`: SSH username
- `SSH_KEY`: SSH private key for authentication
- `DB_PASSWORD`: PostgreSQL database password

---

## 📂 Project Structure# Force deployment - Sun Oct 26 17:44:28 CET 2025
