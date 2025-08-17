import { Injectable, NotFoundException } from '@nestjs/common'
import { Model, Types } from 'mongoose'
import { Menu } from './schemas/menus.schemas'
import { InjectModel } from '@nestjs/mongoose'
import { RoleService } from '../roles/roles.service'
import { CreateMenuDto } from './dto/create-menu.dto'
import { UpdateMenuDto } from './dto/update-menu.dto'
import { MenuDto } from './dto/menu.dto'

@Injectable()
export class MenusService {
  constructor(
    @InjectModel(Menu.name) private menuModel: Model<Menu>,
    private roleService: RoleService
  ) {}

  // 获取完整菜单树（管理员用）
  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    // 验证父菜单是否存在
    if (createMenuDto.parentId) {
      const parentExists = await this.menuModel.exists({
        _id: createMenuDto.parentId
      })
      if (!parentExists) {
        throw new NotFoundException('父菜单不存在')
      }
    }

    return this.menuModel.create({
      ...createMenuDto,
      parentId: createMenuDto.parentId || null, // 确保顶级菜单parentId为null
      visible: createMenuDto.visible ?? true // 默认可见
    })
  }

  async getFullMenuTree(): Promise<Menu[]> {
    const menus = await this.menuModel.find({ isDeleted: { $ne: true } }).sort({ order: 1 })

    return this.buildTree(menus)
  }
  // 根据角色获取动态菜单树
  async getMenuTreeByRoles(roleIds: string[]): Promise<Menu[]> {
    const menus = await this.menuModel
      .find({
        $or: [
          { roles: { $in: roleIds } },
          { roles: { $size: 0 } } // 公共菜单
        ],
        visible: true
      })
      .sort({ order: 1 })

    return this.buildTree(menus)
  }

  private toDto(menu: Menu): MenuDto {
    return {
      id: menu._id.toString(),
      name: menu.name,
      path: menu.path,
      icon: menu.icon,
      component: menu.component || undefined,
      redirect: menu.redirect || undefined,
      meta: {
        title: menu.name,
        icon: menu.icon,
        hidden: !menu.visible,
        roles: menu.roles, // 假设已经转换为角色标识
        affix: menu.affix,
        noCache: menu.noCache
      },
      order: menu.order
    }
  }

  private buildTree(menus: Menu[], parentId: Types.ObjectId | null = null): Menu[] {
    return (
      menus
        // 第一步：过滤出当前层级的菜单项
        .filter(
          menu =>
            (menu.parentId === null && parentId === null) || // 情况1：获取所有顶级菜单
            (menu.parentId && menu.parentId === parentId) // 情况2：获取指定parentId的子菜单
        )
        // 第二步：递归构建子树
        .map(menu => ({
          ...menu.toObject(), // 展开菜单原属性
          children: this.buildTree(menus, menu._id) // 递归查找子菜单
        }))
        // 第三步：同级菜单排序
        .sort((a, b) => a.order - b.order)
    )
  }

  // 同步菜单与角色权限
  async syncMenuRoles(menuId: string, roleIds: string[]): Promise<Menu> {
    await this.roleService.validateRolesExist(roleIds)

    const updatedMenu = await this.menuModel.findByIdAndUpdate(menuId, { $set: { roles: roleIds } }, { new: true })

    if (!updatedMenu) {
      throw new NotFoundException(`Menu with ID ${menuId} not found`)
    }

    return updatedMenu
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.menuModel.findByIdAndUpdate(id, updateMenuDto, { new: true }).exec()

    if (!menu) {
      throw new NotFoundException(`菜单 ${id} 不存在`)
    }

    return menu
  }

  // 删除菜单（软删除）
  async delete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.menuModel
      .findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true })
      .exec()

    return { deleted: !!result }
  }
}
