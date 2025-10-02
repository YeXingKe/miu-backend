import { PermissionsEnum } from '@/common/enums/permissions.enum'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document, Types } from 'mongoose'

@Schema({ collection: 'menus', timestamps: true })
export class Menu extends Document {
  declare _id: Types.ObjectId

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    minlength: 2,
    maxlength: 20
  })
  @ApiProperty({ example: 'system', description: '菜单显示编码' })
  name: string // 菜单显示名称

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  })
  @ApiProperty({ example: '系统管理', description: '菜单显示名称' })
  title: string // 菜单显示名称

  @Prop({
    type: String,
    required: false,
    unique: true,
    trim: true,
    match: /^\/[a-z0-9/-]*$/ // 验证路由格式
  })
  @ApiProperty({ example: '', description: '前端路由' })
  path: string // 前端路由路径 (如: /system/users)

  @Prop({
    type: String,
    default: '',
    trim: true
  })
  @ApiProperty({ example: '', description: '前端图标' })
  icon: string // 图标类名 (如: el-icon-user)

  @Prop({
    type: String,
    default: '',
    trim: true
  })
  @ApiProperty({ example: '', description: '前端路由组件' })
  component: string // 前端组件路径 (如: system/user/index.vue)

  @Prop({
    type: Types.ObjectId,
    ref: 'Menu',
    default: null
  })
  @ApiProperty({ example: '', description: '关联父组件' })
  parentId: Types.ObjectId | null // 父级一级菜单

  @Prop({
    type: Number,
    required: true,
    min: 0,
    max: 999
  })
  @ApiProperty({ example: '', description: '排序权重' })
  order: number // 排序权重 (数字越小越靠前)

  @Prop({
    type: Boolean,
    default: true
  })
  @ApiProperty({ example: '', description: '是否显示菜单' })
  visible: boolean // 是否显示菜单

  @Prop({ type: [String], default: [] })
  @ApiProperty({ example: '', description: '访问该菜单需要的权限' })
  permissions: string[] // 访问该菜单需要的权限

  @Prop({
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', '*'],
    default: '*'
  })
  @ApiProperty({ example: '', description: '请求方法' })
  method: string // 关联的API请求方法

  @Prop({
    type: String,
    default: '',
    trim: true
  })
  @ApiProperty({ example: '', description: '请求路径' })
  apiPath: string // 关联的后端API路径 (如: /api/users)

  @Prop({ default: '' })
  @ApiProperty({ example: '', description: '重定向' })
  redirect: string

  @Prop({ default: false })
  affix: boolean

  @Prop({ default: false })
  noCache: boolean

  @Prop({ default: null })
  @ApiProperty({ example: '', description: '菜单类型' })
  menuType: string

  // 添加虚拟字段（不存数据库）
  children?: Menu[]
}

export const MenuSchema = SchemaFactory.createForClass(Menu)
// export type MenurDocument = Menu & Document

// 创建索引优化查询性能
MenuSchema.index({ parentId: 1 })
MenuSchema.index({ type: 1 })
// MenuSchema.index({ permissionKey: 1 }, { unique: true, sparse: true })
MenuSchema.index({ sort: 1 })
