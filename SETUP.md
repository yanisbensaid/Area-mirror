# AREA - Guide de Configuration pour Nouvel Utilisateur

## Prérequis

- PHP 8.2+
- Node.js 18+
- Composer
- npm

## Étape 1 : Configuration Google OAuth

**IMPORTANT:** Chaque utilisateur doit configurer ses propres credentials Google OAuth.

### 1.1 Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API YouTube Data API v3 :
   - Menu "APIs & Services" → "Library"
   - Cherchez "YouTube Data API v3"
   - Cliquez "Enable"

### 1.2 Créer les credentials OAuth 2.0

1. Menu "APIs & Services" → "Credentials"
2. Cliquez "Create Credentials" → "OAuth client ID"
3. Type d'application : **Web application**
4. Nom : `AREA YouTube Integration`
5. **Authorized JavaScript origins** :
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   ```
6. **Authorized redirect URIs** :
   ```
   http://localhost:8000/api/oauth/youtube/callback
   http://127.0.0.1:8000/api/oauth/youtube/callback
   ```

   **IMPORTANT:** Si vous accédez au backend via une autre IP (ex: `192.168.1.100`), ajoutez aussi :
   ```
   http://192.168.1.100:8000/api/oauth/youtube/callback
   ```

7. Cliquez "Create"
8. **Copiez** le `Client ID` et le `Client secret`

## Étape 2 : Configuration du Backend

### 2.1 Installer les dépendances

```bash
cd backend
composer install
```

### 2.2 Copier le fichier .env

```bash
cp .env.example .env
```

### 2.3 Configurer les variables d'environnement

Éditez le fichier `backend/.env` :

```env
# Application
APP_KEY=base64:VOTRE_CLE_ICI
APP_URL=http://localhost:8000

# Base de données (SQLite par défaut)
DB_CONNECTION=sqlite

# Google OAuth - REMPLACEZ PAR VOS VALEURS
YOUTUBE_CLIENT_ID=VOTRE_CLIENT_ID.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=VOTRE_CLIENT_SECRET
YOUTUBE_REDIRECT_URI=http://localhost:8000/api/oauth/youtube/callback

# Telegram (optionnel pour l'instant)
TELEGRAM_BOT_TOKEN=
```

**IMPORTANT:** Remplacez `YOUTUBE_CLIENT_ID` et `YOUTUBE_CLIENT_SECRET` par les valeurs obtenues à l'étape 1.2.

### 2.4 Générer la clé d'application

```bash
php artisan key:generate
```

### 2.5 Créer la base de données

```bash
touch database/database.sqlite
php artisan migrate
```

### 2.6 Lancer le backend

```bash
php artisan serve
```

Le backend sera accessible sur `http://localhost:8000`

## Étape 3 : Configuration du Frontend

### 3.1 Installer les dépendances

```bash
cd ../frontend
npm install
```

### 3.2 Copier le fichier .env

```bash
cp .env.example .env
```

### 3.3 Configurer l'URL du backend

Éditez le fichier `frontend/.env` :

```env
VITE_API_URL=http://localhost:8000
```

**Si le backend tourne sur une autre IP :**
```env
VITE_API_URL=http://192.168.1.100:8000
```

### 3.4 Lancer le frontend

```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## Étape 4 : Lancer le Scheduler (automatisation)

Dans un 3ème terminal :

```bash
cd backend
php artisan schedule:work
```

Cela permet de vérifier automatiquement les nouveaux likes YouTube toutes les minutes.

## Étape 5 : Créer un compte utilisateur

1. Ouvrez votre navigateur sur `http://localhost:5173`
2. Créez un compte via l'interface
3. Connectez-vous

## Étape 6 : Configurer l'automatisation YouTube → Telegram

### 6.1 Créer un bot Telegram

1. Ouvrez Telegram
2. Cherchez `@BotFather`
3. Envoyez `/newbot`
4. Suivez les instructions
5. **Copiez le Bot Token** (format: `123456789:ABC-DEF...`)

### 6.2 Obtenir votre Chat ID

1. Cherchez `@userinfobot` dans Telegram
2. Envoyez `/start`
3. **Copiez votre Chat ID** (format: `1744435104`)

### 6.3 Connecter les services

1. Allez sur `http://localhost:5173/area/youtube_to_telegram`
2. Cliquez "Connect YouTube" → Autorisez l'accès à votre compte Google
3. Cliquez "Connect Telegram" → Entrez votre Bot Token et Chat ID
4. Cliquez "Create Automation"
5. Activez l'automatisation avec le toggle

## Test

1. Likez une vidéo sur YouTube
2. Attendez maximum 1 minute
3. Vous devriez recevoir un message sur Telegram avec les détails de la vidéo

## Résolution des Problèmes

### Erreur "Popup blocked"

Autorisez les popups pour `http://localhost:5173` dans votre navigateur.

### "Connect YouTube" tourne à l'infini

**Vérifiez que :**
1. Vous avez bien ajouté l'URL de redirection dans Google Cloud Console
2. L'URL dans `.env` correspond exactement à celle configurée dans Google Cloud
3. Le popup s'est bien ouvert (pas bloqué)
4. Vous avez bien autorisé l'accès dans la page Google

**Solution :** Ouvrez la console du navigateur (F12) et vérifiez les erreurs.

### Erreur "redirect_uri_mismatch"

L'URL de redirection dans votre `.env` ne correspond pas à celle configurée dans Google Cloud Console.

**Solution :**
- Vérifiez `YOUTUBE_REDIRECT_URI` dans `backend/.env`
- Vérifiez les "Authorized redirect URIs" dans Google Cloud Console
- Elles doivent être **exactement identiques**

### Le bot ne détecte pas les nouveaux likes

**Vérifiez que :**
1. Le scheduler tourne (`php artisan schedule:work`)
2. L'automatisation est bien activée (toggle vert)
3. Vous êtes bien connecté à YouTube et Telegram

**Logs :**
```bash
# Voir les logs du scheduler
tail -f backend/storage/logs/areas-check.log

# Voir les logs Laravel
tail -f backend/storage/logs/laravel.log
```

## Accès depuis une autre machine (réseau local)

Si vous voulez accéder au backend depuis une autre machine sur le même réseau :

1. Trouvez l'IP de la machine qui héberge le backend :
   ```bash
   ip addr show  # Linux
   ipconfig      # Windows
   ```

2. Lancez le backend sur toutes les interfaces :
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```

3. Ajoutez l'URL de redirection dans Google Cloud Console :
   ```
   http://[VOTRE_IP]:8000/api/oauth/youtube/callback
   ```

4. Mettez à jour `backend/.env` :
   ```env
   YOUTUBE_REDIRECT_URI=http://[VOTRE_IP]:8000/api/oauth/youtube/callback
   ```

5. Mettez à jour `frontend/.env` sur la machine cliente :
   ```env
   VITE_API_URL=http://[IP_DU_SERVEUR]:8000
   ```

## Support

Si vous rencontrez des problèmes, vérifiez :
1. Les logs : `backend/storage/logs/laravel.log`
2. La console du navigateur (F12)
3. Que tous les services tournent (backend, frontend, scheduler)
