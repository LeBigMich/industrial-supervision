// Configuration de l'API
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : '/api';

class API {
    // ====== PARAMÈTRES ======
    
    static async getParameters() {
        try {
            const response = await fetch(`${API_BASE_URL}/parameters`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Erreur getParameters:', error);
            return { success: false, error: error.message };
        }
    }

    static async getParameter(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/parameters/${id}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Erreur getParameter:', error);
            return { success: false, error: error.message };
        }
    }

    static async createParameter(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/parameters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Erreur createParameter:', error);
            return { success: false, error: error.message };
        }
    }

    static async updateParameter(id, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/parameters/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Erreur updateParameter:', error);
            return { success: false, error: error.message };
        }
    }

    static async deleteParameter(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/parameters/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Erreur deleteParameter:', error);
            return { success: false, error: error.message };
        }
    }

    // ====== MESURES ======

    static async getMeasurements(parameterId, limit = 100) {
        try {
            const response = await fetch(`${API_BASE_URL}/measurements/${parameterId}?limit=${limit}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Erreur getMeasurements:', error);
            return { success: false, error: error.message };
        }
    }

    static async getLatestMeasurements() {
        try {
            const response = await fetch(`${API_BASE_URL}/measurements/latest`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Erreur getLatestMeasurements:', error);
            return { success: false, error: error.message };
        }
    }

    static async exportCSV(parameterId) {
        const url = `${API_BASE_URL}/measurements/${parameterId}/export`;
        const link = document.createElement('a');
        link.href = url;
        link.download = `measurements_${parameterId}.csv`;
        link.click();
    }
}
