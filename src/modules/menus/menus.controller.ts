import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common'
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { PermissionsEnum } from 'src/common/enums/permissions.enum'
import { MenusService } from './menus.service'
import { UpdateMenuDto } from './dto/update-menu.dto'
import { CreateMenuDto } from './dto/create-menu.dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Menus')
@Controller('menus')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  // 创建菜单项
  @Post('create')
  @RequirePermissions(PermissionsEnum.MENU_CREATE)
  @ApiOperation({ summary: '创建菜单项' })
  async create(@Body() dto: CreateMenuDto) {
    return this.menusService.create(dto)
  }

  // 获取完整菜单树（管理员用）
  @Get('getMenusTree')
  @ApiOperation({ summary: '获取完整菜单树（管理员用）' })
  @RequirePermissions(PermissionsEnum.MENU_READ)
  async getFullMenuTree() {
    return this.menusService.getFullMenuTree()
  }

  // 获取当前用户可见菜单（动态路由）
  @Get('userMenu')
  @ApiOperation({ summary: '获取当前用户可见菜单（动态路由）' })
  async getMenuTreeByRoles(@Req() req) {
    const roleIds = req.user.roles.map(role => role._id)
    return this.menusService.getMenuTreeByRoles(roleIds)
  }

  // 更新菜单项
  @Put(':id')
  @ApiOperation({ summary: '更新菜单项' })
  @RequirePermissions(PermissionsEnum.MENU_UPDATE)
  async update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menusService.update(id, dto)
  }

  // 为菜单分配可见角色
  @Put(':id/roles')
  @ApiOperation({ summary: '为菜单分配可见角色' })
  @RequirePermissions(PermissionsEnum.MENU_MANAGE_VISIBILITY)
  async assignMenuRoles(@Param('id') id: string, @Body() { roleIds }: { roleIds: string[] }) {
    return this.menusService.syncMenuRoles(id, roleIds)
  }

  // 删除菜单项
  @Delete(':id')
  @ApiOperation({ summary: '删除菜单项（软删除）' })
  @RequirePermissions(PermissionsEnum.MENU_DELETE)
  async remove(@Param('id') id: string) {
    return this.menusService.delete(id)
  }
}
