import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class PaginationDto {
  @ApiProperty({ required: false, default: 1, description: '当前页' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number = 1

  @ApiProperty({ required: false, default: 10, description: '当前页条数' })
  @IsNumber()
  @Min(10)
  @IsOptional()
  limit: number = 10

  @ApiProperty({ description: '总记录数', example: 100 })
  @IsNumber()
  total?: number

  @ApiProperty({ description: '总页数', example: 10 })
  @IsNumber()
  totalPages?: number

  get skip(): number {
    const page = this.page ? this.page : 1
    const limit = this.limit ? this.limit : 10
    return (page - 1) * limit
  }
}
