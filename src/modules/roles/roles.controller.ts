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

  // 为角色分配权限（核心RBAC操作）
  @Put(':id/permissions')
  @RequirePermissions(PermissionsEnum.ROLE_MANAGE_PERMISSIONS)
  @ApiOperation({ summary: '为角色分配权限（核心RBAC操作）' })
  async assignPermissions(@Param('id') id: string, @Body() { permissions }: { permissions: string[] }) {
    return this.roleService.assignPermissions(id, permissions)
  }

  // 删除角色
  @Delete(':id')
  @RequirePermissions(PermissionsEnum.ROLE_DELETE)
  @ApiOperation({ summary: '删除角色' })
  async remove(@Param('id') id: string) {
    return this.roleService.delete(id)
  }
}
