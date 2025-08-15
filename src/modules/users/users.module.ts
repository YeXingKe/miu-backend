import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { User, UserSchema } from './schemas/user.schema'
import { LoggerMiddleware } from 'src/common/middlewares/logger.midleware'
import { RoleModule } from '../roles/roles.module'

@Module({
  //  UserModule 注册模型
  imports: [RoleModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService] // 导出服务供其他模块使用
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('log')
  }
}
