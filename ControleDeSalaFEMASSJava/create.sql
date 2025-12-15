-- PostgreSQL Schema for Controle de Sala FEMASS
-- This script will be executed automatically when the PostgreSQL container is first created

-- Note: Hibernate will create tables automatically with ddl-auto=update
-- This script is kept for reference or manual initialization if needed

CREATE TABLE IF NOT EXISTS tb_sala (
    id_sala SERIAL PRIMARY KEY,
    numero BIGINT CHECK (numero >= 1),
    bloco VARCHAR(255) NOT NULL,
    capacidade_maxima INTEGER CHECK (capacidade_maxima >= 1),
    ar_condicionado BOOLEAN NOT NULL,
    laboratorio BOOLEAN NOT NULL,
    lousa_digital BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS tb_disciplina (
    id_disciplina SERIAL PRIMARY KEY,
    nome_disciplina VARCHAR(255) NOT NULL,
    ar_condicionado BOOLEAN NOT NULL,
    laboratorio BOOLEAN NOT NULL,
    lousa_digital BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS tb_turma (
    id_turma SERIAL PRIMARY KEY,
    professor VARCHAR(255) NOT NULL,
    quantidade_alunos INTEGER CHECK (quantidade_alunos >= 1),
    codigo_horario INTEGER CHECK (codigo_horario >= 1 AND codigo_horario <= 6),
    turma_grade_antiga BOOLEAN NOT NULL,
    id_disciplina INTEGER,
    CONSTRAINT FK_turma_disciplina FOREIGN KEY (id_disciplina) REFERENCES tb_disciplina(id_disciplina)
);

CREATE TABLE IF NOT EXISTS tb_indisponibilidade (
    id_indisponibilidade SERIAL PRIMARY KEY,
    id_sala INTEGER NOT NULL,
    dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    tempo SMALLINT NOT NULL CHECK (tempo BETWEEN 0 AND 2),
    CONSTRAINT FK_indisponibilidade_sala FOREIGN KEY (id_sala) REFERENCES tb_sala(id_sala)
);

CREATE TABLE IF NOT EXISTS tb_alocacao_sala (
    id_alocacao SERIAL PRIMARY KEY,
    id_sala INTEGER NOT NULL,
    id_turma INTEGER NOT NULL,
    dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    tempo SMALLINT NOT NULL CHECK (tempo BETWEEN 0 AND 2),
    CONSTRAINT FK_alocacao_sala FOREIGN KEY (id_sala) REFERENCES tb_sala(id_sala),
    CONSTRAINT FK_alocacao_turma FOREIGN KEY (id_turma) REFERENCES tb_turma(id_turma)
);
