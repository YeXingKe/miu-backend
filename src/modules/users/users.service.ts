import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from './schemas/user.schema'
import { RoleService } from '../roles/roles.service'

/**
 * 	用户管理、角色分配、权限校验
 */

@Injectable()
export class UsersService {
  // 服务层注入模型并写入一条数据（触发“自动建”）
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private roleService: RoleService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel({
      ...createUserDto
    })

    return createdUser.save()
  }

  /**
   * 查询所有用户
   * @returns
   */
  async findAll(): Promise<User[]> {
    // 查出 users 集合里所有用户，**并把 password 字段排除掉，返回纯数组
    // .exec() → 把 Query 对象真正发出去并返回 Promise，可 await
    return this.userModel.find().select('-password').exec()
  }

  /**
   * 通过用户id查询记录
   * @param userName
   * @returns
   */
  async findById(id: string): Promise<User | null> {
    return this.userModel.findOne({ _id: id }).exec()
  }

  /**
   * 通过用户名查询记录
   * @param userName
   * @returns
   */
  async findByUserName(userName: string): Promise<User | null> {
    return this.userModel.findOne({ userName }).exec()
  }

  /**
   * 单个用户删除
   * @param id
   */
  async deleteUser(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec()
  }

  // 批量删除用户
  async deleteUsers(ids: string[]): Promise<{ deletedCount: number }> {
    const result = await this.userModel
      .deleteMany({
        _id: { $in: ids }
      })
      .exec()
    return { deletedCount: result.deletedCount }
  }

  // 角色分配
  async assignRoles(userId: string, roleIds: string[]): Promise<User> {
    await this.roleService.validateRolesExist(roleIds)

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { $set: { roles: roleIds } }, { new: true })
      .populate('roles')
      .exec()

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    return updatedUser as User // 类型断言
  }

  // 获取用户完整权限列表（合并所有角色的权限）
  async getUserPermissions(userId: string): Promise<string[]> {
    // populate('roles')将 ObjectId 引用替换为完整的关联文档
    const user = await this.userModel.findById(userId).populate('roles')
    if (!user) throw new Error('User not found')

    return user.roles.flatMap(role => role.permissions)
  }

  // 验证用户是否有特定权限
  async hasPermission(userId: string, requiredPermission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId)
    return permissions.includes(requiredPermission) || permissions.some(p => p === '*') // 超级管理员通配符
  }
}
