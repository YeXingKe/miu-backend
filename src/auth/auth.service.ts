import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import { Model } from 'mongoose'
import { User, UserDocument } from 'src/modules/users/schemas/user.schema'
import { UsersService } from 'src/modules/users/users.service'
import { LoginDto } from './dto/login.dto'
import { ConfigService } from '@nestjs/config'
import { RegisterDto } from './dto/register.dto'
import { UserRole } from 'src/common/enums/user-role.enum'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(userName: string, pwd: string): Promise<any> {
    const user = await this.usersService.findOneByUserName(userName)
    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }

    const { password, ...result } = user

    const isValid = await bcrypt.compare(pwd, password)
    if (!isValid) {
      throw new UnauthorizedException('密码错误')
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
    const user = await this.usersService.findOneByUserName(loginDto.userName)

    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }

    const payload = {
      email: loginDto.email,
      sub: user._id,
      roles: loginDto.roles
    }

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      })
    }
  }

  async register(registerDto: RegisterDto) {
    const salt = await bcrypt.genSalt()
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

      const user = await this.usersService.findOneById(payload.sub)
      if (!user) {
        throw new UnauthorizedException('用户不存在')
      }

      const newPayload = {
        email: user.email,
        sub: user._id,
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
