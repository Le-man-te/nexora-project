CREATE TABLE task_labels (
  id CHAR(36) NOT NULL PRIMARY KEY,
  task_id CHAR(36) NOT NULL,
  name VARCHAR(48) NOT NULL,
  color VARCHAR(16) NOT NULL DEFAULT '#64748b',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_task_label_name (task_id, name),
  CONSTRAINT fk_task_labels_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;