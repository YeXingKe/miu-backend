import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsArray, IsOptional, IsNotEmpty, MaxLength, ArrayMaxSize, ArrayUnique } from 'class-validator'
import { PERMISSIONS } from 'src/common/enums/permissions.enum'

export class CreateRoleDto {
  @ApiProperty({
    example: 'admin',
    description: '角色标识（英文唯一键）',
    maxLength: 32
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  code: string

  @ApiProperty({
    example: '管理员',
    description: '角色显示名称',
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string

  @ApiProperty({
    example: '系统最高权限角色',
    description: '角色描述',
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string

  @ApiProperty({
    example: ['user:create', 'user:delete'],
    description: '权限标识数组',
    enum: PERMISSIONS,
    type: [String]
  })
  @IsArray()
  @ArrayMaxSize(100) // 限制最大权限数量
  @ArrayUnique() // 确保权限不重复
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[]

  @ApiProperty({
    example: true,
    description: '是否作为新用户默认角色',
    required: false
  })
  @IsOptional()
  isDefault?: boolean
}
