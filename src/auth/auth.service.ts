import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from 'src/modules/users/users.service'
import { LoginDto } from './dto/login.dto'
import { ConfigService } from '@nestjs/config'
import { RegisterDto } from './dto/register.dto'
import { UserRole } from 'src/common/enums/user-role.enum'

@Injectable()
export class AuthService {
  // 用来解密
  // private readonly privatePem = process.env.PRIVATEKEY // 一般不泄露
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(userName: string, pwd: string): Promise<any> {
    const user = await this.usersService.findByUserName(userName)
    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }

    const { password, ...result } = user

    const isValid = await bcrypt.compare(pwd, password)
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return result
  }

  //   // auth.service.ts
  //   async login(loginDto: LoginDto) {
  //     const cacheKey = `login_attempts:${loginDto.email}`
  //     const attempts = (await this.cacheService.get(cacheKey)) || 0

  //     if (attempts >= 5) {
  //       throw new UnauthorizedException('账户已锁定，请15分钟后再试')
  //     }

  //     try {
  //       // ...登录逻辑...
  //       await this.cacheService.del(cacheKey) // 登录成功清除计数
  //     } catch (err) {
  //       await this.cacheService.set(cacheKey, attempts + 1, 900) // 15分钟过期
  //       throw err
  //     }
  //   }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.userName, loginDto.password)

    const payload = {
      // email: user.email,
      userName: user.userName,
      userId: user._id,
      roles: user.roles
    }

    return {
      // accessToken (访问令牌)	refreshToken (刷新令牌)
      accessToken: this.jwtService.sign(payload), // 时间取决于全局配置
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      })
    }
  }

  async genSalt() {
    // 动态盐值：生成加密所需的随机盐值（Salt）
    // 部分信息合并的动态盐值（不推荐）：STATIC_SALT + username.slice(0, 2) + new Date().getFullYear()
    const salt = await bcrypt.genSalt(10)
    return salt
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.findByUserName(registerDto.userName)

    if (user) {
      throw new ConflictException('用户已存在')
    }

    // 生成加密所需的随机盐值（Salt）
    const salt = await this.genSalt()
    const hashedPassword = await bcrypt.hash(registerDto.password, salt)

    return this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      roles: [UserRole.USER] // 默认角色
    })
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      })

      const user = await this.usersService.findById(payload.sub)
      if (!user) {
        throw new UnauthorizedException('用户不存在')
      }

      const newPayload = {
        userName: user.userName,
        userId: user._id,
        roles: user.roles
      }

      return {
        accessToken: this.jwtService.sign(newPayload),
        expiresIn: 15 * 60
      }
    } catch (e) {
      throw new UnauthorizedException('无效的刷新令牌')
    }
  }
}
