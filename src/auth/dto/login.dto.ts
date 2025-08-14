// auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength, IsOptional, IsEnum, IsEmail, isArray, IsArray } from 'class-validator'
import { UserRole } from 'src/common/enums/user-role.enum'

export class LoginDto {
  @ApiProperty({
    example: 'A7B9K',
    description: '验证码（错误次数超过阈值时必填）',
    required: false
  })
  @IsString()
  @IsOptional()
  @MinLength(4, { message: '验证码至少4位' })
  captcha?: string

  @ApiProperty({
    example: '123456',
    description: '短信验证码（启用双因素认证时必填）',
    required: false
  })
  @IsString()
  @IsOptional()
  @MinLength(6, { message: '短信验证码必须6位' })
  smsCode?: string

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
    example: 'admin',
    description: '密码',
    required: true
  })
  @IsString()
  @IsOptional()
  password: string
}
