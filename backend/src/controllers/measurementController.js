const db = require('../config/database');

class MeasurementController {
    async getByParameter(req, res) {
        const { parameterId } = req.params;
        const { limit = 100, from, to } = req.query;
        
        try {
            let query = 'SELECT * FROM measurements WHERE parameter_id = ?';
            let params = [parameterId];
            
            if (from && to) {
                query += ' AND timestamp BETWEEN ? AND ?';
                params.push(from, to);
            }
            
            query += ' ORDER BY timestamp DESC LIMIT ?';
            params.push(parseInt(limit));
            
            const [measurements] = await db.query(query, params);
            res.json({ success: true, data: measurements });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getLatest(req, res) {
        try {
            const [measurements] = await db.query(`
                SELECT p.id, p.name, p.unit, m.value, m.timestamp
                FROM parameters p
                LEFT JOIN measurements m ON p.id = m.parameter_id
                WHERE p.is_active = TRUE
                AND m.timestamp = (
                    SELECT MAX(timestamp) FROM measurements WHERE parameter_id = p.id
                )
                ORDER BY m.timestamp DESC
            `);
            res.json({ success: true, data: measurements });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async exportCSV(req, res) {
        const { parameterId } = req.params;
        const { from, to } = req.query;
        
        try {
            let query = `
                SELECT m.timestamp, p.name, m.value, p.unit 
                FROM measurements m 
                JOIN parameters p ON m.parameter_id = p.id 
                WHERE m.parameter_id = ?
            `;
            let params = [parameterId];
            
            if (from && to) {
                query += ' AND m.timestamp BETWEEN ? AND ?';
                params.push(from, to);
            }
            
            query += ' ORDER BY m.timestamp ASC';
            
            const [measurements] = await db.query(query, params);
            
            let csv = 'Timestamp,Parameter,Value,Unit\n';
            measurements.forEach(row => {
                csv += `"${row.timestamp}","${row.name}",${row.value},"${row.unit}"\n`;
            });
            
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=data_${parameterId}_${new Date().toISOString().split('T')[0]}.csv`);
            res.send(csv);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new MeasurementController();
