import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { RequestsStatusType } from '../entities/request.entity';

export class UpdateRequestDto {
  @IsNotEmpty()
  @IsIn([RequestsStatusType.APPROVED, RequestsStatusType.REJECTED])
  status: RequestsStatusType;

  @IsString()
  @IsNotEmpty()
  decisionComment: string;
}
