import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import mongoose, { Document, HydratedDocument, Model, model, Types } from 'mongoose'
import { PERMISSIONS, PermissionsEnum } from 'src/common/enums/permissions.enum'
// import mongoosePaginate from 'mongoose-paginate-v2'

@Schema({ timestamps: true })
export class Role {
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
    type: String,
    default: '',
    maxlength: 100
  })
  @ApiProperty({ example: '', description: '角色描述' })
  description: string // 角色描述

  @Prop({
    type: [String],
    enum: PERMISSIONS, // 使用枚举值数组
    default: []
  })
  @ApiProperty({ example: '', description: '权限标识数组' })
  permissions: PermissionsEnum[] // 权限标识数组 (RBAC核心)

  @Prop({
    type: Boolean,
    default: true
  })
  @ApiProperty({ example: '', description: '是否默认角色' })
  isDefault: boolean // 是否默认角色(新用户自动分配)

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: 'User'
      }
    ],
    default: [],
    select: false
  })
  @ApiProperty({ example: '', description: '关联的用户' })
  userIds: Types.ObjectId[] // 关联的用户(通常不需要查询)
}

export type RoleDocument = Role & Document

// 3. 创建 Schema
export const RoleSchema = SchemaFactory.createForClass(Role)
