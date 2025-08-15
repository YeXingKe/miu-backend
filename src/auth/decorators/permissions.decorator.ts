import { SetMetadata } from '@nestjs/common'
import { PermissionsEnum } from 'src/common/enums/permissions.enum'

// 类型安全的重载定义
export function RequirePermissions(permission: PermissionsEnum): MethodDecorator & ClassDecorator
export function RequirePermissions(permissions: PermissionsEnum[]): MethodDecorator & ClassDecorator
export function RequirePermissions(...permissions: PermissionsEnum[]): MethodDecorator & ClassDecorator

// 实现
export function RequirePermissions(
  ...permissions: PermissionsEnum[] | [PermissionsEnum[]]
): MethodDecorator & ClassDecorator {
  const flattenPermissions = Array.isArray(permissions[0]) ? permissions[0] : (permissions as PermissionsEnum[])

  return SetMetadata('permissions', flattenPermissions)
}
