CREATE DATABASE IF NOT EXISTS industrial_monitoring;
USE industrial_monitoring;

CREATE TABLE parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    plc_ip VARCHAR(15) NOT NULL,
    modbus_address INT NOT NULL,
    unit VARCHAR(20),
    refresh_rate INT DEFAULT 5000,
    min_value FLOAT,
    max_value FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_active (is_active),
    INDEX idx_ip_address (plc_ip, modbus_address)
);

CREATE TABLE measurements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parameter_id INT NOT NULL,
    value FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parameter_id) REFERENCES parameters(id) ON DELETE CASCADE,
    INDEX idx_parameter_time (parameter_id, timestamp DESC)
);

CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parameter_id INT NOT NULL,
    alert_type ENUM('MIN', 'MAX', 'TIMEOUT') NOT NULL,
    message TEXT,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parameter_id) REFERENCES parameters(id) ON DELETE CASCADE,
    INDEX idx_triggered (triggered_at DESC)
);

INSERT INTO parameters (name, plc_ip, modbus_address, unit, refresh_rate, min_value, max_value) 
VALUES 
    ('Temperature Four 1', '192.168.1.10', 4000, 'C', 5000, 0, 1000),
    ('Pression Cuve A', '192.168.1.11', 4001, 'bar', 3000, 0, 10),
    ('Vitesse Moteur', '192.168.1.12', 4002, 'rpm', 2000, 0, 3000);

GRANT ALL PRIVILEGES ON industrial_monitoring.* TO 'industrial_user'@'%';
FLUSH PRIVILEGES;
