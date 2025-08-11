import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator'
import { UserRole } from 'src/common/enums/user-role.enum'

export class CreateUserDto {
  @ApiProperty({ example: 'admin', description: '用户名' })
  @IsString()
  @MinLength(5)
  userName: string

  @ApiProperty({ example: 'admin@example.com', description: '邮箱' })
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'Password123!',
    description: '密码需包含大小写字母和数字',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
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
  roles?: UserRole[]
}
