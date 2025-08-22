// users.controller.ts
import { Body, Controller, Get, Param, Req, Post, UseGuards, Delete } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { UserRole } from 'src/common/enums/user-role.enum'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { PaginationFilterDto } from '@/common/dto/pagination-filter.dto'

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users') // 指定路由前缀
@UseGuards(JwtAuthGuard, RolesGuard) // JwtAuthGuard自定义的守卫，继承自 AuthGuard('jwt'), 触发JwtStrategy
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

  @Post('getUsers')
  @ApiOperation({ summary: '获取所有用户' })
  findAll(@Body() paginationFilterDto: PaginationFilterDto) {
    return this.usersService.findAll(paginationFilterDto)
  }

  @Get('getUserById')
  @ApiOperation({ summary: '通过id获取用户' })
  async getUserInfo(@Req() req) {
    // req.user 来自JWT策略的validate()方法返回
    return this.usersService.findById(req.user.userId)
  }

  @Get('/getUserById/:id')
  @ApiOperation({ summary: '通过id获取用户' })
  async getUserById(@Param('id') id: string) {
    return await this.usersService.findById(id)
  }

  @Delete('/deleteUser/:id')
  @ApiOperation({ summary: '删除单个用户' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(id)
  }

  @Delete('/deleteUsers')
  @ApiOperation({ summary: '批量删除用户' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async deleteUsers(@Body() ids: string[]) {
    return await this.usersService.deleteUsers(ids)
  }
}
