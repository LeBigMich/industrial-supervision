const ModbusRTU = require('modbus-serial');

class ModbusService {
    constructor() {
        this.clients = new Map();
        this.connectionTimeout = 5000;
    }

    async connect(ip, port = 502) {
        // Retourner si déjà connecté
        if (this.clients.has(ip)) {
            return this.clients.get(ip);
        }

        const client = new ModbusRTU();
        
        try {
            await Promise.race([
                client.connectTCP(ip, { port }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Connexion timeout')), this.connectionTimeout)
                )
            ]);
            
            client.setID(1);
            this.clients.set(ip, client);
            console.log(`✓ Connecté au PLC: ${ip}`);
            return client;
        } catch (error) {
            console.error(`✗ Erreur connexion ${ip}:`, error.message);
            throw error;
        }
    }

    async readRegister(ip, address) {
        try {
            const client = await this.connect(ip);
            const data = await client.readHoldingRegisters(address, 1);
            return data.data[0];
        } catch (error) {
            console.error(`✗ Erreur lecture registre ${address}:`, error.message);
            return null;
        }
    }

async readCoil(ip, address) {
  try {
    const client = await this.connect(ip);
    const data = await client.readCoils(address, 1);
    const bit = data.data[0];   // true / false
    return bit ? 1 : 0;         // stocké en 1 ou 0
  } catch (error) {
    console.error(`✗ Erreur lecture coil ${address}:`, error.message);
    return null;
  }
}

    disconnect(ip) {
        const client = this.clients.get(ip);
        if (client) {
            client.close();
            this.clients.delete(ip);
            console.log(`✓ Déconnecté: ${ip}`);
        }
    }

    disconnectAll() {
        for (const [ip, client] of this.clients) {
            client.close();
        }
        this.clients.clear();
    }
}

module.exports = new ModbusService();
