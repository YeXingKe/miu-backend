// common/types/request-context.type.ts
import { Request } from 'express'
import { UserRole } from '../enums/user-role.enum'

export interface RequestContext {
  ip: string
  userAgent: string
  startTime: number
}

export interface AuthorizedRequest extends Request {
  user: {
    id: string
    email: string
    roles: UserRole[]
    sessionId: string
  }
  context: RequestContext
}
