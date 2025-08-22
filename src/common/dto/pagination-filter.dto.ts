import { PaginationDto } from './pagination.dto'
import { IsOptional, IsString, IsBoolean } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class PaginationFilterDto extends PaginationDto {
  @ApiProperty({
    description: '搜索关键字',
    required: false,
    example: 'john'
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiProperty({
    description: '排序字段',
    required: false,
    example: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'

  @ApiProperty({
    description: '排序方向',
    required: false,
    enum: ['ASC', 'DESC'],
    example: 'DESC'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC'

  @ApiProperty({
    description: '是否激活',
    required: false,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean
}
