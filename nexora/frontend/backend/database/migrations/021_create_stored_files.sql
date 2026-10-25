CREATE TABLE stored_files (
  id CHAR(36) NOT NULL PRIMARY KEY,
  uploaded_by CHAR(36) NOT NULL,
  storage_key VARCHAR(160) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(127) NOT NULL,
  size_bytes BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_stored_files_storage_key (storage_key),
  KEY idx_stored_files_owner (uploaded_by, created_at),
  CONSTRAINT fk_stored_files_owner FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
