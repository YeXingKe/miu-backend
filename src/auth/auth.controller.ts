import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { Public } from './decorators/public.decorator'
import { AuthGuard } from '@nestjs/passport'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login') // 路径以及请求方式
  @ApiOperation({ summary: '用户登录', description: '使用邮箱和密码登录' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '认证失败',
    schema: {
      example: {
        statusCode: 401,
        message: '密码错误',
        error: 'Unauthorized'
      }
    }
  })
  @Public()
  @UseGuards(AuthGuard('local')) // 使用 Passport 的本地策略（邮箱+密码）做登录校验
  async login(
    @Body() _loginDto: LoginDto, // 仅做 DTO 校验，实际用户已通过 @Request() 注入
    @Req() req
  ) {
    // req.user 是 LocalStrategy validate() 返回的用户
    return this.authService.login(req.user)
  }
}
