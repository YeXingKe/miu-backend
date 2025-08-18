// user-role.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
/**
 * 中间表实现roles和users之间的关联
 */
@Schema({ collection: 'user_roles', timestamps: true }) // 强制表名 user_roles
export class UserRole extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId // 关联 User

  @Prop({ type: Types.ObjectId, ref: 'Role' })
  role: Types.ObjectId // 关联 Role
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole)
