import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Role, RoleSchema } from './schemas/roles.schemas'
import { RoleService } from './roles.service'
import { RolesController } from './roles.controller'
import { MenuRole, MenuRoleSchema } from './schemas/menu-role.schema'
import { UserRole, UserRoleSchema } from './schemas/user-role.schema'
import { MenusModule } from '../menus/menus.module'

@Module({
  imports: [
    forwardRef(() => MenusModule), // 使用 forwardRef
    MongooseModule.forFeature([
      {
        name: Role.name,
        schema: RoleSchema
      },
      {
        name: MenuRole.name,
        schema: MenuRoleSchema
      },
      {
        name: UserRole.name,
        schema: UserRoleSchema
      }
    ])
  ],
  controllers: [RolesController],
  providers: [RoleService],
  exports: [RoleService, MongooseModule]
})
export class RoleModule {}
