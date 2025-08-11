import { ApiProperty } from '@nestjs/swagger'

export class UserResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: '用户ID' })
  id: string

  @ApiProperty({ example: 'john_doe', description: '用户名' })
  username: string

  @ApiProperty({ example: 'john@example.com', description: '邮箱' })
  email: string

  @ApiProperty({
    example: ['user'],
    description: '角色列表',
    type: [String]
  })
  roles: string[]

  @ApiProperty({
    example: 'john_doe (john@example.com)',
    description: '显示名称'
  })
  displayName: string

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: '创建时间'
  })
  createdAt: Date
}
