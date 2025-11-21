const db = require('../config/database');

class ParameterController {
    async getAll(req, res) {
        try {
            const [parameters] = await db.query(
                'SELECT * FROM parameters WHERE is_active = TRUE ORDER BY created_at DESC'
            );
            res.json({ success: true, data: parameters });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const [parameters] = await db.query(
                'SELECT * FROM parameters WHERE id = ?',
                [req.params.id]
            );
            if (parameters.length === 0) {
                return res.status(404).json({ success: false, error: 'Paramètre non trouvé' });
            }
            res.json({ success: true, data: parameters[0] });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async create(req, res) {
        const { name, plc_ip, modbus_address, unit, refresh_rate, min_value, max_value } = req.body;
        
        if (!name || !plc_ip || modbus_address === undefined) {
            return res.status(400).json({ success: false, error: 'Champs requis manquants' });
        }

        try {
            const [result] = await db.query(
                'INSERT INTO parameters (name, plc_ip, modbus_address, unit, refresh_rate, min_value, max_value) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [name, plc_ip, modbus_address, unit, refresh_rate || 5000, min_value || null, max_value || null]
            );
            res.status(201).json({ 
                success: true, 
                data: { id: result.insertId, ...req.body } 
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async update(req, res) {
        const { name, plc_ip, modbus_address, unit, refresh_rate, min_value, max_value } = req.body;
        
        try {
            await db.query(
                'UPDATE parameters SET name=?, plc_ip=?, modbus_address=?, unit=?, refresh_rate=?, min_value=?, max_value=? WHERE id=?',
                [name, plc_ip, modbus_address, unit, refresh_rate, min_value, max_value, req.params.id]
            );
            res.json({ success: true, message: 'Paramètre mis à jour' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await db.query('UPDATE parameters SET is_active = FALSE WHERE id = ?', [req.params.id]);
            res.json({ success: true, message: 'Paramètre supprimé' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new ParameterController();
