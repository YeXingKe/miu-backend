// users.controller.ts
import { Body, Controller, Get, Param, Req, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { UserRole } from 'src/common/enums/user-role.enum'

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Users')
@Controller('users') // 指定路由前缀
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @ApiOperation({ summary: '创建用户', description: '需要管理员权限' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Get('allUsers')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN) // 管理员和编辑可查看
  @ApiOperation({ summary: '获取所有用户' })
  async findAll() {
    return this.usersService.findAll()
  }

  // @Get(':id')
  // async getUser(@Param('id') id: string): Promise<UserResponseDto> {
  //   const user = await this.usersService.findById(id)
  //   return this.toUserDto(user)
  // }

  //   private toUserDto(user: UserDocument): UserResponseDto {
  //     return {
  //       id: user._id.toString(),
  //       username: user.username,
  //       email: user.email,
  //       roles: user.roles,
  //       displayName: user.displayName, // 使用虚拟字段
  //       createdAt: user.createdAt
  //     }
  //   }
}
