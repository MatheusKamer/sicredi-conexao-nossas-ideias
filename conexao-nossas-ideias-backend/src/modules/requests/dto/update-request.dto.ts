import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RequestsStatusType } from '../entities/request.entity';

export class UpdateRequestDto {
  @IsNotEmpty()
  @IsIn([
    RequestsStatusType.APPROVED,
    RequestsStatusType.REJECTED,
    RequestsStatusType.UNDER_REVIEW,
  ])
  status: RequestsStatusType;

  @IsString()
  @IsOptional()
  decisionComment?: string;
}
