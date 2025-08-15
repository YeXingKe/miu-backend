import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthService } from 'src/auth/auth.service'

// Passport 本地策略（LocalStrategy）
/**
 * 当客户端用邮箱+密码调用 /auth/login 时，
 * Passport 会自动把邮箱、密码传进来，本策略负责校验账号密码，
 * 校验通过就把用户信息塞进 req.user，供后续流程使用。
 */

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  // strategy 来自 passport-local 包，代表“用户名+密码”策略
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }) // 默认 passport-local 用 username，这里改成 email
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password)
    if (!user) throw new UnauthorizedException()
    return user // 注入到 @Request() req.user
  }
}
