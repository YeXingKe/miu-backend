// schemas/role-menu.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// export type MenuRoleDocument = MenuRole & Document

@Schema({ collection: 'menu_roles', timestamps: true })
export class MenuRole extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Menu', required: true })
  menuId: Types.ObjectId
}

export const MenuRoleSchema = SchemaFactory.createForClass(MenuRole)

// 创建复合唯一索引，确保同一角色和菜单只能有一条记录
MenuRoleSchema.index({ roleId: 1, menuId: 1 }, { unique: true })
