// scripts/init-database.ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { DatabaseInitService } from '../src/database/init.service'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule)

  const databaseInitService = app.get(DatabaseInitService)

  try {
    await databaseInitService.initializeDatabase()
    console.log('数据库初始化成功')
  } catch (error) {
    console.error('数据库初始化失败:', error)
    process.exit(1)
  } finally {
    await app.close()
  }
}

bootstrap()
