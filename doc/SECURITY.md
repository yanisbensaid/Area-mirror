# 🔒 Sécurité - Projet AREA

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Sécurité de la base de données](#sécurité-de-la-base-de-données)
3. [Authentification et autorisation](#authentification-et-autorisation)
4. [Protection contre les attaques courantes](#protection-contre-les-attaques-courantes)
5. [Configuration de sécurité](#configuration-de-sécurité)
6. [Recommandations de sécurité](#recommandations-de-sécurité)
7. [Audit et monitoring](#audit-et-monitoring)

---

## Vue d'ensemble

Le projet AREA implémente plusieurs couches de sécurité pour protéger les données utilisateurs et assurer l'intégrité du système. Cette documentation présente les mesures de sécurité mises en place dans l'architecture Laravel/React.

### Architecture de sécurité

**Couches de protection :**
- **Frontend (React)** : Validation côté client, HTTPS, politiques CORS
- **Backend API (Laravel)** : Authentification Sanctum, protection CSRF, validation serveur
- **Base de données** : Chiffrement des données, contraintes d'intégrité, accès contrôlé

---

## Sécurité de la base de données

### 🗄️ Configuration de la base de données

**Connexions supportées :**
- PostgreSQL (recommandée pour la production)
- MySQL/MariaDB
- SQLite (développement uniquement)

**Mesures de sécurité :**

#### Chiffrement des mots de passe
Les mots de passe sont automatiquement chiffrés lors de leur stockage grâce au système de cast Laravel. Le champ password utilise le type 'hashed' qui applique un algorithme de hachage sécurisé (bcrypt par défaut).

#### Contraintes d'intégrité
- **Clés étrangères** : Activées par défaut pour maintenir l'intégrité référentielle
- **Index uniques** : Les emails utilisateur sont uniques dans la base
- **Suppression en cascade** : Les relations sont configurées pour éviter les données orphelines

#### Protection des données sensibles
Les champs sensibles (mots de passe, tokens de session) sont automatiquement exclus lors de la sérialisation des modèles utilisateur, empêchant leur exposition accidentelle dans les réponses API.

### 🔐 Gestion des tokens d'accès personnel

La table `personal_access_tokens` utilise Laravel Sanctum :
- Tokens uniques de 64 caractères
- Dates d'expiration configurables
- Révocation sécurisée des tokens

---

## Authentification et autorisation

### 🎫 Laravel Sanctum

**Configuration :**
Laravel Sanctum est configuré avec des domaines stateful pour le développement local (localhost, 127.0.0.1 sur différents ports). Les tokens sont actuellement configurés sans expiration, ce qui devrait être ajusté selon les besoins de sécurité.

### 👥 Système de rôles

**Rôles disponibles :**
- `user` : Utilisateur standard (par défaut)
- `admin` : Administrateur avec privilèges étendus

**Middleware de protection :**
Le middleware AdminMiddleware effectue une double vérification :
- Contrôle que l'utilisateur est bien authentifié
- Vérifie que l'utilisateur possède le rôle administrateur

En cas d'échec, des codes de réponse HTTP appropriés sont renvoyés (401 pour non authentifié, 403 pour accès refusé).

### 🔑 Gestion des sessions

**Protection des routes :**
- **Routes authentifiées** : Utilisent le middleware 'auth:sanctum' pour vérifier l'authentification
- **Routes administrateur** : Combinent l'authentification Sanctum et le middleware admin personnalisé
- **Séparation claire** : Les permissions sont organisées en groupes logiques selon les rôles

---

## Protection contre les attaques courantes

### 🛡️ Protection CSRF

**Configuration CORS :**
- **Chemins protégés** : Toutes les routes API et les cookies CSRF
- **Origines autorisées** : Uniquement les domaines de développement local
- **Credentials supportés** : Permet l'envoi de cookies pour l'authentification

**Implémentation côté frontend :**
Le frontend récupère automatiquement les tokens CSRF avant chaque requête API. Cette récupération se fait via un appel à l'endpoint sanctum/csrf-cookie avec les credentials activés pour maintenir la session.

### 🔍 Validation des entrées

**Validation stricte dans les contrôleurs :**
Toutes les entrées utilisateur sont validées avec des règles strictes :
- **Nom** : Obligatoire, chaîne de caractères, maximum 255 caractères
- **Email** : Format email valide, unique dans la base de données
- **Mot de passe** : Minimum 8 caractères, maximum 255 caractères

**Protection contre l'injection SQL :**
- Utilisation exclusive de l'ORM Eloquent
- Requêtes préparées automatiques
- Pas de requêtes SQL brutes

### 🚫 Protection XSS

**Mesures préventives :**
- Échappement automatique des données dans les vues Blade
- Validation stricte des entrées utilisateur
- Headers de sécurité configurés

---

## Configuration de sécurité

### 📊 Variables d'environnement sensibles

**Variables d'environnement critiques :**
- **APP_KEY** : Clé de chiffrement unique générée automatiquement
- **APP_DEBUG** : Doit être désactivé en production pour éviter l'exposition d'informations
- **APP_ENV** : Définit l'environnement (production, staging, development)
- **Variables database** : Credentials sécurisés avec utilisateur aux privilèges limités
- **Configuration mail** : SMTP avec chiffrement TLS obligatoire

### 🔐 Sécurisation des logs

**Configuration des logs :**
- Utilisation d'un système de logs en pile (stack)
- Enregistrement dans un canal unique pour centraliser les informations
- Conservation des exceptions pour le debugging interne

**Gestion d'erreurs sécurisée :**
- Les erreurs internes sont loggées mais jamais exposées à l'utilisateur final
- Messages d'erreur génériques pour éviter la fuite d'informations système
- Séparation entre logs techniques et messages utilisateur

---

## Recommandations de sécurité

### 🚀 Pour la production

#### 1. Configuration serveur
- **HTTPS obligatoire** : Configurer SSL/TLS pour chiffrer toutes les communications
- **Headers de sécurité** : Implémenter les headers de protection standard :
  - Protection contre le clickjacking (X-Frame-Options)
  - Prévention du MIME-type sniffing
  - Protection XSS intégrée du navigateur
  - Force HTTPS avec HSTS (Strict-Transport-Security)

#### 2. Base de données
- Utiliser PostgreSQL en production
- Chiffrer les connexions database (SSL)
- Limiter les privilèges utilisateur database
- Backups chiffrés réguliers

#### 3. Authentification renforcée
- **Expiration des tokens** : Configurer une durée de vie limitée (recommandé : 24 heures)
- **Rate limiting** : Limiter les tentatives de connexion (ex: 5 tentatives par minute)
- **Détection d'anomalies** : Surveiller les connexions depuis des localisations inhabituelles
- **Sessions multiples** : Gérer la révocation des tokens sur plusieurs appareils

#### 4. Monitoring et alertes
- Logs d'authentification
- Détection d'anomalies
- Alertes sur les tentatives d'intrusion

### 🔒 Mots de passe et tokens

#### Politique de mots de passe
**Recommandations pour une validation renforcée :**
- Minimum 12 caractères (actuellement 8)
- Combinaison obligatoire : majuscules, minuscules, chiffres, caractères spéciaux
- Confirmation du mot de passe requise
- Vérification contre les mots de passe compromis (haveibeenpwned.com)
- Historique des anciens mots de passe pour éviter la réutilisation

#### Rotation des clés
- Rotation régulière de `APP_KEY`
- Invalidation des tokens anciens
- Politique d'expiration des sessions

---

## Audit et monitoring

### 📊 Métriques de sécurité à surveiller

1. **Tentatives d'authentification**
   - Échecs de connexion répétés
   - Connexions depuis des IP suspectes
   - Utilisation de tokens expirés

2. **Accès aux données sensibles**
   - Accès admin non autorisés
   - Requêtes API anormales
   - Modifications de rôles utilisateur

3. **Intégrité système**
   - Erreurs d'application critiques
   - Tentatives d'injection SQL
   - Violations CORS

### 🛠️ Outils recommandés

- **Laravel Telescope** : Debugging et monitoring
- **Sentry** : Monitoring d'erreurs
- **LogRocket** : Session replay pour l'analyse de sécurité
- **Security Headers Scanner** : Vérification des headers

### 📝 Checklist de sécurité

#### Avant déploiement
- [ ] Variables d'environnement sécurisées
- [ ] `APP_DEBUG=false` en production
- [ ] HTTPS configuré
- [ ] Base de données avec utilisateur privilégié limité
- [ ] Clés de chiffrement générées de manière sécurisée
- [ ] Tests de sécurité effectués

#### Maintenance régulière
- [ ] Mise à jour des dépendances
- [ ] Audit des logs de sécurité
- [ ] Vérification des accès utilisateur
- [ ] Tests de pénétration périodiques
- [ ] Sauvegarde et restauration testées

---

## 🆘 Gestion des incidents

### Procédure en cas de compromission

1. **Détection et isolation**
   - Identifier la source de la compromission
   - Isoler les systèmes affectés

2. **Mesures d'urgence**
   - Invalider tous les tokens actifs
   - Forcer la reconnexion des utilisateurs
   - Changer les clés de chiffrement

3. **Analyse et correction**
   - Analyser les logs pour l'étendue des dégâts
   - Corriger les vulnérabilités identifiées
   - Notifier les utilisateurs si nécessaire

4. **Récupération**
   - Restaurer les services sécurisés
   - Mettre en place un monitoring renforcé
   - Documentation de l'incident

---

*Document mis à jour le : 29 septembre 2025*
*Version : 1.0*