import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Miner, MinerDocument } from 'src/schemas/miner.schema';
import { EMinerLevel } from 'src/common/enums/miners.enum';

@Injectable()
export class UserMineService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Miner.name) private minerModel: Model<MinerDocument>,
  ) {}

  //! Mine
  async mine(user_id: string) {}

  //! Upgrade Miner
  async upgrade(user_id: string) {
    // Find user
    const user = await this.userModel.findById(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find current miner
    const currentMiner = await this.minerModel.findById(user.miner_data.miner);
    if (!currentMiner) {
      throw new NotFoundException('Miner not found');
    }

    // Check if already at maximum level
    if (currentMiner._id === EMinerLevel.LEVEL_5) {
      throw new BadRequestException('Miner is already at the maximum level');
    }

    // Check if user has enough stones
    if (user.balance_data.stone < currentMiner.stone_price_to_upgrade) {
      throw new BadRequestException('Not enough stones to upgrade');
    }

    // Calculate next miner level
    const currentLevel = parseInt(currentMiner._id.split('_')[1]);
    const nextMinerLevel = `LEVEL_${currentLevel + 1}` as EMinerLevel;

    // Find next miner data
    const nextMiner = await this.minerModel.findById(nextMinerLevel);
    if (!nextMiner) {
      throw new NotFoundException('Next miner level not found');
    }

    // Update user with new miner and deduct stones
    const updatedUser = await this.userModel.findByIdAndUpdate(
      user_id,
      {
        $set: {
          'miner_data.miner': nextMinerLevel,
        },
        $inc: {
          'balance_data.stone': -currentMiner.stone_price_to_upgrade,
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('Failed to update user');
    }

    return {
      success: true,
      data: {
        new_miner_level: nextMinerLevel,
        new_stone_balance: updatedUser.balance_data.stone,
        miner: nextMiner,
      },
    };
  }
}
