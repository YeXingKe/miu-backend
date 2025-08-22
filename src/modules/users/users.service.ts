import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { User, UserDocument } from './schemas/user.schema'
import { RoleService } from '../roles/roles.service'
import { PermissionsEnum } from '@/common/enums/permissions.enum'
import { UserRole } from './schemas/user-role.schema'
import { PaginationFilterDto } from '@/common/dto/pagination-filter.dto'

export interface PaginationResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
/**
 * 	用户管理、角色分配、权限校验
 */

@Injectable()
export class UsersService {
  // 服务层注入模型并写入一条数据（触发“自动建”）
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserRole.name) private userRoleModel: Model<UserRole>,
    private roleService: RoleService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel({
      ...createUserDto
    })
    await this.userRoleModel.create({
      user: createdUser._id,
      role: createdUser.roleIds
    })
    return createdUser.save()
  }

  /**
   * 查询所有用户
   * @returns
   */
  async findAll(paginationFilterDto: PaginationFilterDto): Promise<PaginationResponse<User>> {
    // 查出 users 集合里所有用户，**并把 password 字段排除掉，返回纯数组
    // .exec() → 把 Query 对象真正发出去并返回 Promise，可 await
    const { page, limit, search, sortBy, sortOrder, isActive } = paginationFilterDto
    const skip = (page - 1) * limit

    // 构建查询条件
    const query: any = {}

    if (search) {
      query.$or = [{ userName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]
    }

    if (isActive !== undefined) {
      query.isActive = isActive
    }

    // 构建排序条件
    const sort: any = {}
    sort[sortBy as string] = sortOrder?.toLowerCase() === 'desc' ? -1 : 1

    // 执行查询
    const [data, total] = await Promise.all([
      this.userModel.find(query).sort(sort).skip(skip).limit(limit).select('-password').exec(),
      this.userModel.countDocuments(query).exec()
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

  /**
   * 通过用户id查询记录
   * @param userName
   * @returns
   */
  async findById(id: string): Promise<User | null> {
    const result = await this.userModel.aggregate([
      // 阶段1：匹配目标用户
      { $match: { _id: new Types.ObjectId(id) } },

      // 阶段2：关联中间表 UserRole
      {
        $lookup: {
          from: 'user_roles', // 中间集合名
          localField: '_id', // User._id
          foreignField: 'user', // UserRole.user
          as: 'userRoles' // 输出字段名
        }
      },
      { $unwind: '$userRoles' }, // 展开中间表数组

      // 阶段3：关联 Role 表
      {
        $lookup: {
          from: 'roles',
          localField: 'userRoles.role',
          foreignField: '_id',
          as: 'roles'
        }
      },
      { $unwind: '$roles' }, // 展开角色数组

      // 阶段4：按用户分组，保留用户信息 + 合并权限
      {
        // 按用户 _id 分组，将权限数组合并到 roles 字段
        $group: {
          _id: '$_id',
          userName: { $first: '$userName' }, // 保留用户名字
          email: { $first: '$email' }, // 保留用户邮箱
          roles: { $addToSet: '$roles.permissions' } // 合并权限并去重
        }
      },

      // 阶段5：扁平化权限数组 + 返回完整结构
      {
        $project: {
          _id: 1,
          userName: 1,
          email: 1,
          roles: {
            $reduce: {
              input: '$roles',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] } // 扁平化
            }
          }
        }
      }
    ])

    // 最终结果处理
    if (result.length === 0) throw new Error('User not found')
    const userWithPermissions = {
      ...result[0],
      permissions: [...new Set(result[0].permissions)] // 去重
    }
    return userWithPermissions
  }

  /**
   * 通过用户名查询记录
   * @param userName
   * @returns
   */
  async findByUserName(userName: string): Promise<User | null> {
    // .lean() 返回普通对象 .exec() 才会真正向数据库发送请求
    return this.userModel.findOne({ userName }).lean().exec()
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
      .findByIdAndUpdate(userId, { $set: { roleIds: roleIds } }, { new: true })
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
    const user = await this.userModel.findById(userId).populate<{ roles: { permissions: string[] }[] }>('roles')
    if (!user) throw new Error('User not found')

    return user.roles.flatMap(role => role.permissions)
  }

  // 验证用户是否有特定权限
  async hasPermission(userId: string, requiredPermission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return permissions.includes(requiredPermission) || permissions.some(p => p === PermissionsEnum.ALL_MANGE) // 超级管理员通配符
  }
}
