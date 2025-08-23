import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UpdateRoleDto } from './dto/update-role.dto'
import { Role, RoleDocument } from './schemas/roles.schemas'
import { PaginationFilterDto } from '@/common/dto/pagination-filter.dto'
import { PaginationResponse } from '@/common/interface'

@Injectable()
export class RoleService {
  // 使用扩展后的类型
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

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

  // 权限可视化分组（用于管理界面）
  async getPermissionTree(roleId: string): Promise<Record<string, string[]>> {
    const role = await this.roleModel.findById(roleId)
    if (!role) throw new Error('Role not found')

    // 按资源类型分组权限
    return role.permissions.reduce((acc, perm) => {
      const [resource] = perm.split(':')
      if (!acc[resource]) acc[resource] = []
      acc[resource].push(perm)
      return acc
    }, {})
  }

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
  async findByIdWithPermissions(id: string): Promise<RoleDocument> {
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
  async update(id: string, dto: UpdateRoleDto): Promise<RoleDocument> {
    const role = await this.roleModel.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true }).exec()

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`)
    }

    return role
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
}
