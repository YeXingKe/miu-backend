import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, HydratedDocument, Model, Types } from 'mongoose'

import { ApiProperty } from '@nestjs/swagger'
import { PermissionsEnum } from '@/common/enums/permissions.enum'
// *.entity.ts：TypeORM 的“实体类”，对应 关系型数据库（MySQL、PostgreSQL …）。
// *.schema.ts：Mongoose 的“模式定义”，对应 MongoDB。

@Schema({
  collection: 'users',
  timestamps: true
})
export class User extends Document {
  declare _id: Types.ObjectId // 不写也自动生成

  @ApiProperty({ example: 'testUser', description: '用户名' })
  @Prop({ required: true, unique: true }) // unique 建立 唯一索引
  userName: string

  @ApiProperty({ example: 'testUser@example.com', description: '邮箱' })
  // @Prop({ required: false, unique: true, sparse: true, default: null }) // `sparse: true` 允许 null/undefined 不触发唯一约束
  // @IsNotEmpty()
  @Prop({
    // validate: {
    //   validator: (v: string) => /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
    //   message: 'Invalid email format'
    // }
  })
  email?: string

  @ApiProperty({ example: '*******', description: '密码' })
  @Prop({ required: true }) // 查询时默认排除返回password
  password: string

  @Prop()
  salt?: string // 密码盐值

  @ApiProperty({ example: '', description: '电话' })
  @Prop()
  phone: string

  @ApiProperty({ example: '', description: '关联的角色ID数组' })
  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: 'Role'
      }
    ],
    default: []
  })
  roles: Types.ObjectId[] // 联合类型 // 关联的角色ID数组

  @ApiProperty({ example: '', description: '账号是否激活' })
  @Prop({ type: Boolean, default: true })
  isActive: boolean

  @ApiProperty({ example: new Date(), description: '最后登录时间' })
  @Prop({
    type: Date,
    default: null
  })
  lastLoginAt: Date

  @ApiProperty({ example: new Date(), description: '最后登录IP' })
  @Prop()
  lastLoginIp: string

  @ApiProperty({ example: new Date(), description: '连续登录失败次数' })
  @Prop()
  failedLoginAttempts: number

  @ApiProperty({ example: new Date(), description: '账号锁定截止时间' })
  @Prop({
    type: Date,
    default: null
  })
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
// export type UserDocument = User & Document
// 添加实例方法
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const bcrypt = await import('bcrypt')
  return bcrypt.compare(candidatePassword, this.password)
}

// 添加静态方法
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email }).select('+password') // 临时包含密码字段
}
