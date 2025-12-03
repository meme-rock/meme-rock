import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EHiltiLevel } from 'src/common/enums/hiltis.enum';
import { Hilti, HiltiDocument } from 'src/schemas/hilti.schema';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class HiltiService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Hilti.name) private hiltiModel: Model<HiltiDocument>,
  ) {}

  async upgrade(user_id: string) {
    const user = await this.userModel
      .findById(user_id)
      .populate('hilti_data.hilti')
      .lean()
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const currentHilti = user.hilti_data.hilti as unknown as HiltiDocument;
    if (!currentHilti) {
      throw new NotFoundException('Hilti not found');
    }
    // Check if already at maximum level
    if (currentHilti._id === EHiltiLevel.LEVEL_5) {
      throw new BadRequestException('Hilti is already at the maximum level');
    }

    const requiredProfitPerHour = currentHilti.profit_per_hour_to_upgrade;
    const requiredStone = currentHilti.stone_price_to_upgrade;
    // Check if user meets profit per hour requirement
    if (user.airdrop_data.profit_per_hour < requiredProfitPerHour) {
      throw new BadRequestException(
        `Insufficient profit per hour. Required: ${requiredProfitPerHour}, Current: ${user.airdrop_data.profit_per_hour}`,
      );
    }

    // Check if user has enough stones
    if (user.balance_data.stone < requiredStone) {
      throw new BadRequestException(
        `Insufficient stones. Required: ${requiredStone.toLocaleString()}, Available: ${user.balance_data.stone.toLocaleString()}`,
      );
    }

    // Calculate next hilti level
    const currentLevel = parseInt(currentHilti._id.split('_')[1]);
    const nextHiltiLevel = `LEVEL_${currentLevel + 1}` as EHiltiLevel;

    // Find next hilti data
    const nextHilti = await this.hiltiModel.findById(nextHiltiLevel);
    if (!nextHilti) {
      throw new NotFoundException('Next hilti level not found');
    }

    // Calculate profit increase
    const profitIncrease =
      nextHilti.profit_per_hour - currentHilti.profit_per_hour;

    // Update user with new hilti and deduct stones
    const updatedUser = await this.userModel.findByIdAndUpdate(
      user_id,
      {
        $set: {
          'hilti_data.hilti': nextHiltiLevel,
        },
        $inc: {
          'balance_data.stone': -requiredStone,
          'airdrop_data.profit_per_hour': profitIncrease,
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
        new_hilti_level: nextHiltiLevel,
        new_stone_balance: updatedUser.balance_data.stone,
        new_profit_per_hour: updatedUser.airdrop_data.profit_per_hour,
        hilti: {
          _id: nextHilti._id,
          profit_per_hour: nextHilti.profit_per_hour,
          profit_per_hour_to_upgrade: nextHilti.profit_per_hour_to_upgrade,
          stone_price_to_upgrade: nextHilti.stone_price_to_upgrade,
        },
      },
    };
  }
}
