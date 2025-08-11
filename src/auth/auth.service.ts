import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import { Model } from 'mongoose'
import { UserDocument } from 'src/modules/users/schemas/user.schema'
import { User } from 'src/modules/users/users.entity'
import { UsersService } from 'src/modules/users/users.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    // private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec()
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user.toObject()
      return result
    }
    return null
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
    // // 1. 查找用户
    // const user = await this.usersService.findByEmail(loginDto.email)
    // if (!user) {
    //   throw new UnauthorizedException('用户不存在')
    // }

    // // 2. 验证密码
    // const isValid = await bcrypt.compare(loginDto.password, user.password)
    // if (!isValid) {
    //   throw new UnauthorizedException('密码错误')
    // }

    // 3. 生成令牌
    const payload = {
      // sub: user._id,
      // email: user.email,
      // roles: user.roles
    }

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d'
      })
    }
  }
}
