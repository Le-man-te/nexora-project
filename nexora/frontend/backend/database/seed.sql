-- Seed with an existing account; create the account securely using `npm run seed`.
-- In a MySQL session, optionally set @seed_user_email before sourcing this file.
SET @seed_user_email = COALESCE(@seed_user_email, '');
SET @seed_user_id = (SELECT id FROM users WHERE email = @seed_user_email LIMIT 1);
SET @seed_workspace_id = UUID();

INSERT INTO workspaces (id, name, slug, description, created_by)
SELECT @seed_workspace_id, 'Nexora Workspace', CONCAT('nexora-', LEFT(@seed_workspace_id, 8)),
       'Starter workspace', @seed_user_id
WHERE @seed_user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM workspace_members WHERE user_id = @seed_user_id
  );

INSERT INTO workspace_members (id, workspace_id, user_id, role)
SELECT UUID(), @seed_workspace_id, @seed_user_id, 'owner'
WHERE @seed_user_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM workspaces WHERE id = @seed_workspace_id);

SELECT IF(@seed_user_id IS NULL, 'No account matched @seed_user_email; no rows were seeded.',
          'Seed completed or account already has a workspace.') AS seed_status;