import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ETaskType, ETaskAPIType, ETaskIcon } from 'src/schemas/task.schema';

export class CreateTaskDto {
  @IsEnum(ETaskType)
  task_type: ETaskType;

  @IsEnum(ETaskAPIType)
  api_type: ETaskAPIType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  daily_task_match?: string;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  link?: string;

  @IsEnum(ETaskIcon)
  @IsOptional()
  icon?: ETaskIcon;

  @IsNumber()
  reward: number;
}
