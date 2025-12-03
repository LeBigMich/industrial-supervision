const express = require('express');
const router = express.Router();
const parameterController = require('../controllers/parameterController');
const measurementController = require('../controllers/measurementController');
const db = require('../config/database');
// Routes des paramètres
router.get('/parameters', parameterController.getAll.bind(parameterController));
router.get('/parameters/:id', parameterController.getById.bind(parameterController));
router.post('/parameters', parameterController.create.bind(parameterController));
router.put('/parameters/:id', parameterController.update.bind(parameterController));
router.delete('/parameters/:id', parameterController.delete.bind(parameterController));

// Routes des mesures
router.get('/measurements/latest', measurementController.getLatest.bind(measurementController));
router.get('/measurements/:parameterId', measurementController.getByParameter.bind(measurementController));
router.get('/measurements/:parameterId/export', measurementController.exportCSV.bind(measurementController));


// Route de stats globales pour le dashboard
router.get('/stats', async (req, res) => {
  try {
    const [mRows] = await db.query('SELECT COUNT(*) AS count FROM measurements');
    const [aRows] = await db.query('SELECT COUNT(*) AS count FROM alerts');
    const [pRows] = await db.query('SELECT COUNT(*) AS count FROM parameters WHERE is_active = TRUE');

    res.json({
      success: true,
      measurements: mRows[0].count,
      alerts: aRows[0].count,
      activeParameters: pRows[0].count
    });
  } catch (err) {
    console.error('Erreur /api/stats:', err);
    res.status(500).json({ success: false, error: 'Erreur stats' });
  }
});

module.exports = router;
