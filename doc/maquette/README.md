# Maquettes AREA

Ce dossier contient toutes les maquettes HTML/CSS interactives pour le projet AREA.

## 📁 Structure

```
maquette/
├── index.html     # Page d'accueil principale
├── explore.html   # Catalogue des services
├── login.html     # Page de connexion
└── README.md      # Ce fichier
```

## 🚀 Utilisation

### Démarrer le serveur local

```bash
cd doc/maquette
python3 -m http.server 5000
```

Puis ouvrez votre navigateur sur : **http://localhost:5000**

### Navigation

- **Page d'accueil** : `index.html` - Vue d'ensemble d'AREA
- **Catalogue** : `explore.html` - Tous les services disponibles
- **Connexion** : `login.html` - Interface d'authentification

## ✨ Fonctionnalités

### 🏠 Page d'accueil (`index.html`)
- Hero section avec appels à l'action
- Aperçu des services populaires
- Explication en 3 étapes
- Prévisualisation du dashboard
- Design responsive

### 🔍 Catalogue (`explore.html`)
- 24+ services organisés par catégories
- Filtres de recherche fonctionnels
- Statuts des services (Disponible, Bêta, Bientôt)
- Descriptions détaillées
- Boutons d'action interactifs

### 🔐 Connexion (`login.html`)
- Design split-screen moderne
- Connexion sociale (Google, GitHub, Discord)
- Formulaire classique avec validation
- Identifiants de test : `demo@area.com` / `demo123`
- Animations et feedback utilisateur

## 🎨 Design

- **Palette** : Dégradés bleus/violets avec accents oranges
- **Typographie** : Segoe UI, moderne et lisible
- **Animations** : Transitions fluides et effets hover
- **Responsive** : Optimisé mobile, tablet, desktop

## 🔗 Navigation

Tous les liens internes sont configurés pour fonctionner dans cette structure :
- Navigation cohérente entre toutes les pages
- Boutons "Explore" pointent vers `explore.html`
- Bouton "Login" pointe vers `login.html`
- Logos et liens retour pointent vers `index.html`

## 💡 Test

Pour tester toutes les fonctionnalités :

1. **Page d'accueil** : Cliquez sur tous les boutons de navigation
2. **Catalogue** : Utilisez les filtres de recherche et catégories
3. **Connexion** : Testez avec `demo@area.com` / `demo123`

---

*Maquettes créées pour le projet AREA - Epitech 2025*