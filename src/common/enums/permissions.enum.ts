export enum PermissionsEnum {
  // 用户管理
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ROLES = 'user:manage_roles',

  // 角色管理
  ROLE_CREATE = 'role:create',
  ROLE_READ = 'role:read',
  ROLE_UPDATE = 'role:update',
  ROLE_DELETE = 'role:delete',
  ROLE_MANAGE_PERMISSIONS = 'role:manage_visibility',

  // 菜单管理
  MENU_CREATE = 'menu:create',
  MENU_READ = 'menu:read',
  MENU_UPDATE = 'menu:update',
  MENU_DELETE = 'menu:delete',
  MENU_MANAGE_VISIBILITY = 'menu:manage_visibility',

  // 其他业务权限
  ORDER_MANAGE = 'order:*',
  REPORT_EXPORT = 'report:export'
}

// 获取所有权限值的数组（用于Schema验证）
export const PERMISSIONS = Object.values(PermissionsEnum)
