const ROLE_RANK = Object.freeze({ member: 1, admin: 2, owner: 3 });

function hasRole(actualRole, requiredRole) {
  return Object.hasOwn(ROLE_RANK, actualRole)
    && Object.hasOwn(ROLE_RANK, requiredRole)
    && ROLE_RANK[actualRole] >= ROLE_RANK[requiredRole];
}

function canManageWorkspace(role) {
  return hasRole(role, 'admin');
}

function canDeleteWorkspace(role) {
  return role === 'owner';
}

module.exports = { ROLE_RANK, hasRole, canManageWorkspace, canDeleteWorkspace };