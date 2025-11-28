# Industrial Supervision System

Système de supervision industrielle open source pour surveiller les automates du labo en temps réel via le protocole Modbus TCP/IP.

## 📋 Table des matières

- [À propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancement](#lancement)
- [Utilisation](#utilisation)
- [API REST](#api-rest)
- [Tests](#tests)
- [Contribution](#contribution)
- [Auteurs](#auteurs)

---

## 🎯 À propos

Ce projet est un système de supervision industrielle développé dans le cadre d'un TP de déploiement d'un système d'information. Il permet de :

- Surveiller en temps réel les paramètres industriels (température, pression, vitesse)
- Visualiser les données sous forme de graphiques interactifs
- Enregistrer l'historique des mesures dans une base de données
- Exporter les données en CSV
- Gérer des alertes basées sur des seuils min/max

**Contexte :** Projet académique - IUT/École d'ingénieurs  
**Date :** Novembre 2025  
**Durée de développement :** ~5 jours

---

## ✨ Fonctionnalités

### Frontend
- ✅ Interface web responsive (Bootstrap 5)
- ✅ Graphiques temps réel animés (Chart.js)
- ✅ Visualisation de 3 paramètres simultanément
- ✅ Export des données en CSV
- ✅ Gestion des paramètres (CRUD)
- ✅ Système d'alertes visuelles

### Backend
- ✅ API REST (Node.js + Express)
- ✅ Communication Modbus TCP/IP
- ✅ Collecte automatique des données (toutes les 2 secondes)
- ✅ Stockage en base de données
- ✅ Gestion des erreurs et reconnexion automatique

### Database
- ✅ Base de données MariaDB
- ✅ Schéma relationnel normalisé
- ✅ Historisation des mesures
- ✅ Gestion des alertes

---

## 🛠️ Technologies utilisées

### Frontend
- **HTML5, CSS3, JavaScript** - Structure et interactivité
- **Bootstrap 5** - Framework CSS responsive
- **Chart.js** - Visualisation de données
- **Nginx** - Serveur web et reverse proxy

### Backend
- **Node.js 20** - Environnement d'exécution JavaScript
- **Express.js** - Framework web minimaliste
- **modbus-serial** - Communication Modbus TCP/IP
- **mysql2** - Driver MySQL/MariaDB

### Base de données
- **MariaDB 10.11** - Système de gestion de base de données

### DevOps
- 
