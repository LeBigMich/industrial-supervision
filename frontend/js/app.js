let charts = {};
let parameters = [];

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Initialisation de l'application...");
    await loadParameters();
    startRealTimeUpdates();
});

// Charger tous les paramètres
async function loadParameters() {
    const result = await API.getParameters();

    if (result.success) {
        parameters = result.data;
        renderParametersList();
        updateStats();

        // Créer les graphiques
        parameters.forEach(param => {
            createChart(param);
        });
    } else {
        alert('Erreur lors du chargement des paramètres');
    }
}

// Afficher la liste des paramètres
function renderParametersList() {
    const list = document.getElementById('parameters-list');

    if (!parameters || parameters.length === 0) {
        list.innerHTML =
            '<li class="list-group-item text-muted text-center py-4">Aucun paramètre</li>';
        return;
    }

    list.innerHTML = '';
    parameters.forEach(param => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <strong>${param.name}</strong><br>
                    <small class="text-muted">${param.plc_ip}:${param.modbus_address}</small>
                </div>
                <div class="btn-group btn-group-sm ms-2">
                    <button class="btn btn-outline-primary" onclick="editParameter(${param.id})" title="Modifier">✏️</button>
                    <button class="btn btn-outline-danger" onclick="deleteParameter(${param.id})" title="Supprimer">🗑️</button>
                </div>
            </div>
        `;
        list.appendChild(li);
    });
}

// Créer un graphique
function createChart(parameter) {
    const container = document.getElementById('charts-container');

    // Carte
    const card = document.createElement('div');
    card.className = 'card mb-3';
    card.id = `chart-container-${parameter.id}`;

    // En-tête
    const header = document.createElement('div');
    header.className = 'card-header d-flex justify-content-between align-items-center';

    const titleDiv = document.createElement('div');
    const title = document.createElement('h6');
    title.className = 'mb-0';
    title.textContent = parameter.name;

    const subtitle = document.createElement('small');
    subtitle.className = 'text-muted';
    subtitle.textContent = parameter.unit || 'N/A';

    titleDiv.appendChild(title);
    titleDiv.appendChild(subtitle);

    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-outline-success';
    btn.title = 'Exporter en CSV';
    btn.textContent = '📥 CSV';
    btn.addEventListener('click', () => API.exportCSV(parameter.id));

    header.appendChild(titleDiv);
    header.appendChild(btn);

    // Corps
    const body = document.createElement('div');
    body.className = 'card-body';

    const canvas = document.createElement('canvas');
    canvas.id = `chart-${parameter.id}`;
    canvas.height = 80;

    body.appendChild(canvas);

    // Assembler la carte
    card.appendChild(header);
    card.appendChild(body);
    container.appendChild(card);

    // Créer le graphique Chart.js
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Impossible de récupérer le contexte 2D pour le paramètre', parameter.id);
        return;
    }

    charts[parameter.id] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: parameter.name,
                data: [],
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointRadius: 2,
                pointBackgroundColor: '#0d6efd'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: parameter.unit || ''
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Heure'
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            }
        }
    });
}


// Mise à jour temps réel
function startRealTimeUpdates() {
    setInterval(async () => {
        for (const param of parameters) {
            const result = await API.getMeasurements(param.id, 50);
            if (result.success && result.data && result.data.length > 0) {
                updateChart(param.id, result.data);
            }
        }
    }, 3000);
}

// Mettre à jour un graphique
function updateChart(parameterId, measurements) {
    const chart = charts[parameterId];
    if (!chart) return;

    measurements.reverse();
    const limitedData = measurements.slice(-50);

    chart.data.labels = limitedData.map(m => {
        const date = new Date(m.timestamp);
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    });

    chart.data.datasets[0].data = limitedData.map(m => m.value);
    chart.update('none');
}

// Mettre à jour les statistiques
function updateStats() {
    document.getElementById('active-count').textContent = parameters.length;
}

// Modal pour ajouter
function showAddParameterModal() {
    document.getElementById('modalTitle').textContent = 'Ajouter un paramètre';
    document.getElementById('parameter-form').reset();
    document.getElementById('parameter-id').value = '';
    new bootstrap.Modal(document.getElementById('parameterModal')).show();
}

// Éditer un paramètre
async function editParameter(id) {
    const result = await API.getParameter(id);
    if (result.success) {
        const param = result.data;

        document.getElementById('modalTitle').textContent = 'Modifier le paramètre';
        document.getElementById('parameter-id').value = param.id;
        document.getElementById('parameter-name').value = param.name;
        document.getElementById('parameter-ip').value = param.plc_ip;
        document.getElementById('parameter-address').value = param.modbus_address;
        document.getElementById('parameter-unit').value = param.unit || '';
        document.getElementById('parameter-min').value = param.min_value || '';
        document.getElementById('parameter-max').value = param.max_value || '';
        document.getElementById('parameter-refresh').value = param.refresh_rate;

        new bootstrap.Modal(document.getElementById('parameterModal')).show();
    } else {
        alert('Erreur: ' + result.error);
    }
}

// Sauvegarder un paramètre
async function saveParameter() {
    const id = document.getElementById('parameter-id').value;
    const data = {
        name: document.getElementById('parameter-name').value,
        plc_ip: document.getElementById('parameter-ip').value,
        modbus_address: parseInt(document.getElementById('parameter-address').value),
        unit: document.getElementById('parameter-unit').value,
        min_value: parseFloat(document.getElementById('parameter-min').value) || null,
        max_value: parseFloat(document.getElementById('parameter-max').value) || null,
        refresh_rate: parseInt(document.getElementById('parameter-refresh').value) || 5000
    };

    let result;
    if (id) {
        result = await API.updateParameter(id, data);
    } else {
        result = await API.createParameter(data);
    }

    if (result.success) {
        bootstrap.Modal.getInstance(document.getElementById('parameterModal')).hide();
        await loadParameters();
        location.reload();
    } else {
        alert('Erreur: ' + result.error);
    }
}

// Supprimer un paramètre
async function deleteParameter(id) {
    if (!confirm('Êtes-vous sûr?')) return;

    const result = await API.deleteParameter(id);
    if (result.success) {
        if (charts[id]) {
            charts[id].destroy();
            delete charts[id];
        }
        const container = document.getElementById(`chart-container-${id}`);
        if (container) container.remove();

        await loadParameters();
    } else {
        alert('Erreur: ' + result.error);
    }
}
