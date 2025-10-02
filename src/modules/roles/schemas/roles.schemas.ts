import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import mongoose, { Document, HydratedDocument, Model, model, Types } from 'mongoose'
import { PERMISSIONS, PermissionsEnum } from 'src/common/enums/permissions.enum'
// import mongoosePaginate from 'mongoose-paginate-v2'

// 定义角色-菜单权限的详细配置
export class RoleMenuPermission {
  @Prop({ type: Types.ObjectId, ref: 'menus', required: true })
  menu: Types.ObjectId

  @Prop({ type: [String], default: [] })
  permissions: string[] // 该角色对当前菜单拥有的权限标识符
}

@Schema({ collection: 'roles', timestamps: true })
export class Role extends Document {
  declare _id: Types.ObjectId // 不写也自动生成

  @Prop({
    type: String,
    maxlength: 32
  })
  @ApiProperty({ example: '', description: '角色显示名称' })
  name: string // 角色显示名称

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    minlength: 2,
    maxlength: 20
  })
  @ApiProperty({ example: '', description: '角色标识（英文唯一键）' })
  code: string // 角色标识（英文唯一键） (如: ADMIN, EDITOR)

  @Prop({
    type: Boolean,
    default: false,
    maxlength: 100
  })
  @ApiProperty({ example: '', description: '系统角色' })
  isSystem: boolean

  @Prop({
    type: String,
    default: '',
    maxlength: 100
  })
  @ApiProperty({ example: '', description: '角色描述' })
  desc: string // 角色描述

  // @Prop({ type: [{ type: Types.ObjectId, ref: 'Menu' }] })
  // menus: Types.ObjectId[]
  // 使用复杂的结构来关联菜单和权限
  @Prop({ type: [RoleMenuPermission], default: [] })
  menus: RoleMenuPermission[]

  @Prop({
    type: Boolean,
    default: true
  })
  @ApiProperty({ example: '', description: '是否默认角色' })
  isDefault: boolean // 是否默认角色(新用户自动分配)

  @Prop({
    type: Boolean,
    default: true
  })
  @ApiProperty({ example: '', description: '是否已激活' })
  isActive: boolean
}

// export type RoleDocument = Role & Document

// 3. 创建 Schema
export const RoleSchema = SchemaFactory.createForClass(Role)
