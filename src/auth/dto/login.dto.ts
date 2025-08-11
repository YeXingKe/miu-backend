// auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength, IsOptional } from 'class-validator'

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
    example: 'testUser',
    description: '用户名',
    required: false
  })
  @IsString()
  @IsOptional()
  @MinLength(6, { message: '短信验证码必须6位' })
  userName?: string
}
