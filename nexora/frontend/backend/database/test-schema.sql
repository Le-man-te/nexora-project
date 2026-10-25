-- Create a separate disposable database before sourcing this file:
-- CREATE DATABASE nexora_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Then run from the backend directory: mysql nexora_test < database/test-schema.sql
SOURCE database/migrations/001_create_users.sql;
SOURCE database/migrations/002_create_sessions.sql;
SOURCE database/migrations/003_create_workspaces.sql;
SOURCE database/migrations/004_create_workspaces_members.sql;
SOURCE database/migrations/005_create_workspace_invitations.sql;
SOURCE database/migrations/006_create_projects.sql;
SOURCE database/migrations/007_create_projects_members.sql;
SOURCE database/migrations/008_create_tasks.sql;
SOURCE database/migrations/009_create_task_labels.sql;
SOURCE database/migrations/010_create_subtasks.sql;
SOURCE database/migrations/011_create_notes.sql;
SOURCE database/migrations/012_create.documents.sql;
SOURCE database/migrations/013_create_comments.sql;
SOURCE database/migrations/014_create_activity_logs.sql;
SOURCE database/migrations/015_create_notifications.sql;
SOURCE database/migrations/016_create_notification_preferences.sql;
SOURCE database/migrations/017_create_ai_conversations.sql;
SOURCE database/migrations/018_create_ai_messages.sql;
SOURCE database/migrations/019_create_password_reset_tokens.sql;
SOURCE database/migrations/020_create_audit_events.sql;
SOURCE database/migrations/021_create_stored_files.sql;