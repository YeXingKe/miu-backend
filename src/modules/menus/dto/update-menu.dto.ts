import { ApiProperty } from '@nestjs/swagger'
import { PartialType } from '@nestjs/swagger'
import { CreateMenuDto } from './create-menu.dto'
import { IsArray, IsMongoId, IsOptional } from 'class-validator'

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @ApiProperty({
    example: ['65a1b2c3d4e5f6g7h8i9j0l'],
    description: '要完全替换的角色ID数组',
    required: false,
    type: [String]
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  roles?: string[]
}
