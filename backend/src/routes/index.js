const express = require('express');
const router = express.Router();
const parameterController = require('../controllers/parameterController');
const measurementController = require('../controllers/measurementController');

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

module.exports = router;
