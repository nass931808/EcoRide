

# 🌍 EcoRide - Plateforme de Covoiturage Écologique

**Projet ECF** | Développeur Angular - STUDI  

## 📋 À Propos

EcoRide est un projet d'évaluation (ECF) pour la formation Développeur Angular avec STUDI. C'est une plateforme de covoiturage permettant aux utilisateurs de partager des trajets et réduire leur empreinte carbone.

### 🎯 Objectif du Projet

EcoRide vise à créer un écosystème de mobilité partagée où les utilisateurs peuvent :
- **Publier des trajets** : Partager leurs trajets réguliers ou occasionnels
- **Rechercher des covoiturages** : Trouver des trajets correspondant à leurs besoins
- **Consulter les détails** : Visualiser les informations complètes d'un trajet (itinéraire, prix, conducteur, etc.)
- **Gérer leur profil** : Mettre à jour leurs informations personnelles et préférences
- **Consulter l'historique** : Retrouver tous les trajets passés et futurs
- **Contactez-nous** : Envoyer des messages aux administrateurs

## 🔧 Ce Qui a Été Fait

### Développement Frontend
- ✅ Création d'une **interface utilisateur responsive** et conviviale
- ✅ Navigation entre les différentes pages via un menu principal
- ✅ Intégration de **formulaires** pour la publication et la recherche de trajets
- ✅ Affichage dynamique des trajets avec détails complets
- ✅ Gestion du **profil utilisateur** avec édition des informations
- ✅ Pages de support : mentions légales, contact, page d'erreur 404
- ✅ Design écologique et moderne avec identité visuelle EcoRide

### Développement Backend
- ✅ Hébergement local via **Apache (XAMPP)**
- ✅ Virtual Host `ecoride.local` pour un accès direct
- ✅ Service des fichiers statiques (HTML, CSS, JS, images)

### Outils et Configurations
- ✅ Configuration **Apache (XAMPP)** pour l'hébergement local
- ✅ Configuration **VS Code** pour optimiser le développement
- ✅ Versioning avec **Git** pour le suivi des modifications

## 🏗️ Architecture et Structure du Site

### Structure des Dossiers

```
EcoRide/
├── pages/                    # Pages HTML
│   ├── Ecoride.html         # Page d'accueil
│   ├── covoiturages.html    # Recherche de covoiturages
│   ├── detail.html          # Détails d'un trajet
│   ├── profil.html          # Profil utilisateur
│   ├── historique.html      # Historique des trajets
│   ├── publiertrajet.html   # Publication de trajet
│   ├── contact.html         # Page de contact
│   ├── mentionlegale.html   # Mentions légales
│   └── 404.html             # Page d'erreur
├── styles/                   # Feuilles de style CSS
│   └── style.css            # Styles principaux
├── scripts/                  # Fichiers JavaScript
│   └── script.js            # Logique centralisée
├── images/                   # Images et ressources
│   ├── logo.png
│   └── background.png
├── README.md                 # Documentation
├── .vscode/                  # Configuration VS Code
└── .git/                     # Contrôle de version
```

### 📄 Description Détaillée des Pages

#### **1. Ecoride.html** (Page d'Accueil)
- Point d'entrée principal de l'application
- Affiche les trajets populaires et recommandés
- Contient des appels à l'action pour inciter les utilisateurs à publier ou rechercher des trajets
- Design attrayant avec des images et des témoignages

