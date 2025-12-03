import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  ETaskAPIType,
  ETaskIcon,
  ETaskType,
} from 'src/common/enums/tasks.enum';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: String, required: true })
  task_type: ETaskType;

  @Prop({ type: String, required: true })
  api_type: ETaskAPIType;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: false })
  daily_task_match: string;

  @Prop({ type: Number, required: false })
  limit: number;

  @Prop({ type: String, required: false })
  link: string;

  @Prop({ type: String, required: false })
  icon: ETaskIcon;

  @Prop({ type: Number, required: true })
  reward: number;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
