Projet réalisé par Michel Spruyt et Maxence Herbomel. Promotion : I5 FISA PAUC

🏭 Industrial Supervision System
Application web de supervision industrielle permettant de simuler un automate Modbus TCP, de collecter des mesures dans une base MariaDB et de visualiser en temps réel les paramètres surveillés (température, pression, vitesse, etc.) sur un tableau de bord.

✨ Fonctionnalités
🧪 Simulateur Modbus TCP écrit en Node.js (port 502) générant des valeurs réalistes sur plusieurs registres.
🧱 Backend Express exposant une API REST pour :
⚙️ la gestion des paramètres surveillés (CRUD),
📥 la collecte périodique des mesures,
📊 le calcul des statistiques globales (mesures, alertes, paramètres actifs),
📄 l’export CSV de l’historique des mesures.
🗄️ Base de données MariaDB pour stocker les paramètres, les mesures et les alertes.
💻 Frontend HTML/CSS/JS affichant :
🧾 la liste des paramètres surveillés,
📈 des graphiques temps réel (Chart.js) par paramètre,
🔢 les compteurs “Paramètres actifs”, “Mesures enregistrées” et “Alertes”.
🐳 Infrastructure Docker pour lancer l’ensemble (backend, base de données, proxy éventuel) en une commande.
🧩 Architecture
🔌 Simulateur Modbus TCP
Node.js, module net.
Écoute sur 0.0.0.0:502.
Registres simulés (exemples) :
4000 : température (0–1000 °C),
4001 : pression (0–10 bar, valeur ×10),
4002 : vitesse (0–3000 rpm).
🧠 Backend
Node.js + Express.
Client Modbus TCP qui interroge régulièrement le simulateur pour chaque paramètre actif.
Enregistre les valeurs dans la table measurements et crée des entrées dans alerts en cas de dépassement de seuils.
Expose les routes principales : /api/parameters, /api/measurements, /api/alerts, /api/stats, etc.
💾 Base de données
MariaDB.
Schéma minimal :
parameters : configuration des points de mesure (nom, IP automate, adresse Modbus, unité, min, max, actif…).
measurements : valeurs mesurées avec horodatage et lien vers un paramètre.
alerts : alertes générées lorsque les seuils sont dépassés.
🖥️ Frontend
HTML5, Bootstrap pour le layout, Chart.js pour les graphiques.
Communication uniquement via l’API REST (fetch vers /api/...).
Mise à jour automatique des graphes et des compteurs via des timers JavaScript.
📦 Prérequis
Node.js (version LTS recommandée).
Docker et Docker Compose.
Git pour cloner le dépôt.
Port 3307 libre sur la machine hôte (MariaDB).
Port 3000 libre (backend) et port 502 libre (simulateur Modbus).
🚀 Installation et lancement
Cloner le dépôt :
git clone https://github.com//industrial-supervision.git cd industrial-supervision

Créer le fichier d’environnement backend (si nécessaire) :
cp backend/.env.example backend/.env

Adapter les paramètres de connexion à la base (host, port, user, password, database).

Construire et lancer les services avec Docker :
docker-compose build docker-compose up

Backend : http://localhost:3000
MariaDB : 127.0.0.1:3307
Simulateur Modbus TCP : port 502 (dans le conteneur ou en local selon la config).
Ouvrir le frontend :
Ouvrir frontend/index.html avec un serveur statique (ex. Live Server VS Code) ou via le proxy Nginx si configuré.
Vérifier que API_BASE_URL dans frontend/js/api.js pointe vers http://localhost:3000/api.
📚 Utilisation
Configurer les paramètres via le bouton “Ajouter un paramètre” :

nom du paramètre (ex. “Température four 1”),
IP de l’automate (adresse du simulateur Modbus),
adresse Modbus (4000, 4001, 4002…),
unité, valeurs min/max, période de rafraîchissement.
Laisser tourner le système :

le backend interroge périodiquement l’automate simulé,
les mesures sont insérées en base,
les alertes sont créées automatiquement en cas de dépassement.
Visualiser :

les graphes temps réel pour chaque paramètre,
les compteurs globaux (mesures, alertes),
l’historique et l’export CSV pour un paramètre donné.
🧪 Tests et développement
Lancer uniquement le backend en développement :
cd backend npm install npm run dev

Lancer le simulateur Modbus TCP (hors Docker) :
cd simulator node modbus-simulator.js

Adapter les scripts et la configuration Docker selon le contexte (démo, développement, production).

👨‍💻 Auteurs
Projet réalisé dans le cadre d’un travail de développement d’un système de supervision web industriel.