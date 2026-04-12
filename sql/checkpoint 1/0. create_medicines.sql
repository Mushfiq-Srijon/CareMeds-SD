CREATE TABLE `medicines` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `generic_name` varchar(255) DEFAULT NULL,
  `company` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `medicines` (`name`, `generic_name`, `company`, `category`, `created_at`, `updated_at`) VALUES
('Paracetamol',  'Acetaminophen',            'Beximco', 'Painkiller',       NOW(), NOW()),
('Amoxicillin',  'Amoxicillin Trihydrate',   'Renata',  'Antibiotic',       NOW(), NOW()),
('Cetirizine',   'Cetirizine Hydrochloride', 'Eskayef', 'Antihistamine',    NOW(), NOW()),
('Omeprazole',   'Omeprazole',               'ACI',     'Antacid',          NOW(), NOW()),
('Metformin',    'Metformin Hydrochloride',  'Square',  'Antidiabetic',     NOW(), NOW()),
('Ibuprofen',    'Ibuprofen',               'Beximco', 'Painkiller',       NOW(), NOW()),
('Amlodipine',   'Amlodipine Besylate',      'Renata',  'Antihypertensive', NOW(), NOW()),
('Azithromycin', 'Azithromycin',             'Eskayef', 'Antibiotic',       NOW(), NOW()),
('Vitamin C',    'Ascorbic Acid',            'ACI',     'Supplement',       NOW(), NOW());