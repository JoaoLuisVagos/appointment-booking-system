CREATE DATABASE IF NOT EXISTS booking_system;
USE booking_system;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'cliente',
    loja_id INT NULL,
    FOREIGN KEY (loja_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2),
    loja_id INT NULL,
    FOREIGN KEY (loja_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    produto_id INT,
    loja_id INT,
    data_hora DATETIME,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (loja_id) REFERENCES usuarios(id)
);