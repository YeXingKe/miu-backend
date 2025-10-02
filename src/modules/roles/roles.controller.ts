import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { RoleService } from './roles.service'
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator'
import { PermissionsEnum } from 'src/common/enums/permissions.enum'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PaginationFilterDto } from '@/common/dto/pagination-filter.dto'

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly roleService: RoleService) {}

  // 创建角色（需要权限）
  @Post('create')
  @RequirePermissions(PermissionsEnum.ROLE_CREATE)
  @ApiOperation({ summary: '创建角色（需要权限）' })
  async create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto)
  }

  @Post('getRoles')
  @ApiOperation({ summary: '获取所有角色' })
  findAll(@Body() paginationFilterDto: PaginationFilterDto) {
    return this.roleService.findAll(paginationFilterDto)
  }

  // 获取角色详情（含权限）
  @Get(':id')
  @RequirePermissions(PermissionsEnum.ROLE_READ)
  @ApiOperation({ summary: '获取角色详情（含权限）' })
  async findOne(@Param('id') id: string) {
    return this.roleService.findByIdWithPermissions(id)
  }

  // 更新角色基本信息
  @Put(':id')
  @RequirePermissions(PermissionsEnum.ROLE_UPDATE)
  @ApiOperation({ summary: '更新角色基本信息' })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto)
  }

  @Post('/assignMenus')
  @ApiOperation({ summary: '为角色分配菜单权限' })
  async assignMenusToRole(@Body() assignMenusDto: { roleId: string; menuId: string; permissions: string[] }) {
    const role = await this.roleService.setRoleMenuPermissions(
      assignMenusDto.roleId,
      assignMenusDto.menuId,
      assignMenusDto.permissions
    )
    console.log('assignMenusToRole==', role)
    return {
      code: 200,
      message: '菜单权限分配成功',
      data: {
        roleId: role._id,
        roleName: role.name,
        menus: role.menus
      }
    }
  }

  // 删除角色
  @Delete(':id')
  @RequirePermissions(PermissionsEnum.ROLE_DELETE)
  @ApiOperation({ summary: '删除角色' })
  async remove(@Param('id') id: string) {
    return this.roleService.delete(id)
  }
}
