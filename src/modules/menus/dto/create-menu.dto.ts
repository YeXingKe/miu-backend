import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsArray, IsBoolean, IsNotEmpty, ValidateNested, IsMongoId } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateMenuDto {
  @ApiProperty({ example: '用户管理', description: '菜单名称' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: '/system/users', description: '路由路径', required: false })
  @IsString()
  @IsOptional()
  path?: string

  @ApiProperty({ example: 'user', description: '图标名称', required: false })
  @IsString()
  @IsOptional()
  icon?: string

  @ApiProperty({ example: 'system/user/index', description: '前端组件路径', required: false })
  @IsString()
  @IsOptional()
  component?: string

  @ApiProperty({
    example: null,
    description: '父菜单ID (null表示一级菜单)',
    required: false
  })
  @IsMongoId()
  @IsOptional()
  parentId?: string | null

  @ApiProperty({ example: 0, description: '排序权重' })
  @IsNotEmpty()
  order: number

  @ApiProperty({ example: true, description: '是否可见', required: false })
  @IsBoolean()
  @IsOptional()
  visible?: boolean

  @ApiProperty({
    example: ['65a1b2c3d4e5f6g7h8i9j0k'],
    description: '可访问的角色ID数组',
    type: [String || Object],
    required: false
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  roles?: string[]

  @ApiProperty({
    example: 'GET',
    description: '关联的API请求方法',
    enum: ['GET', 'POST', 'PUT', 'DELETE', '*'],
    required: false
  })
  @IsOptional()
  @IsString()
  method?: string

  @ApiProperty({
    example: '/api/users',
    description: '关联的后端API路径',
    required: false
  })
  @IsOptional()
  @IsString()
  apiPath?: string
}
