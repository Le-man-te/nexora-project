async function removeProject(database, projectId) {
  const taskIds = await database.collection('tasks').distinct('id', { project_id: projectId });
  await Promise.all([
    database.collection('subtasks').deleteMany({ task_id: { $in: taskIds } }),
    database.collection('task_labels').deleteMany({ task_id: { $in: taskIds } }),
    database.collection('comments').deleteMany({
      $or: [{ task_id: { $in: taskIds } }, { project_id: projectId }],
    }),
    database.collection('project_members').deleteMany({ project_id: projectId }),
    database.collection('tasks').deleteMany({ project_id: projectId }),
  ]);
  await database.collection('projects').deleteOne({ id: projectId });
}

async function removeWorkspace(database, workspaceId) {
  const [projectIds, documentIds] = await Promise.all([
    database.collection('projects').distinct('id', { workspace_id: workspaceId }),
    database.collection('documents').distinct('id', { workspace_id: workspaceId }),
  ]);
  await Promise.all(projectIds.map((projectId) => removeProject(database, projectId)));
  await Promise.all([
    database.collection('notes').deleteMany({ workspace_id: workspaceId }),
    database.collection('documents').deleteMany({ workspace_id: workspaceId }),
    database.collection('comments').deleteMany({ document_id: { $in: documentIds } }),
    database.collection('workspace_invitations').deleteMany({ workspace_id: workspaceId }),
    database.collection('workspace_members').deleteMany({ workspace_id: workspaceId }),
    database.collection('activity_logs').deleteMany({ workspace_id: workspaceId }),
  ]);
  await database.collection('workspaces').deleteOne({ id: workspaceId });
}

module.exports = { removeProject, removeWorkspace };
