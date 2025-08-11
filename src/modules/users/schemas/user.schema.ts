import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { UserRole } from 'src/common/enums/user-role.enum'

// 定义用户模型
@Schema({
  timestamps: true, // 自动添加 createdAt 和 updatedAt
  versionKey: false, // 禁用 __v 字段
  toJSON: { virtuals: true } // 启用虚拟字段转换
})
export class User {
  @Prop({ type: String, required: true, unique: true, trim: true })
  userName: string

  @Prop({ type: String, required: true, unique: true, lowercase: true })
  email: string

  @Prop({ type: String, required: true, select: false }) // 查询时默认排除
  password: string

  @Prop({
    type: [String],
    enum: Object.values(UserRole),
    default: [UserRole.USER]
  })
  roles: UserRole[]

  @Prop({ type: String, select: false })
  refreshToken?: string

  // 虚拟字段示例 (不会存到数据库)
  get displayName(): string {
    return `${this.userName} (${this.email})`
  }
}

// 生成 Mongoose Schema
export const UserSchema = SchemaFactory.createForClass(User)

// 添加虚拟字段到Schema
UserSchema.virtual('displayName').get(function () {
  return `${this.userName} (${this.email})`
})

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
