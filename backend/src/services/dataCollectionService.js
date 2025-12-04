const cron = require('node-cron');
const db = require('../config/database');
const modbusService = require('./modbusService');

class DataCollectionService {
    constructor() {
        this.tasks = new Map();
        this.isRunning = false;
    }

    async start() {
        if (this.isRunning) return;
        
        console.log('🚀 Démarrage du service de collecte de données...');
        this.isRunning = true;
        
        // Tâche toutes les 2 secondes
        this.mainTask = cron.schedule('*/2 * * * * *', async () => {
            await this.collectData();
        });
        
        console.log('✓ Service de collecte démarré');
    }

   async collectData() {
  try {
    const [parameters] = await db.query(
      'SELECT * FROM parameters WHERE is_active = TRUE'
    );

    for (const param of parameters) {
      try {
        let value;

        // Si le paramètre est une coil (bit %Mxxx)
        if (param.data_type === 'coil') {
          value = await modbusService.readCoil(param.plc_ip, param.modbus_address);
        } else {
          // Sinon, registre analogique
          value = await modbusService.readRegister(param.plc_ip, param.modbus_address);
        }

        if (value !== null && value !== undefined) {
          await db.query(
            'INSERT INTO measurements (parameter_id, value) VALUES (?, ?)',
            [param.id, value]
          );

          if (param.min_value !== null && value < param.min_value) {
            await this.triggerAlert(
              param.id,
              'MIN',
              `Valeur ${value} en-dessous du minimum ${param.min_value}`
            );
          }
          if (param.max_value !== null && value > param.max_value) {
            await this.triggerAlert(
              param.id,
              'MAX',
              `Valeur ${value} au-dessus du maximum ${param.max_value}`
            );
          }
        }
      } catch (error) {
        console.error(`Erreur collecte paramètre ${param.id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Erreur collecte générale:', error);
  }
}


    async triggerAlert(parameterId, type, message) {
        try {
            await db.query(
                'INSERT INTO alerts (parameter_id, alert_type, message) VALUES (?, ?, ?)',
                [parameterId, type, message]
            );
            console.log(`⚠️ Alerte: ${message}`);
        } catch (error) {
            console.error('Erreur alerte:', error);
        }
    }

    stop() {
        if (this.mainTask) {
            this.mainTask.stop();
            this.isRunning = false;
            modbusService.disconnectAll();
            console.log('⛔ Service de collecte arrêté');
        }
    }
}

module.exports = new DataCollectionService();
