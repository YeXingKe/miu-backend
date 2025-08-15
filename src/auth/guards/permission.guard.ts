import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Type } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PermissionsEnum } from 'src/common/enums/permissions.enum'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  // 白名单配置
  private isWhitelisted(context: ExecutionContext): boolean {
    const whitelist = ['/auth/login', '/health']
    const path = context.switchToHttp().getRequest().path
    return whitelist.includes(path)
  }

  // 在 canActivate 开头添加
  canActivate(context: ExecutionContext): boolean {
    if (this.isWhitelisted(context)) return true
    // 合并方法和类的元数据
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionsEnum[]>('permissions', [
      context.getHandler(),
      context.getClass()
    ])

    // 无需权限的端点
    if (!requiredPermissions?.length) return true

    // 从请求中获取用户权限
    const request = context.switchToHttp().getRequest()
    const userPermissions: PermissionsEnum[] = request.user?.permissions || []

    // 验证权限
    const hasPermission = requiredPermissions.some(perm => this.checkPermission(userPermissions, perm))

    if (!hasPermission) {
      throw new ForbiddenException(`需要以下任一权限: ${requiredPermissions.join(', ')}`)
    }

    return true
  }

  private checkPermission(userPerms: PermissionsEnum[], requiredPerm: PermissionsEnum): boolean {
    // 处理通配符权限 (如 'order:*')
    // * 超级管理员通配符
    if (requiredPerm.endsWith(':*')) {
      const resource = requiredPerm.split(':')[0]
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      return userPerms.some(perm => perm === `${resource}:*` || perm.startsWith(`${resource}:`))
    }

    return userPerms.includes(requiredPerm)
  }
}
