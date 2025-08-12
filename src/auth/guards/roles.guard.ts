// auth/guards/roles.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { UserRole } from 'src/common/enums/user-role.enum'

// 当路由或控制器上标记了 @Roles(...) 时，只有携带 对应角色 的 JWT 用户才能访问，否则直接抛 403 Forbidden

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. 获取路由要求的角色
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    // 2. 如果没有角色限制，直接放行
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    // 3. 从请求中获取用户信息
    const request = context.switchToHttp().getRequest()
    const user = request.user

    // 4. 检查用户是否拥有所需角色
    const hasRole = requiredRoles.some(role => user?.roles?.includes(role))

    if (!hasRole) {
      throw new ForbiddenException(
        `需要角色: ${requiredRoles.join(', ')} | 当前角色: ${user?.roles?.join(', ') || '无'}`
      )
    }

    return true
  }
}
