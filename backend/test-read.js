const modbusService = require('./src/services/modbusService');

(async () => {
  try {
    const value = await modbusService.readRegister('172.16.1.24', 4000);
    console.log('Valeur registre 4000 =', value);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
