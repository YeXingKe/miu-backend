import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from './schemas/user.schema'

@Injectable()
export class UsersService {
  // 服务层注入模型并写入一条数据（触发“自动建”）
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
}
