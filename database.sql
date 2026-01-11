-- ========================================
-- SCRIPT SQL - BASE DE DONNEES ECORIDE (Schema basé sur le diagramme fourni)
-- ========================================

CREATE DATABASE IF NOT EXISTS ecoride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecoride;

-- ========================================
-- TABLES DE REFERENCE
-- ========================================

CREATE TABLE roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  libelle VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE marque (
  marque_id INT PRIMARY KEY AUTO_INCREMENT,
  libelle VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE configuration (
  id_configuration INT PRIMARY KEY AUTO_INCREMENT,
  libelle VARCHAR(100) DEFAULT 'config_par_defaut'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE parametre (
  parametre_id INT PRIMARY KEY AUTO_INCREMENT,
  propriete VARCHAR(50) NOT NULL,
  valeur VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE configuration_parametre (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_configuration INT NOT NULL,
  parametre_id INT NOT NULL,
  FOREIGN KEY (id_configuration) REFERENCES configuration(id_configuration) ON DELETE CASCADE,
  FOREIGN KEY (parametre_id) REFERENCES parametre(parametre_id) ON DELETE CASCADE,
  UNIQUE KEY uniq_conf_param (id_configuration, parametre_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- UTILISATEURS ET ROLES
-- ========================================

CREATE TABLE utilisateur (
  utilisateur_id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(50) NOT NULL,
  prenom VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  telephone VARCHAR(50),
  adresse VARCHAR(50),
  date_naissance DATE,
  photo BLOB,
  pseudo VARCHAR(50) NOT NULL UNIQUE,
  note_moyenne DECIMAL(3,2) DEFAULT 0.00 CHECK (note_moyenne >= 0 AND note_moyenne <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE utilisateur_role (
  id INT PRIMARY KEY AUTO_INCREMENT,
  utilisateur_id INT NOT NULL,
  role_id INT NOT NULL,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(utilisateur_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
  UNIQUE KEY uniq_user_role (utilisateur_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- VEHICULES ET MARQUES
-- ========================================

CREATE TABLE vehicule (
  vehicule_id INT PRIMARY KEY AUTO_INCREMENT,
  proprietaire_id INT NOT NULL,
  marque_id INT,
  modele VARCHAR(50) NOT NULL,
  immatriculation VARCHAR(50) NOT NULL UNIQUE,
  energie VARCHAR(50),
  couleur VARCHAR(50),
  date_premiere_immatriculation DATE,
  FOREIGN KEY (proprietaire_id) REFERENCES utilisateur(utilisateur_id) ON DELETE CASCADE,
  FOREIGN KEY (marque_id) REFERENCES marque(marque_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- COVOITURAGE
-- ========================================

CREATE TABLE covoiturage (
  covoiturage_id INT PRIMARY KEY AUTO_INCREMENT,
  conducteur_id INT NOT NULL,
  vehicule_id INT NOT NULL,
  date_depart DATE NOT NULL,
  heure_depart TIME NOT NULL,
  lieu_depart VARCHAR(50) NOT NULL,
  lieu_arrivee VARCHAR(50) NOT NULL,
  date_arrivee DATE NOT NULL,
  heure_arrivee TIME NOT NULL,
  nb_place INT NOT NULL CHECK (nb_place > 0),
  prix_personne FLOAT NOT NULL CHECK (prix_personne >= 0),
  preferences JSON COMMENT 'Preferences: musique, fumeur, animaux, discussion',
  FOREIGN KEY (conducteur_id) REFERENCES utilisateur(utilisateur_id) ON DELETE CASCADE,
  FOREIGN KEY (vehicule_id) REFERENCES vehicule(vehicule_id) ON DELETE RESTRICT,
  INDEX idx_depart (lieu_depart, date_depart),
  INDEX idx_arrivee (lieu_arrivee)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE covoiturage_participant (
  id INT PRIMARY KEY AUTO_INCREMENT,
  covoiturage_id INT NOT NULL,
  utilisateur_id INT NOT NULL,
  nb_places INT NOT NULL DEFAULT 1 CHECK (nb_places > 0),
  statut ENUM('en_attente', 'confirme', 'annule') DEFAULT 'en_attente',
  FOREIGN KEY (covoiturage_id) REFERENCES covoiturage(covoiturage_id) ON DELETE CASCADE,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(utilisateur_id) ON DELETE CASCADE,
  UNIQUE KEY uniq_participation (covoiturage_id, utilisateur_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- AVIS ET NOTES
-- ========================================

CREATE TABLE avis (
  avis_id INT PRIMARY KEY AUTO_INCREMENT,
  auteur_id INT NOT NULL,
  destinataire_id INT NOT NULL,
  covoiturage_id INT,
  commentaire VARCHAR(255),
  note INT NOT NULL CHECK (note BETWEEN 1 AND 5),
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auteur_id) REFERENCES utilisateur(utilisateur_id) ON DELETE CASCADE,
  FOREIGN KEY (destinataire_id) REFERENCES utilisateur(utilisateur_id) ON DELETE CASCADE,
  FOREIGN KEY (covoiturage_id) REFERENCES covoiturage(covoiturage_id) ON DELETE SET NULL,
  INDEX idx_destinataire (destinataire_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- HISTORIQUE
-- ========================================

CREATE TABLE historique (
  historique_id INT PRIMARY KEY AUTO_INCREMENT,
  utilisateur_id INT NOT NULL,
  covoiturage_id INT NOT NULL,
  date_evenement DATE NOT NULL,
  description VARCHAR(255),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(utilisateur_id) ON DELETE CASCADE,
  FOREIGN KEY (covoiturage_id) REFERENCES covoiturage(covoiturage_id) ON DELETE CASCADE,
  INDEX idx_historique_user (utilisateur_id, date_evenement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- DONNEES DE DEMO MINIMALES
-- ========================================

INSERT INTO roles (libelle, description) VALUES
('admin', 'Administrateur'),
('employe', 'Employe support'),
('utilisateur', 'Utilisateur standard');

INSERT INTO configuration (libelle) VALUES ('config_par_defaut');
INSERT INTO parametre (propriete, valeur) VALUES ('commission_par_defaut', '2');
INSERT INTO configuration_parametre (id_configuration, parametre_id) VALUES (1, 1);

INSERT INTO marque (libelle) VALUES ('Renault'), ('Peugeot'), ('Tesla');

INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, telephone, adresse, date_naissance, pseudo)
VALUES
('Dupont', 'Jean', 'jean.dupont@email.com', '$2y$10$abcdefghijklmnopqrstuvwxyz', '0612345678', 'Paris', '1990-01-01', 'jean'),
('Martin', 'Sophie', 'sophie.martin@email.com', '$2y$10$abcdefghijklmnopqrstuvwxyz', '0623456789', 'Lyon', '1992-02-02', 'sophie'),
('Dubois', 'Pierre', 'pierre.dubois@email.com', '$2y$10$abcdefghijklmnopqrstuvwxyz', '0634567890', 'Marseille', '1988-03-03', 'pierre');

INSERT INTO utilisateur_role (utilisateur_id, role_id) VALUES (1, 3), (2, 3), (3, 3);

INSERT INTO vehicule (proprietaire_id, marque_id, modele, immatriculation, energie, couleur, date_premiere_immatriculation)
VALUES
(1, 1, 'Clio', 'AB-123-CD', 'essence', 'Blanc', '2022-05-10'),
(2, 2, '308', 'CD-456-EF', 'diesel', 'Noir', '2021-03-15'),
(3, 3, 'Model 3', 'EF-789-GH', 'electrique', 'Bleu', '2024-01-20');

INSERT INTO covoiturage (conducteur_id, vehicule_id, date_depart, heure_depart, lieu_depart, lieu_arrivee, date_arrivee, heure_arrivee, nb_place, prix_personne, preferences)
VALUES
(1, 1, '2025-12-28', '08:00:00', 'Paris', 'Lyon', '2025-12-28', '12:00:00', 3, 25.00, '{"musique": true, "fumeur": false, "animaux": true, "discussion": true}'),
(2, 2, '2025-12-29', '14:00:00', 'Lyon', 'Marseille', '2025-12-29', '17:30:00', 3, 30.00, '{"musique": false, "fumeur": false, "animaux": false, "discussion": false}'),
(3, 3, '2025-12-30', '09:00:00', 'Marseille', 'Toulouse', '2025-12-30', '13:00:00', 4, 28.00, '{"musique": true, "fumeur": false, "animaux": false, "discussion": true}');

INSERT INTO covoiturage_participant (covoiturage_id, utilisateur_id, nb_places, statut) VALUES
(1, 2, 1, 'confirme'),
(1, 3, 1, 'en_attente');

INSERT INTO avis (auteur_id, destinataire_id, covoiturage_id, commentaire, note)
VALUES
(2, 1, 1, 'Trajet agreable', 5),
(3, 2, 2, 'Conducteur prudent', 4);

INSERT INTO historique (utilisateur_id, covoiturage_id, date_evenement, description)
VALUES
(1, 1, '2025-12-28', 'Trajet effectue'),
(2, 1, '2025-12-28', 'Participation au trajet');

-- ========================================
-- FIN DU SCRIPT
-- ========================================