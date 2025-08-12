import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { User, UserDocument } from './schemas/user.schema'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt() // 产生随机盐
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt) // 用盐和明文密码 createUserDto.password 生成 hash 密文，避免明文存储

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword
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
  async findOneById(id: string): Promise<User | null> {
    return this.userModel.findOne({ _id: id }).exec()
  }

  /**
   * 通过用户名查询记录
   * @param userName
   * @returns
   */
  async findOneByUserName(userName: string): Promise<User | null> {
    return this.userModel.findOne({ userName }).exec()
  }
}
