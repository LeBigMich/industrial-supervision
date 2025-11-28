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



GRANT ALL PRIVILEGES ON industrial_monitoring.* TO 'industrial_user'@'%';
FLUSH PRIVILEGES;
