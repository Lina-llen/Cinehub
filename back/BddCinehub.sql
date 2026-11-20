CREATE DATABASE cinehub;

USE cinehub;

CREATE TABLE users (
    us_id INT AUTO_INCREMENT PRIMARY KEY,
    us_username VARCHAR(255) NOT NULL UNIQUE,
    us_password TEXT NOT NULL,
    us_email VARCHAR(255) NOT NULL UNIQUE,
    us_role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
);

CREATE TABLE films (
    fi_id INT AUTO_INCREMENT PRIMARY KEY,
    fi_title VARCHAR(255) NOT NULL,
    fi_description TEXT,
    fi_duration INT NOT NULL,
    fi_genre VARCHAR(100),
    fi_release_date DATE,
    fi_is_showing TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE rooms (
    ro_id INT AUTO_INCREMENT PRIMARY KEY,
    ro_name VARCHAR(100) NOT NULL UNIQUE,
    ro_capacity INT NOT NULL
);

CREATE TABLE screenings (
    sc_id INT AUTO_INCREMENT PRIMARY KEY,
    sc_film INT NOT NULL,
    sc_room INT NOT NULL,
    sc_datetime DATETIME NOT NULL,
    sc_price DECIMAL(6,2) NOT NULL,

    CONSTRAINT fk_screenings_film
        FOREIGN KEY (sc_film) REFERENCES films(fi_id) ON DELETE CASCADE,
    FOREIGN KEY (sc_room) REFERENCES rooms(ro_id)
);

CREATE TABLE reservations (
    re_id INT AUTO_INCREMENT PRIMARY KEY,
    re_user INT NOT NULL,
    re_screening INT NOT NULL,
    re_seats INT NOT NULL DEFAULT 1,
    re_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (re_user, re_screening),
    FOREIGN KEY (re_user) REFERENCES users(us_id) ON DELETE CASCADE,
    CONSTRAINT fk_reservations_screening
        FOREIGN KEY (re_screening) REFERENCES screenings(sc_id) ON DELETE CASCADE
);


CREATE USER 'cinema_user'@'localhost'
IDENTIFIED BY 'CinemaPassword123!';
GRANT SELECT, INSERT, UPDATE, DELETE
ON cinehub.*
TO 'cinema_user'@'localhost';
FLUSH PRIVILEGES;

-- Migrations pour une base deja creee : selectionner cinehub et utiliser un compte ayant les droits ALTER.
USE cinehub;

-- Migration 1 : ajoute le chemin local de l'affiche, sans modifier les films existants.
SET @cinehub_image_column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'films'
      AND COLUMN_NAME = 'fi_image'
);
SET @cinehub_sql = IF(
    @cinehub_image_column_exists = 0,
    'ALTER TABLE films ADD COLUMN fi_image VARCHAR(255) NULL AFTER fi_is_showing',
    'SELECT 1'
);
PREPARE cinehub_stmt FROM @cinehub_sql;
EXECUTE cinehub_stmt;
DEALLOCATE PREPARE cinehub_stmt;

-- Migration 2 : garantit la suppression en cascade des reservations d'un utilisateur.
SET @cinehub_user_fk = (
    SELECT CONSTRAINT_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 're_user'
      AND REFERENCED_TABLE_NAME = 'users'
    LIMIT 1
);
SET @cinehub_user_delete_rule = (
    SELECT DELETE_RULE
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND CONSTRAINT_NAME = @cinehub_user_fk
);
SET @cinehub_sql = IF(
    @cinehub_user_delete_rule = 'CASCADE',
    'SELECT 1',
    IF(
        @cinehub_user_fk IS NULL,
        'ALTER TABLE reservations ADD CONSTRAINT fk_reservations_user FOREIGN KEY (re_user) REFERENCES users(us_id) ON DELETE CASCADE',
        CONCAT('ALTER TABLE reservations DROP FOREIGN KEY `', REPLACE(@cinehub_user_fk, '`', '``'), '`')
    )
);
PREPARE cinehub_stmt FROM @cinehub_sql;
EXECUTE cinehub_stmt;
DEALLOCATE PREPARE cinehub_stmt;
SET @cinehub_sql = IF(
    @cinehub_user_delete_rule = 'CASCADE' OR @cinehub_user_fk IS NULL,
    'SELECT 1',
    'ALTER TABLE reservations ADD CONSTRAINT fk_reservations_user FOREIGN KEY (re_user) REFERENCES users(us_id) ON DELETE CASCADE'
);
PREPARE cinehub_stmt FROM @cinehub_sql;
EXECUTE cinehub_stmt;
DEALLOCATE PREPARE cinehub_stmt;

