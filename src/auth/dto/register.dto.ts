// auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength, IsOptional, IsEnum, IsEmail, isArray, IsArray, IsPhoneNumber } from 'class-validator'
import { UserRole } from 'src/common/enums/user-role.enum'

export class RegisterDto {
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
  @IsEnum(UserRole)
  roles: string[]
}
