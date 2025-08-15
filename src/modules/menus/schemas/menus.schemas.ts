import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ timestamps: true })
export class Menu extends Document {
  declare _id: Types.ObjectId

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  })
  name: string // 菜单显示名称

  @Prop({
    type: String,
    required: false,
    unique: true,
    trim: true,
    match: /^\/[a-z0-9/-]*$/ // 验证路由格式
  })
  path: string // 前端路由路径 (如: /system/users)

  @Prop({
    type: String,
    default: '',
    trim: true
  })
  icon: string // 图标类名 (如: el-icon-user)

  @Prop({
    type: String,
    default: '',
    trim: true
  })
  component: string // 前端组件路径 (如: system/user/index.vue)

  @Prop({
    type: Types.ObjectId,
    ref: 'Menu',
    default: null
  })
  parentId: Types.ObjectId | null // 父级一级菜单

  @Prop({
    type: Number,
    required: true,
    min: 0,
    max: 999
  })
  order: number // 排序权重 (数字越小越靠前)

  @Prop({
    type: Boolean,
    default: true
  })
  visible: boolean // 是否显示菜单

  @Prop({
    type: [Types.ObjectId],
    ref: 'Role',
    default: []
  })
  roles: Types.ObjectId[] // 可访问的角色ID数组

  @Prop({
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', '*'],
    default: '*'
  })
  method: string // 关联的API请求方法

  @Prop({
    type: String,
    default: '',
    trim: true
  })
  apiPath: string // 关联的后端API路径 (如: /api/users)

  // 添加虚拟字段（不存数据库）
  children?: Menu[]
}

export const MenuSchema = SchemaFactory.createForClass(Menu)
// export type MenurDocument = Menu & Document