-- Migration 3 : garantit la suppression en cascade des seances d'un film.
SET @cinehub_screening_film_fk = (
    SELECT CONSTRAINT_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'screenings'
      AND COLUMN_NAME = 'sc_film'
      AND REFERENCED_TABLE_NAME = 'films'
    LIMIT 1
);
SET @cinehub_screening_film_delete_rule = (
    SELECT DELETE_RULE
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'screenings'
      AND CONSTRAINT_NAME = @cinehub_screening_film_fk
);
SET @cinehub_sql = IF(
    @cinehub_screening_film_delete_rule = 'CASCADE',
    'SELECT 1',
    IF(
        @cinehub_screening_film_fk IS NULL,
        'ALTER TABLE screenings ADD CONSTRAINT fk_screenings_film FOREIGN KEY (sc_film) REFERENCES films(fi_id) ON DELETE CASCADE',
        CONCAT('ALTER TABLE screenings DROP FOREIGN KEY `', REPLACE(@cinehub_screening_film_fk, '`', '``'), '`')
    )
);
PREPARE cinehub_stmt FROM @cinehub_sql;
EXECUTE cinehub_stmt;
DEALLOCATE PREPARE cinehub_stmt;
SET @cinehub_sql = IF(
    @cinehub_screening_film_delete_rule = 'CASCADE' OR @cinehub_screening_film_fk IS NULL,
    'SELECT 1',
    'ALTER TABLE screenings ADD CONSTRAINT fk_screenings_film FOREIGN KEY (sc_film) REFERENCES films(fi_id) ON DELETE CASCADE'
);
PREPARE cinehub_stmt FROM @cinehub_sql;
EXECUTE cinehub_stmt;
DEALLOCATE PREPARE cinehub_stmt;

-- Migration 4 : garantit la suppression en cascade des reservations d'une seance supprimee.
SET @cinehub_reservation_screening_fk = (
    SELECT CONSTRAINT_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 're_screening'
      AND REFERENCED_TABLE_NAME = 'screenings'
    LIMIT 1
);
SET @cinehub_reservation_screening_delete_rule = (
    SELECT DELETE_RULE
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND CONSTRAINT_NAME = @cinehub_reservation_screening_fk
);
SET @cinehub_sql = IF(
    @cinehub_reservation_screening_delete_rule = 'CASCADE',
    'SELECT 1',
    IF(
        @cinehub_reservation_screening_fk IS NULL,
        'ALTER TABLE reservations ADD CONSTRAINT fk_reservations_screening FOREIGN KEY (re_screening) REFERENCES screenings(sc_id) ON DELETE CASCADE',
        CONCAT('ALTER TABLE reservations DROP FOREIGN KEY `', REPLACE(@cinehub_reservation_screening_fk, '`', '``'), '`')
    )
);
PREPARE cinehub_stmt FROM @cinehub_sql;
EXECUTE cinehub_stmt;
DEALLOCATE PREPARE cinehub_stmt;
SET @cinehub_sql = IF(
    @cinehub_reservation_screening_delete_rule = 'CASCADE' OR @cinehub_reservation_screening_fk IS NULL,
    'SELECT 1',
    'ALTER TABLE reservations ADD CONSTRAINT fk_reservations_screening FOREIGN KEY (re_screening) REFERENCES screenings(sc_id) ON DELETE CASCADE'
);
PREPARE cinehub_stmt FROM @cinehub_sql;
EXECUTE cinehub_stmt;
DEALLOCATE PREPARE cinehub_stmt;

