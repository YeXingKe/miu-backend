export class PermissionCheckResult {
  permission: string
  hasPermission: boolean
  reason?: string // 可选：说明为什么没有权限
}
