import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsArray, IsOptional, MaxLength, ArrayMaxSize, ArrayUnique } from 'class-validator'
import { CreateRoleDto } from './create-role.dto'
import { PERMISSIONS } from 'src/common/enums/permissions.enum'
import { PartialType } from '@nestjs/mapped-types'

// 继承CreateRoleDto但所有字段可选
export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty({
    example: ['menu:create', 'menu:delete'],
    description: '要完全替换的权限数组',
    required: false,
    enum: PERMISSIONS
  })
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[]

  @ApiProperty({
    example: false,
    description: '是否禁用该角色',
    required: false
  })
  @IsOptional()
  disabled?: boolean
}
