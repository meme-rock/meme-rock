import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ClaimTaskDto {
  @IsNotEmpty()
  @IsMongoId()
  task_id: string;
}
