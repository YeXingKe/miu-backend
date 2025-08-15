import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Menu, MenuSchema } from './schemas/menus.schemas'
import { MenusService } from './menus.service'
import { RoleModule } from '../roles/roles.module'
import { MenusController } from './menus.controller'

@Module({
  imports: [
    RoleModule,
    MongooseModule.forFeature([
      {
        name: Menu.name,
        schema: MenuSchema
      }
    ])
  ],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService]
})
export class MenusModule {}
