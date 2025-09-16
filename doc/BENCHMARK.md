# 🔹 Benchmark comparatif des technologies utilisées

## ⚡ Front-end

### **React**
- **Points forts :**
  - Bibliothèque JavaScript très populaire et largement adoptée.
  - Réutilisation des composants → cohérence et gain de temps.
  - Large écosystème (Redux, Next.js, Material UI…).
  - Grande communauté, documentation abondante.
- **Comparaison avec concurrents :**
  - Plus populaire et soutenu que **Vue.js** (plus simple mais moins répandu).
  - Plus flexible et modulable qu’**Angular** (plus lourd et rigide).
  - Offre plus de liberté que **Svelte**, qui est plus jeune et moins répandu.

---

## ⚡ Back-end

### **Laravel**
- **Points forts :**
  - Framework PHP complet, riche en fonctionnalités prêtes à l’emploi (authentification, validation, sécurité, ORM Eloquent).
  - Grande communauté et documentation détaillée.
  - Architecture claire et respect des bonnes pratiques (MVC).
  - Idéal pour développer rapidement des applications web robustes.
- **Comparaison avec concurrents :**
  - Plus simple à prendre en main que **Symfony** (plus complexe et verbeux).
  - Plus riche en outils intégrés qu’**Express.js** (Node.js, minimaliste).
  - Plus adapté à des applications web structurées que **Django** (Python), qui peut être plus lourd pour de petits projets.

---

## ⚡ Liaison Front/Back

### **Inertia.js**
- **Points forts :**
  - Permet de relier directement Laravel (backend) et React (frontend) sans passer par une API REST ou GraphQL complexe.
  - Simplifie le développement full-stack : pas besoin de gérer deux applications séparées.
  - Expérience utilisateur fluide similaire à une SPA (Single Page Application).
- **Comparaison avec concurrents :**
  - Plus léger et simple que **Next.js** ou **Nuxt.js** (nécessitent une configuration plus avancée).
  - Moins complexe que mettre en place une API REST complète ou GraphQL, ce qui est souvent surdimensionné pour de petits/moyens projets.
  - Plus intégré à Laravel que des solutions comme **Apollo GraphQL**.

---

## ⚡ Base de données

### **SQLite**
- **Points forts :**
  - Base de données légère, intégrée dans un simple fichier.
  - Parfaite pour le développement rapide et les projets de petite/moyenne taille.
  - Pas besoin de configuration complexe (contrairement à MySQL ou PostgreSQL).
  - Très rapide pour les requêtes locales.
- **Comparaison avec concurrents :**
  - Plus simple et portable que **MySQL** ou **PostgreSQL** (nécessitent un serveur dédié).
  - Idéale pour un projet étudiant ou un prototype, contrairement à **Oracle DB** ou **SQL Server**, qui sont pensés pour les environnements d’entreprise.
  - Plus efficace pour du développement local que **MongoDB** (base NoSQL, orientée documents).

---

# ✅ Conclusion

Notre stack technologique repose sur un **équilibre entre simplicité, performance et efficacité** :

- **Laravel** assure un backend robuste et rapide à développer.
- **React** offre un frontend moderne, réactif et populaire.
- **Inertia.js** simplifie la liaison entre les deux mondes, évitant une architecture lourde.
- **SQLite** fournit une base de données légère et parfaitement adaptée à notre contexte.

👉 Ce choix nous permet de travailler efficacement, avec des outils modernes, tout en évitant une complexité excessive.