import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { UserRole } from 'src/common/enums/user-role.enum'

import { ApiProperty } from '@nestjs/swagger'
// *.entity.ts：TypeORM 的“实体类”，对应 关系型数据库（MySQL、PostgreSQL …）。
// *.schema.ts：Mongoose 的“模式定义”，对应 MongoDB。

@Schema({ timestamps: true })
export class User {
  @Prop()
  _id?: Types.ObjectId // 不写也自动生成

  @ApiProperty({ example: 'testUser', description: '用户名' })
  @Prop({ required: true, unique: true })
  userName: string

  @ApiProperty({ example: 'testUser@example.com', description: '邮箱' })
  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ required: false })
  salt: string // 密码盐值

  @ApiProperty({ example: '', description: '电话' })
  @Prop({ required: false, unique: true })
  phone: string

  @ApiProperty({ example: ['admin'], description: '角色列表' })
  @Prop({ type: [String], enum: UserRole, default: [UserRole.EDITOR] })
  roles: UserRole[]

  @ApiProperty({ example: '', description: '细粒度权限码' })
  @Prop({ required: false, unique: true })
  permissions: string[]

  @ApiProperty({ example: '', description: '账号是否激活' })
  @Prop({ required: false, unique: true })
  isActive: boolean

  @ApiProperty({ example: new Date(), description: '最后登录时间' })
  @Prop()
  lastLoginAt: Date

  @ApiProperty({ example: new Date(), description: '最后登录IP' })
  @Prop()
  lastLoginIp: string

  @ApiProperty({ example: new Date(), description: '连续登录失败次数' })
  @Prop()
  failedLoginAttempts: number

  @ApiProperty({ example: new Date(), description: '账号锁定截止时间' })
  @Prop()
  lockUntil?: Date

  @ApiProperty({ example: new Date(), description: '刷新令牌（需加密存储）' })
  @Prop()
  refreshToken: string

  @ApiProperty({ example: '', description: '头像' })
  @Prop()
  avatar?: string
}
// 生成 Mongoose Schema 启动后 Mongoose 会在 MongoDB 里建集合
export const UserSchema = SchemaFactory.createForClass(User)

// 添加虚拟字段到Schema
// UserSchema.virtual('displayName').get(function () {
//   return `${this.userName} (${this.email})`
// })

// 定义文档类型 (User + Mongoose Document方法)
export type UserDocument = User &
  Document & {
    // 可以在这里扩展文档方法
    comparePassword: (candidatePassword: string) => Promise<boolean>
  }

// 添加实例方法
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const bcrypt = await import('bcrypt')
  return bcrypt.compare(candidatePassword, this.password)
}

// 添加静态方法
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email }).select('+password') // 临时包含密码字段
}
