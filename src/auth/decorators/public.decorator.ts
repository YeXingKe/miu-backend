// auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic' // 给装饰器 @Public() 做“标记”。
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