#### **2. covoiturages.html** (Recherche et Liste des Trajets)
- Barre de recherche avec filtres (lieu de départ, lieu d'arrivée, date, prix)
- Affichage en grille ou liste des trajets disponibles
- Chaque trajet affiche : conducteur, véhicule, prix, horaires, évaluation
- Possibilité de cliquer pour consulter les détails complets

#### **3. detail.html** (Détails d'un Trajet)
- Informations détaillées du trajet sélectionné
- Profil du conducteur avec avis et note
- Description du véhicule et des préférences du conducteur
- Bouton pour réserver ou demander à rejoindre le trajet
- Avis des passagers précédents

#### **4. profil.html** (Gestion du Profil Utilisateur)
- Affichage et édition des informations personnelles
- Photo de profil
- Historique des trajets en tant que conducteur et passager
- Évaluation et avis des autres utilisateurs
- Préférences et paramètres de confidentialité

#### **5. historique.html** (Historique des Trajets)
- Liste complète des trajets passés et futurs
- Tri par date, statut (réservé, complété, annulé)
- Détails de chaque trajet avec informations de contact
- Possibilité de consulter les avis laissés
- Fonctionnalités pour publier un avis après un trajet

#### **6. publiertrajet.html** (Publication de Trajet)
- Formulaire complet pour créer un nouveau trajet
- Champs : lieu de départ, lieu d'arrivée, date, heure, prix, places disponibles
- Description du trajet et préférences du conducteur
- Upload d'images du véhicule
- Bouton de soumission et validation des données

#### **7. contact.html** (Page de Contact)
- Formulaire de contact pour les utilisateurs
- Récupération du nom, email, sujet et message
- Adresse et moyens de contact de l'équipe EcoRide
- Liens vers les réseaux sociaux

#### **8. mentionlegale.html** (Mentions Légales)
- Conditions d'utilisation de la plateforme
- Politique de confidentialité
- Responsabilités des utilisateurs
- Informations légales et conformité RGPD

#### **9. 404.html** (Page d'Erreur)
- Affichée quand une page n'existe pas
- Design cohérent avec le reste du site
- Lien de retour vers l'accueil

### 💻 Fichiers Statiques

#### **styles/style.css**
- Feuille de style centralisée pour toute l'application
- Responsive design avec Media Queries pour mobile, tablette et desktop
- Variables CSS pour les couleurs, polices et espacements
- Classes réutilisables pour boutons, formulaires, cartes
- Animations et transitions fluides

#### **scripts/script.js**
- Logique JavaScript centralisée pour toute l'application
- Gestion des événements utilisateur (clics, soumissions)
- Validation des formulaires côté client
- Interactions dynamiques avec les éléments de la page
- Gestion de la navigation et des transitions
- Manipulation du DOM

#### **images/**
- Ressources visuelles : logos, icônes, images de fond
- Images des véhicules et trajets
- Illustrations pour le design

### 🖥️ Hébergement local

Le site est servi en local via **Apache (XAMPP)** :
- Accès : `http://ecoride.local` ou `http://localhost/EcoRide`
- Virtual Host configuré pour `ecoride.local`
- Fichiers statiques : HTML, CSS, JS, images

### 📦 Dépendances

Le projet est **100 % statique** :
- **HTML5** pour la structure
- **CSS3** pour le design responsive
- **JavaScript Vanilla** pour l'interactivité
- **Font Awesome 6.4** via CDN pour les icônes

### 🎨 Flux de Travail et Interactions

#### **Flux Utilisateur Typique**

1. **Accueil** → L'utilisateur arrive sur la page d'accueil (Ecoride.html)
2. **Recherche** → Navigue vers la page de recherche (covoiturages.html)
3. **Détails** → Clique sur un trajet pour voir les détails (detail.html)
4. **Publication** → S'il veut proposer un trajet, va vers publiertrajet.html
5. **Profil** → Consulte ou met à jour son profil (profil.html)
6. **Historique** → Vérifie ses trajets passés et futurs (historique.html)
7. **Contact** → Pour toute question, contacte l'équipe (contact.html)

#### **Interactions JavaScript**

- **Validation des formulaires** : Vérification des données avant soumission
- **Recherche dynamique** : Filtrage des trajets en temps réel
- **Navigation** : Transitions fluides entre les pages
- **Affichage conditionnel** : Masquage/affichage d'éléments selon le contexte



### 🌟 Points Forts du Projet

✨ **Interface Intuitive** : Design clair et facile à naviguer  
♻️ **Thème Écologique** : Identité visuelle en accord avec les valeurs environnementales  
📱 **Responsive** : Fonctionne sur tous les appareils (mobile, tablette, desktop)  
🔒 **Sécurité** : Formulaires validés côté client  
⚡ **Performance** : Chargement rapide avec architecture optimisée  

### 📝 Notes Importants

- Le projet utilise une architecture simple **client-server** avec HTML/CSS/JavaScript
- Les données sont actuellement statiques (pas de base de données)
- Pour une version production, il faudrait ajouter une vraie base de données (MongoDB, PostgreSQL)
- L'authentification utilisateur nécessiterait un système de login avec sessions/tokens

---

**Développé avec ❤️ pour un transport plus durable** 🌱


