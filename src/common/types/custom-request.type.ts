// common/types/custom-request.type.ts
import { Request } from 'express'
import { UserDocument } from '../../modules/users/schemas/user.schema'

export interface AuthenticatedRequest extends Request {
  user: {
    userId?: string
    email: string
    roles: string[]
    // 可以添加其他JWT payload字段
    refreshToken?: string
  }
}

export interface UserRequest extends AuthenticatedRequest {
  user: UserDocument // 当需要完整用户文档时使用
}
