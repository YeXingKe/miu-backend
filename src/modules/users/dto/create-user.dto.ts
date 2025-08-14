import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator'
import { UserRole } from 'src/common/enums/user-role.enum'

export class CreateUserDto {
  @ApiProperty({
    example: 'example@foxmail.com',
    description: '邮箱',
    required: false
  })
  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({
    example: '12345678901',
    description: '电话',
    required: false
  })
  @IsPhoneNumber()
  phone?: string

  @ApiProperty({
    example: 'admin',
    description: '用户名',
    required: true
  })
  @IsString()
  @IsOptional()
  @MinLength(5, { message: '用户名' })
  userName: string

  @ApiProperty({
    example: '********',
    description: '密码',
    required: true
  })
  @IsString()
  @IsOptional()
  @MinLength(8, { message: '密码' })
  password: string

  @ApiProperty({
    example: [UserRole.USER],
    description: '用户角色',
    enum: UserRole,
    isArray: true,
    required: false
  })
  @IsArray()
  @IsOptional()
  @IsEnum(UserRole, { each: true }) // 数组每个元素都要是枚举
  roles?: UserRole[] = [UserRole.USER] // ← 直接给默认值 仅用于 类转换/验证阶段，不会写进 Mongo
}
