# Unified-CS — RBAC Architecture

## 1. Objective

Unified-CS uses Role-Based Access Control (RBAC) to authorize users according to the roles assigned to them within their organization.

Authorization must be enforced by the backend. Frontend visibility restrictions are only a user-experience feature and are never a security boundary.

## 2. Database Model

The existing Prisma models form the RBAC foundation:

- Organization
- User
- Role
- Permission
- UserRole
- RolePermission

### Relationships

- An organization owns multiple roles.
- A user belongs to one organization.
- A user can have multiple roles.
- A role can be assigned to multiple users.
- A role can contain multiple permissions.
- A permission can be assigned to multiple roles.

Permissions are stored in a global catalog. Roles and role assignments are organization-specific.

## 3. Permission Naming Convention

Permissions follow:

`resource.action`

Examples:

- `users.read`
- `users.create`
- `users.update`
- `users.delete`
- `inventory.read`
- `inventory.create`
- `inventory.update`
- `inventory.delete`
- `inventory.approve`
- `finance.read`
- `reports.export`

The database stores resource and action separately.

## 4. Effective Permissions

A user's effective permissions are the union of permissions granted by all roles assigned to that user.

Permission resolution must enforce the authenticated user's organization boundary.

## 5. Authorization Flow

1. JwtAuthGuard validates the access token.
2. The authenticated identity is attached to the request.
3. PermissionGuard reads required permission metadata.
4. RBACService resolves the user's permissions through their organization-specific roles.
5. Access is granted or rejected.
6. The controller and service execute only after successful authorization.

## 6. HTTP Semantics

- 401 Unauthorized: missing, invalid, or expired authentication.
- 403 Forbidden: authenticated user lacks the required permission.
- 200/201/etc.: request is authorized and processed normally.

## 7. Security Requirements

- Never trust organization IDs supplied by the client for authorization.
- Resolve organization context from the authenticated identity.
- Never assign a role from another organization.
- Never allow cross-organization role or permission management.
- Enforce permissions in backend guards.
- Validate organization ownership in service-layer queries and mutations.
- Keep permission checks independent of frontend navigation visibility.
- Protect sensitive actions with explicit permissions.

## 8. Planned Backend Components

- RBACModule
- RBACService
- RequirePermissions decorator
- PermissionGuard
- Role management endpoints
- Permission assignment endpoints
- RBAC automated tests

## 9. Implementation Sequence

1. RBAC architecture and permission conventions.
2. Frontend design system and application shell.
3. RBAC service and permission resolution.
4. Permission decorator and guard.
5. Protected RBAC endpoints.
6. Role and permission management.
7. Organization-aware authorization.
8. Automated RBAC tests.
9. Authentication and RBAC frontend integration.

## 10. Future Considerations

- Permission caching may be introduced after correctness is established.
- Permission changes must not leave stale authorization decisions.
- Audit logs should capture sensitive role and permission changes.
- Multi-tenancy must be enforced consistently across all business modules.