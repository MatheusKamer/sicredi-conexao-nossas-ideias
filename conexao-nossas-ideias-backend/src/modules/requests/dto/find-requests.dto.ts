import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  RequestsPriorityType,
  RequestsStatusType,
} from '../entities/request.entity';
import { Type } from 'class-transformer';

export class FindRequestsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RequestsStatusType)
  status?: RequestsStatusType;

  @IsOptional()
  @IsEnum(RequestsPriorityType)
  priority?: RequestsPriorityType;

  @IsOptional()
  @IsString()
  areaId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
