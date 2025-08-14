// src/common/interceptors/transform.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

// 定义标准响应格式
export interface StandardResponse<T> {
  //   success: boolean
  code: number
  message: string
  data?: T
  timestamp: string
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const now = Date.now()
    const httpContext = context.switchToHttp()
    const response = httpContext.getResponse()
    const request = context.switchToHttp().getRequest()
    // 跳过特定路由
    if (request.path === '/healthcheck') {
      return next.handle()
    }

    return next.handle().pipe(
      map(data => {
        const statusCode = response.statusCode
        let message = 'Operation successful'

        // 根据状态码自定义消息
        if (statusCode === 201) message = 'Resource created successfully'
        if (statusCode === 204) message = 'Operation completed with no content'

        return {
          //   success: ,
          code: statusCode,
          message,
          data: data || null, // 如果不需要数据可以删除此行
          timestamp: new Date(now).toISOString()
        }
      })
    )
  }
}
