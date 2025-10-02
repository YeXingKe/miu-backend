// user-role.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
/**
 * 中间表实现roles和users之间的关联
 */
@Schema({ collection: 'user_roles', timestamps: true }) // 强制表名 user_roles
export class UserRole extends Document {
  declare _id: Types.ObjectId // 不写也自动生成

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId // 关联 User

  @Prop({ type: Types.ObjectId, ref: 'Role' })
  roleId: Types.ObjectId // 关联 Role

  @Prop({ default: true })
  isActive: boolean // 是否激活状态

  @Prop()
  assignedBy: string // 分配人
}
export type UserRoleDocument = UserRole & Document

export const UserRoleSchema = SchemaFactory.createForClass(UserRole)

// 创建复合唯一索引，防止重复分配
UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true })
