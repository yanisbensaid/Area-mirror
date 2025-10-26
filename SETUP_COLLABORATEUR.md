# AREA - Guide de Configuration Rapide (Collaborateur)

> **Note :** Ce guide utilise les credentials Google OAuth partagés. Vous n'avez PAS besoin de créer votre propre projet Google Cloud.

## Prérequis

- PHP 8.2+
- Node.js 18+
- Composer
- npm

## Étape 1 : Cloner le Projet

```bash
git clone <url_du_repo>
cd G-DEV-500-MPL-5-1-area-2
```

## Étape 2 : Configuration du Backend

### 2.1 Installer les dépendances

```bash
cd backend
composer install
```

### 2.2 Copier et configurer .env

```bash
cp .env.example .env
```

Éditez `backend/.env` et ajoutez les credentials partagés :

```env
# NE MODIFIEZ PAS CES VALEURS - Elles sont partagées
YOUTUBE_CLIENT_ID=682722815143-c6g1v3mq2q082qkc36d5pcmn060rb4ol.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=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
YOUTUBE_REDIRECT_URI=http://localhost:8000/api/oauth/youtube/callback
```

### 2.3 Générer la clé et créer la base de données

```bash
php artisan key:generate
touch database/database.sqlite
php artisan migrate
```

### 2.4 Lancer le backend

```bash
php artisan serve
```

✅ Backend accessible sur `http://localhost:8000`

## Étape 3 : Configuration du Frontend

Dans un nouveau terminal :

```bash
cd frontend
npm install
```

Vérifiez que `frontend/.env` contient :
```env
VITE_API_URL=http://localhost:8000
```

### 3.2 Lancer le frontend

```bash
npm run dev
```

✅ Frontend accessible sur `http://localhost:5173`

## Étape 4 : Lancer le Scheduler (automatisation)

Dans un 3ème terminal :

```bash
cd backend
php artisan schedule:work
```

## Étape 5 : Créer un Compte et Tester

1. Ouvrez `http://localhost:5173`
2. Créez un compte
3. Allez sur `/area/youtube_to_telegram`
4. Cliquez "Connect YouTube" → Autorisez l'accès
5. Configurez Telegram (voir section suivante)
6. Créez et activez l'automatisation
7. Likez une vidéo YouTube → Message Telegram reçu en ~1 minute !

## Configuration Telegram

### Créer un bot Telegram

1. Ouvrez Telegram
2. Cherchez **@BotFather**
3. Envoyez `/newbot`
4. Suivez les instructions
5. **Copiez le Bot Token** (format: `123456789:ABC-DEF...`)

### Obtenir votre Chat ID

1. Cherchez **@userinfobot** dans Telegram
2. Envoyez `/start`
3. **Copiez votre Chat ID** (format: `1744435104`)

### Connecter Telegram dans l'interface

1. Sur la page AREA, cliquez "Connect Telegram"
2. Entrez votre **Bot Token** et **Chat ID**
3. Cliquez "Connect Bot"

## Résolution des Problèmes

### "Connect YouTube" tourne à l'infini

**Solution :** Ouvrez la console du navigateur (F12) et vérifiez les erreurs.

**Causes possibles :**
- Popup bloquée → Autorisez les popups
- Backend pas lancé → Vérifiez `http://localhost:8000`
- Credentials incorrects → Vérifiez le `.env`

### Erreur "redirect_uri_mismatch"

**Raison :** Votre URL de redirection n'est pas autorisée.

**Solution :** Contactez l'administrateur du projet pour qu'il ajoute votre URL dans Google Cloud Console :
```
http://localhost:8000/api/oauth/youtube/callback
```

Ou si vous accédez via une IP :
```
http://VOTRE_IP:8000/api/oauth/youtube/callback
```

### Le bot ne détecte pas les nouveaux likes

**Vérifiez :**
1. Le scheduler tourne (`php artisan schedule:work` dans un terminal)
2. L'automatisation est activée (toggle vert)
3. Vous avez bien connecté YouTube ET Telegram

**Logs :**
```bash
# Voir les checks automatiques
tail -f backend/storage/logs/areas-check.log

# Voir les erreurs
tail -f backend/storage/logs/laravel.log
```

## Accès depuis une Machine Différente (Réseau Local)

Si vous voulez accéder depuis un autre ordinateur sur le même réseau :

### Sur la machine serveur :

1. Trouvez votre IP locale :
   ```bash
   # Linux/Mac
   ip addr show
   # ou
   ifconfig

   # Windows
   ipconfig
   ```
   Exemple : `192.168.1.50`

2. Lancez le backend sur toutes les interfaces :
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```

3. **IMPORTANT :** Contactez l'administrateur pour qu'il ajoute dans Google Cloud Console :
   ```
   http://192.168.1.50:8000/api/oauth/youtube/callback
   ```

4. Mettez à jour `backend/.env` :
   ```env
   YOUTUBE_REDIRECT_URI=http://192.168.1.50:8000/api/oauth/youtube/callback
   APP_URL=http://192.168.1.50:8000
   ```

### Sur la machine cliente :

1. Mettez à jour `frontend/.env` :
   ```env
   VITE_API_URL=http://192.168.1.50:8000
   ```

2. Relancez le frontend :
   ```bash
   npm run dev
   ```

3. Accédez à `http://localhost:5173` (ou l'IP affichée par Vite)

## Commandes Utiles

```bash
# Vérifier que le backend répond
curl http://localhost:8000/api/services

# Voir les AREAs actives
php artisan tinker
>>> App\Models\Area::where('active', true)->get()

# Forcer un check manuel
php artisan areas:check

# Vider le cache
php artisan cache:clear
```

## Aide

En cas de problème :
1. Vérifiez que les 3 services tournent (backend, frontend, scheduler)
2. Consultez les logs : `backend/storage/logs/laravel.log`
3. Ouvrez la console du navigateur (F12)
4. Vérifiez votre connexion Internet
