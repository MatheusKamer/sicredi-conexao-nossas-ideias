import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { RequestsPriorityType } from '../entities/request.entity';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  requester: string;

  @IsUUID()
  @IsNotEmpty()
  areaId: string;

  @IsNotEmpty()
  @IsEnum(RequestsPriorityType)
  priority: RequestsPriorityType;
}
