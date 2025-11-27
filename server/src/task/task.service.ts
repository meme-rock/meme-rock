import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, ETaskType } from 'src/schemas/task.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { BotService } from 'src/bot/bot.service';
export interface MergedTask extends Task {
  is_claimed: boolean;
}

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(User.name) private userModel: Model<User>,

    private readonly botService: BotService,
  ) {}

  async returnMergedTasks(user: UserDocument): Promise<MergedTask[]> {
    try {
      const claimedTaskIds = new Set(
        user.tasks.map((t) => t.task_id.toString()),
      );

      const dbTasks = await this.taskModel.find().lean().exec();
      console.log('dbTasks', dbTasks);
      const mergedTasks: MergedTask[] = dbTasks.map((task) => {
        const taskId = task._id.toString();
        let isClaimed = claimedTaskIds.has(taskId);
        console.log('task', task);
        if (task.task_type === ETaskType.DAILY && task.daily_task_match) {
          isClaimed = !!(
            user.daily_task_data?.[task.daily_task_match] || false
          );
        }

        return {
          ...task,
          is_claimed: isClaimed,
        };
      });
      console.log('mergedTasks', mergedTasks);
      return mergedTasks;
    } catch (error) {
      console.error('Error in returnMergedTasks service:', error);
      throw error;
    }
  }

  async claimDailyTask(user_id: string, task_id: string) {
    try {
      const [user, task] = await Promise.all([
        this.userModel.findById(user_id).exec(),
        this.taskModel.findById(task_id).exec(),
      ]);
      if (!user || !task) {
        throw new NotFoundException('User or task not found');
      }
      if (task.task_type !== ETaskType.DAILY || !task.daily_task_match) {
        throw new BadRequestException('Task cannot be claimed');
      }
      if (user.daily_task_data?.[task.daily_task_match]) {
        throw new BadRequestException('Task already claimed');
      }
      let adCount = user.ad_data?.ads_watched_today ?? 0;
      let isMember = false;
      switch (task.daily_task_match) {
        case 'join_tg_channel_rock':
          isMember = await this.botService.isChatMember(
            Number(user_id),
            '@thememerock',
          );
          if (!isMember) {
            throw new BadRequestException(
              'User is not a member of the Memerock channel',
            );
          }
          break;
        case 'join_tg_channel_dd':
          isMember = await this.botService.isChatMember(
            Number(user_id),
            '@deepdapp',
          );
          if (!isMember) {
            throw new BadRequestException(
              'User is not a member of the Deep DApp channel',
            );
          }
          break;
        case 'ads_watched':
          if (adCount < task.limit) {
            throw new BadRequestException('User has not watched 10 ads');
          }
          break;
        default:
          break;
      }
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          user_id,
          {
            $set: {
              [`daily_task_data.${task.daily_task_match}`]: true,
            },
            $inc: {
              'daily_task_data.daily_task_reset_flag': 1,
              'balance_data.stone': task.reward,
            },
          },
          { new: true },
        )
        .exec();
      if (!updatedUser) {
        throw new Error('User not found');
      }
      return {
        balance: updatedUser.balance_data,
        task: {
          _id: task_id,
          is_claimed: true,
        },
      };
    } catch (error) {
      console.error('Error in claimDailyTask service:', error);
      throw error;
    }
  }

  async claimCommonTask(user_id, task_id: string) {
    return;
  }

  async claimReusableTask(user_id, task_id: string) {
    return;
  }

  async claimPartnerTask(user_id, task_id: string) {
    return;
  }
}
