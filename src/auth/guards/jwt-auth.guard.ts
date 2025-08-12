// auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

// JwtAuthGuard = 公开路由白名单 + JWT 验证 + 统一 401 异常。

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // 继承 Passport-JWT 内置守卫，自动解析 Authorization: Bearer <token>。
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    // 检查是否标记为公开路由 标记了 @Public() 的接口直接放行；
    // 看当前路由或所在控制器上有没有 @Public() 装饰器；有就 return true 直接放行。
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // 当前请求真正跑的那个 方法本身
      context.getClass() // 这个方法所在的 控制器类
    ])

    if (isPublic) {
      return true
    }

    // 没有 @Public() 就调用父类逻辑，执行 JWT 验证。
    return super.canActivate(context)
  }

  handleRequest(err: any, user: any, info: any) {
    // 验证失败 时统一抛 UnauthorizedException('无效或过期的令牌')；
    // 验证成功返回解析后的 user（可在 req.user 里拿到）。
    // 自定义错误处理
    if (err || !user) {
      throw err || new UnauthorizedException('无效或过期的令牌')
    }

    // 返回解析后的用户信息
    return user
  }
}
