DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

USE employees_db;

CREATE TABLE employees (
    firtsName VARCHAR(30) NOT NULL,
    lastName VARCHAR(30) NOT NULL,
    title VARCHAR(30)  NOT NULL,
    department VARCHAR(45) NOT NULL,
    salary INT NOT NULL,
    isManager BOOLEAN DEFAULT false,
    manager VARCHAR(55) NOT NULL
    id INT AUTO_INCREMENT PRIMARY KEY
);