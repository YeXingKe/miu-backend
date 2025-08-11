// user.entity.ts
import { ApiProperty } from '@nestjs/swagger'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { UserRole } from 'src/common/enums/user-role.enum'

@Schema({ timestamps: true })
export class User {
  @ApiProperty({ example: 'testUser', description: '用户名' })
  @Prop({ required: true, unique: true })
  userName: string

  @ApiProperty({ example: 'testUser@example.com', description: '邮箱' })
  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @ApiProperty({ example: ['admin'], description: '角色列表' })
  @Prop({ type: [String], default: [UserRole.EDITOR] })
  roles: string[]
}

export const UserSchema = SchemaFactory.createForClass(User)
