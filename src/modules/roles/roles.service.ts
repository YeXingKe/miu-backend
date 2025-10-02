import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { UpdateRoleDto } from './dto/update-role.dto'
import { Role, RoleMenuPermission } from './schemas/roles.schemas'
import { PaginationFilterDto } from '@/common/dto/pagination-filter.dto'
import { PaginationResponse } from '@/common/interface'
import { MenuRole } from './schemas/menu-role.schema'
import { UserRole } from './schemas/user-role.schema'
import { Menu } from '../menus/schemas/menus.schemas'
import { RoleModule } from './roles.module'

@Injectable()
export class RoleService {
  // 使用扩展后的类型
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(MenuRole.name) private menuRoleModel: Model<MenuRole>,
    @InjectModel(Menu.name) private menuModel: Model<Role>
  ) {}

  // 角色基础CRUD
  async create(roleData: { name: string; permissions?: string[] }): Promise<Role> {
    return this.roleModel.create({
      ...roleData,
      permissions: roleData.permissions || []
    })
  }

  // 验证角色是否存在（用于用户角色分配）,防止分配不存在的角色
  async validateRolesExist(roleIds: string[]): Promise<void> {
    const count = await this.roleModel.countDocuments({ _id: { $in: roleIds } })
    if (count !== roleIds.length) {
      throw new Error('One or more roles do not exist')
    }
  }

  // 为角色分配权限
  async assignPermissions(roleId: string, permissions: string[]): Promise<Role> {
    const updatedRole = await this.roleModel
      .findByIdAndUpdate(roleId, { $addToSet: { permissions: { $each: permissions } } }, { new: true })
      .exec()

    if (!updatedRole) {
      throw new NotFoundException(`Role with ID ${roleId} not found`)
    }

    return updatedRole
  }

  // // 权限可视化分组（用于管理界面）
  // async getPermissionTree(roleId: string): Promise<Record<string, string[]>> {
  //   const role = await this.roleModel.findById(roleId)
  //   if (!role) throw new Error('Role not found')

  //   // 按资源类型分组权限
  //   return role.permissions.reduce((acc, perm) => {
  //     const [resource] = perm.split(':')
  //     if (!acc[resource]) acc[resource] = []
  //     acc[resource].push(perm)
  //     return acc
  //   }, {})
  // }

  async findAll(paginationFilterDto: PaginationFilterDto): Promise<PaginationResponse<Role>> {
    // 查出 users 集合里所有用户，**并把 password 字段排除掉，返回纯数组
    // .exec() → 把 Query 对象真正发出去并返回 Promise，可 await
    const { page, limit, search, sortBy, sortOrder, isActive } = paginationFilterDto
    const skip = (page - 1) * limit

    // 构建查询条件
    const query: any = {}

    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }, { path: { $regex: search, $options: 'i' } }]
    }

    if (isActive !== undefined) {
      query.isActive = isActive
    }

    // 构建排序条件
    const sort: any = {}
    sort[sortBy as string] = sortOrder?.toLowerCase() === 'desc' ? -1 : 1

    // 执行查询
    const [data, total] = await Promise.all([
      this.roleModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.roleModel.countDocuments(query).exec()
    ])

    // 计算总页数
    const totalPages = Math.ceil(total / limit)

    // 返回格式化响应
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages
      }
    }
  }

  // 获取角色详情（包含完整权限信息）
  async findByIdWithPermissions(id: string): Promise<Role> {
    const role = await this.roleModel
      .findById(id)
      .populate({
        path: 'permissions',
        select: 'code name description',
        options: { sort: { createdAt: 1 } }
      })
      .lean()
      .exec()

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`)
    }

    return role
  }

  // 更新角色信息
  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleModel.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true }).exec()

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`)
    }

    return role
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleModel.findById(id).exec()
    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`)
    }
    return role
  }

  async remove(id: string): Promise<void> {
    const role = await this.roleModel.findById(id)
    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`)
    }

    if (role.isSystem) {
      throw new ConflictException('系统角色不能删除')
    }

    // 检查是否有用户关联此角色
    const userCount = await this.roleModel.countDocuments({ roleId: id })
    if (userCount > 0) {
      throw new ConflictException('该角色已被用户使用，无法删除')
    }

    await this.roleModel.findByIdAndDelete(id).exec()
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const result = await this.roleModel
      .findOneAndDelete({
        userId,
        roleId
      })
      .exec()

    if (!result) {
      throw new NotFoundException('用户角色关联不存在')
    }
  }

  // 删除角色（软删除）
  async delete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.roleModel
      .findByIdAndUpdate(id, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
      .exec()

    if (!result) {
      throw new NotFoundException(`Role with ID ${id} not found`)
    }

    return { deleted: true }
  }

  // 硬删除角色（慎用）
  async hardDelete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.roleModel.deleteOne({ _id: id }).exec()
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`)
    }
    return { deleted: true }
  }

  /**
   * 获取角色的所有权限标识符
   */
  async getRolePermissions(roleId: string): Promise<string[]> {
    const role = await this.roleModel.findById(roleId).populate('menus.menu').exec()

    if (!role) {
      return []
    }

    // 从 menuPermissions 中提取权限
    const permissions = role.menus.flatMap((mp: RoleMenuPermission) => mp.permissions)

    return [...new Set(permissions)] // 去重
  }

  /**
   * 获取角色对特定菜单的权限
   */
  async getRoleMenuPermissions(roleId: string, menuId: string): Promise<string[]> {
    const role = await this.roleModel.findById(roleId).populate('menus.menu').exec()

    if (!role) {
      return []
    }

    const menuPermission = role.menus.find((mp: RoleMenuPermission) => mp.menu._id.toString() === menuId)

    return menuPermission ? menuPermission.permissions : []
  }

  /**
   * 为角色设置菜单权限
   */
  async setRoleMenuPermissions(roleId: string, menuId: string, permissions: string[]): Promise<Role> {
    const role = await this.roleModel.findById(roleId)
    if (!role) {
      throw new NotFoundException('角色不存在')
    }

    // 查找是否已经存在该菜单的权限配置
    const existingIndex = role.menus.findIndex((mp: RoleMenuPermission) => mp.menu._id.toString() === menuId)

    if (existingIndex >= 0) {
      // 更新
      role.menus[existingIndex].permissions = permissions
    } else {
      // 新增
      role.menus.push({
        menu: new Types.ObjectId(menuId),
        permissions
      })
    }

    return await role.save()
  }

  /**
   * 批量设置角色菜单权限
   */
  async setRoleMenuPermissionsBatch(
    roleId: string,
    permissions: { menuId: string; permissions: string[] }[]
  ): Promise<Role> {
    const role = await this.roleModel.findById(roleId)
    if (!role) {
      throw new NotFoundException('角色不存在')
    }

    // 构建新的 menuPermissions 数组
    const newMenuPermissions: RoleMenuPermission[] = permissions.map(p => ({
      menu: new Types.ObjectId(p.menuId),
      permissions: p.permissions
    }))

    role.menus = newMenuPermissions
    return await role.save()
  }
}
