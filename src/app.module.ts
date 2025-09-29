import { Module } from '@nestjs/common'
import { UsersModule } from './modules/users/users.module'
import { AuthModule } from './auth/auth.module'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MenusModule } from './modules/menus/menus.module'

@Module({
  imports: [
    MenusModule,
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }), // 必须加载 .env
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // 依赖注入 ConfigModule
      useFactory: (config: ConfigService) => ({
        // 工厂函数返回配置对象
        uri: config.get<string>('MONGODB_URI'), // 从环境变量获取URI
        auth: {
          // 认证配置
          username: config.get<string>('MONGODB_USER'),
          password: config.get<string>('MONGODB_PASSWORD')
        },
        authSource: 'admin', // 关键：告诉驱动去 admin 库验证
        // useNewUrlParser: true, // 使用新URL解析器 启用新的 MongoDB 连接字符串解析器 (避免弃用警告) a deprecated option
        // useUnifiedTopology: true, // 使用统一拓扑结构 使用新的服务器发现和监视引擎 (提升连接稳定性) a deprecated option
        connectionFactory: connection => {
          // 连接后处理
          connection.plugin(require('mongoose-autopopulate')) // 注册全局钩子 自动填充关联字段
          return connection
        }
      }),
      //  生产环境
      // useFactory: () => ({
      //   uri: process.env.MONGODB_URI,
      //   ssl: true, // 启用SSL
      //   sslValidate: true,
      //   sslCA: require('fs').readFileSync('/path/to/ca.pem'),
      //   poolSize: 10, // 连接池大小
      //   socketTimeoutMS: 45000, // socket超时
      // })
      inject: [ConfigService]
    })
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
