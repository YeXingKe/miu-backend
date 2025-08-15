import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Passport-JWT 策略中用于从 HTTP 请求头中提取 JWT Token 的标准方法
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'miu-backend'
    })
  }

  /**
   * 请求携带有效的 JWT Token
   * 路由使用了 @UseGuards(AuthGuard('jwt')) 装饰器
   * validate() 会被自动调用
   * @param payload
   * @returns
   */
  async validate(payload: any) {
    // 这里返回的数据会被自动挂载到request.user
    return {
      userId: payload.userId,
      userName: payload.userName,
      permissions: payload.roles // 权限数组
    }
  }
}
// 调用如下
// @Get('profile')
// @UseGuards(AuthGuard('jwt')) // 触发JwtStrategy
// getProfile(@Req() req) {
//   return req.user; // 数据来自JwtStrategy.validate()
// }
