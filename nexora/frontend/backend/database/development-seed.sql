-- Development fixtures are only added to an existing user. No default password
-- or public account is created by this script.
SET @dev_user_email = COALESCE(@dev_user_email, '');
SET @dev_user_id = (SELECT id FROM users WHERE email = @dev_user_email LIMIT 1);
SET @dev_workspace_id = (
  SELECT workspace_id FROM workspace_members
  WHERE user_id = @dev_user_id ORDER BY created_at LIMIT 1
);
SET @dev_project_id = UUID();

INSERT INTO projects (id, workspace_id, created_by, name, description, status, priority)
SELECT @dev_project_id, @dev_workspace_id, @dev_user_id, 'Development project',
       'Local-only example project', 'in_progress', 'medium'
WHERE @dev_user_id IS NOT NULL
  AND @dev_workspace_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM projects
    WHERE workspace_id = @dev_workspace_id AND name = 'Development project'
  );

INSERT INTO tasks (id, project_id, created_by, title, description, status, priority, position)
SELECT UUID(), p.id, @dev_user_id, 'Review the project plan',
       'Example task for local development', 'todo', 'low', 0
FROM projects p
WHERE p.id = @dev_project_id
  AND @dev_user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM tasks WHERE project_id = p.id AND title = 'Review the project plan'
  );

SELECT IF(@dev_workspace_id IS NULL, 'No workspace was found for @dev_user_email; no fixtures were added.',
          'Development fixtures are ready.') AS seed_status;