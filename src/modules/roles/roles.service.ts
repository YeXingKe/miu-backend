import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UpdateRoleDto } from './dto/update-role.dto'
import { PaginationParams } from 'src/common/dto/pagination.dto'
import { Role, RoleDocument } from './schemas/roles.schemas'
// import type { PaginateModel } from 'mongoose-paginate-v2' // 关键修改

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

  //   // 分页查询角色列表
  //   async paginate(params: PaginationParams): Promise<PaginateResult<RoleDocument>> {
  //     const { page = 1, limit = 10, search } = params
  //     const query: any = {}

  //     // 搜索条件
  //     if (search) {
  //       query.$or = [{ name: { $regex: search, $options: 'i' } }, { code: { $regex: search, $options: 'i' } }]
  //     }

  //     const options = {
  //       page,
  //       limit,
  //       sort: { createdAt: -1 },
  //       select: '-__v', // 排除版本字段
  //       populate: { path: 'permissions', select: 'code name' } // 关联权限详情
  //     }

  //     return this.roleModel.paginate(query, options)
  //   }

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
