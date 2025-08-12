import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import Redoc from 'redoc-express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api') // 设置全局api路径前缀
  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('后台管理系统 API')
    .setDescription('基于 NestJS + MongoDB 的管理系统接口文档')
    .setVersion('1.0')
    .addBearerAuth() // JWT 支持
    .addTag('Auth', '认证相关接口')
    .addTag('Users', '用户管理接口')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  // Swagger UI (开发环境)
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'API 文档',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method'
    }
  })
  // 添加JSON端点（如果不存在）
  app.use('/api-docs-json', (req, res) => {
    res.json(document)
  })

  // // ReDoc (生产环境)
  // app.use(
  //   '/docs',
  //   Redoc({
  //     title: 'API 文档',
  //     nonce: '',
  //     specUrl: '/swagger.json',
  //     redocOptions: {
  //       theme: { colors: { primary: { main: '#1890ff' } } },
  //       scrollYOffset: 60
  //     }
  //   })
  // )
  // 在 main.ts 中添加
  // app.use(helmet())
  // app.enableCors({ origin: process.env.CLIENT_URL })
  // app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
  //   import rateLimit from 'express-rate-limit';
  //  速率限制（防止暴力破解）
  // app.use(
  //   rateLimit({
  //     windowMs: 15 * 60 * 1000, // 15分钟
  //     max: 5, // 每个IP最多5次登录尝试
  //     skipSuccessfulRequests: true, // 只限制失败请求
  //     message: '尝试次数过多，请15分钟后再试',
  //   })
  // );
  await app.listen(3000)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap()
