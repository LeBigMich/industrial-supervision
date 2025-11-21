const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');
const dataCollectionService = require('./services/dataCollectionService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Santé du serveur
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`\n🌐 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📊 API disponible sur http://localhost:${PORT}/api\n`);
    
    // Démarrer la collecte de données
    dataCollectionService.start();
});

// Arrêt propre
process.on('SIGTERM', () => {
    console.log('\n🛑 Arrêt du serveur...');
    dataCollectionService.stop();
    process.exit(0);
});
