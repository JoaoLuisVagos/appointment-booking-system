CREATE DATABASE IF NOT EXISTS booking_system;
USE booking_system;

CREATE TABLE IF NOT EXISTS lojas (
    id INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(30) NULL,
    endereco VARCHAR(200) NULL,
    cor_primaria VARCHAR(7) NOT NULL DEFAULT '#0e7490',
    cor_secundaria_fonte VARCHAR(7) NOT NULL DEFAULT '#5f6f82',
    logo_url TEXT NULL,
    usuario_admin_id INT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'cliente',
    loja_id INT NULL,
    telefone VARCHAR(30) NULL,
    endereco VARCHAR(200) NULL,
    cidade VARCHAR(80) NULL,
    estado VARCHAR(40) NULL,
    cep VARCHAR(20) NULL,
    complemento VARCHAR(120) NULL,
    FOREIGN KEY (loja_id) REFERENCES lojas(id)
);

CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2),
    loja_id INT NULL,
    FOREIGN KEY (loja_id) REFERENCES lojas(id)
);

CREATE TABLE IF NOT EXISTS horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    produto_id INT,
    loja_id INT,
    data_hora DATETIME,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (loja_id) REFERENCES lojas(id)
);