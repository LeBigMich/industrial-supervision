const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ModbusRTU = require('modbus-serial');



const dataCollectionService = require('./services/dataCollectionService');
const db = require('./config/database'); // pool MySQL2


const app = express();
const PORT = process.env.PORT || 3000;


// ==================== MIDDLEWARES ====================


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', require('./routes/index'));


// ==================== SANTÉ ====================


app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});


// ==================== PARAMÈTRES EN BASE ====================


// Récupérer tous les paramètres
app.get('/api/parameters', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM parameters ORDER BY id');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Erreur GET /api/parameters:', err);
    res.status(500).json({ success: false, error: 'Erreur base de données' });
  }
});


// Récupérer un paramètre par id
app.get('/api/parameters/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [rows] = await db.query('SELECT * FROM parameters WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Erreur GET /api/parameters/:id:', err);
    res.status(500).json({ success: false, error: 'Erreur base de données' });
  }
});


// Créer un paramètre
app.post('/api/parameters', async (req, res) => {
  const b = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO parameters
        (name, plc_ip, modbus_address, unit, min_value, max_value, refresh_rate, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.name,
        b.plc_ip,
        b.modbus_address,
        b.unit || null,
        b.min_value,
        b.max_value,
        b.refresh_rate || 5000,
        1 // actif par défaut
      ]
    );
    const [rows] = await db.query('SELECT * FROM parameters WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Erreur POST /api/parameters:', err);
    res.status(500).json({ success: false, error: 'Erreur base de données' });
  }
});


// Mettre à jour un paramètre
app.put('/api/parameters/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const b = req.body;
  try {
    const [result] = await db.query(
      `UPDATE parameters
       SET name = ?, plc_ip = ?, modbus_address = ?, unit = ?, min_value = ?, max_value = ?, refresh_rate = ?
       WHERE id = ?`,
      [
        b.name,
        b.plc_ip,
        b.modbus_address,
        b.unit || null,
        b.min_value,
        b.max_value,
        b.refresh_rate || 5000,
        id
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    const [rows] = await db.query('SELECT * FROM parameters WHERE id = ?', [id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Erreur PUT /api/parameters/:id:', err);
    res.status(500).json({ success: false, error: 'Erreur base de données' });
  }
});


// Supprimer un paramètre
app.delete('/api/parameters/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [result] = await db.query('DELETE FROM parameters WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur DELETE /api/parameters/:id:', err);
    res.status(500).json({ success: false, error: 'Erreur base de données' });
  }
});


// ==================== MESURES & ALERTES ====================


// Récupérer les mesures d'un paramètre
app.get('/api/measurements/:parameterId', async (req, res) => {
  const parameterId = parseInt(req.params.parameterId, 10);
  const limit = parseInt(req.query.limit || '50', 10);


  try {
    const [params] = await db.query('SELECT id FROM parameters WHERE id = ?', [parameterId]);
    if (params.length === 0) {
      return res.status(404).json({ success: false, error: 'Paramètre introuvable' });
    }


    const [rows] = await db.query(
      `SELECT * FROM measurements
       WHERE parameter_id = ?
       ORDER BY timestamp DESC
       LIMIT ?`,
      [parameterId, limit]
    );


    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Erreur GET /api/measurements/:parameterId:', err);
    res.status(500).json({ success: false, error: 'Erreur base de données' });
  }
});


// Statistiques globales (pour les tuiles du dashboard)
app.get('/api/stats', async (req, res) => {
  try {
    const [[m]] = await db.query('SELECT COUNT(*) AS nb FROM measurements');
    const [[a]] = await db.query('SELECT COUNT(*) AS nb FROM alerts');
    const [[p]] = await db.query('SELECT COUNT(*) AS nb FROM parameters WHERE is_active = 1');


    res.json({
      success: true,
      measurements: m.nb,
      alerts: a.nb,
      activeParameters: p.nb
    });
  } catch (err) {
    console.error('Erreur GET /api/stats:', err);
    res.status(500).json({ success: false, error: 'Erreur base de données' });
  }
});


// ==================== MODBUS ====================


// Lecture Modbus TCP (formulaire "Lancer la lecture")
app.post('/api/modbus-read', async (req, res) => {
  const { ip, adresse } = req.body;


  if (!ip || typeof adresse !== 'number') {
    return res.status(400).json({ success: false, error: 'IP ou adresse manquante' });
  }


  const client = new ModbusRTU();


  try {
    await client.connectTCP(ip, { port: 502 });
    client.setID(1);


    const data = await client.readCoils(adresse, 1);
    const etat = data.data[0];


    res.json({ success: true, etat });
  } catch (err) {
    console.error('Erreur Modbus:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    try { client.close(); } catch (e) {}
  }
});


// ==================== DÉMARRAGE ====================


app.listen(PORT, () => {
  console.log(`\n🌐 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api\n`);
  dataCollectionService.start();
});


// Arrêt propre
process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  dataCollectionService.stop();
  process.exit(0);
});