CREATE TABLE workspaces (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  slug VARCHAR(48) NOT NULL,
  description VARCHAR(180) NULL,
  team_size VARCHAR(32) NULL,
  visibility ENUM('private', 'invite-only') NOT NULL DEFAULT 'private',
  member_invites TINYINT(1) NOT NULL DEFAULT 1,
  created_by CHAR(36) NOT NULL,
  archived_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_workspaces_slug (slug),
  KEY idx_workspaces_creator (created_by),
  CONSTRAINT fk_workspaces_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;