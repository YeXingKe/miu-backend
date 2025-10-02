import { PermissionsEnum } from '@/common/enums/permissions.enum'
import { Types } from 'mongoose'

export class MenuDto {
  id: string
  name: string
  path: string
  icon?: string
  component?: string
  redirect?: string
  meta: {
    title: string
    icon?: string
    hidden?: boolean
    alwaysShow?: boolean
    roles?: string[] // 角色标识字符串数组
    keepAlive?: boolean
    affix?: boolean
    noCache?: boolean
  }
  children?: MenuDto[]
  order?: number
}
