const net = require('net');

// Configuration
const PORT = 502;
const HOST = '0.0.0.0';

// Données simulées (registres Modbus)
const registers = {
    4000: () => Math.floor(Math.random() * 1000), // Température 0-1000°C
    4001: () => Math.floor(Math.random() * 100),  // Pression 0-10 bar (x10)
    4002: () => Math.floor(Math.random() * 3000), // Vitesse 0-3000 rpm
};

// Créer le serveur TCP
const server = net.createServer((socket) => {
    console.log(`✓ Client connecté: ${socket.remoteAddress}:${socket.remotePort}`);

    socket.on('data', (data) => {
        try {
            // Parser la requête Modbus (simplifié)
            const functionCode = data[7];
            const startAddress = data.readUInt16BE(8);
            const quantity = data.readUInt16BE(10);

            console.log(`📥 Requête: Function=${functionCode}, Address=${startAddress}, Qty=${quantity}`);

            if (functionCode === 3) { // Read Holding Registers
                // Générer la réponse
                const byteCount = quantity * 2;
                const response = Buffer.alloc(9 + byteCount);

                // Header MBAP
                response.writeUInt16BE(data.readUInt16BE(0), 0); // Transaction ID
                response.writeUInt16BE(0, 2); // Protocol ID
                response.writeUInt16BE(3 + byteCount, 4); // Length
                response.writeUInt8(data[6], 6); // Unit ID
                response.writeUInt8(functionCode, 7); // Function code
                response.writeUInt8(byteCount, 8); // Byte count

                // Valeurs des registres
                for (let i = 0; i < quantity; i++) {
                    const address = startAddress + i;
                    const value = registers[address] ? registers[address]() : 0;
                    response.writeUInt16BE(value, 9 + (i * 2));
                    console.log(`📤 Registre ${address} = ${value}`);
                }

                socket.write(response);
            }
        } catch (error) {
            console.error('❌ Erreur traitement requête:', error.message);
        }
    });

    socket.on('end', () => {
        console.log('✗ Client déconnecté');
    });

    socket.on('error', (err) => {
        console.error('❌ Erreur socket:', err.message);
    });
});

// Démarrer le serveur
server.listen(PORT, HOST, () => {
    console.log('\n🎯 ===================================');
    console.log('🎯 SIMULATEUR MODBUS TCP DÉMARRÉ');
    console.log(`🎯 Écoute sur ${HOST}:${PORT}`);
    console.log('🎯 ===================================\n');
    console.log('📊 Registres disponibles:');
    console.log('  - 4000: Température (0-1000°C)');
    console.log('  - 4001: Pression (0-10 bar)');
    console.log('  - 4002: Vitesse (0-3000 rpm)\n');
});

// Gestion arrêt propre
process.on('SIGINT', () => {
    console.log('\n\n🛑 Arrêt du simulateur...');
    server.close();
    process.exit(0);
});
