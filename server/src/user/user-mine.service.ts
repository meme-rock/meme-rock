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
  // Mining variables
  private readonly MINING_COOLDOWN_MS = 15 * 1000; // 1 * 60 * 60 * 1000; // 1 Saat
  private readonly MAX_CLAIMS_STANDARD = 2; // 2 periyot (örn. 2 saat)
  private readonly MAX_CLAIMS_AUTO_MINING = 6; // 6 periyot (örn. 6 saat)
  private readonly MAX_CLAIMS_PREMIUM = 24; // 24 periyot (örn. 24 saat)
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Miner.name) private minerModel: Model<MinerDocument>,
  ) {}

  //! Calculate Mine Reward
  async calculateMinerData(
    miner_data: {
      miner: MinerDocument;
      last_mine: Date;
    },
    is_premium: boolean,
    is_auto_mining: boolean,
  ): Promise<{
    max_periods: number;
    claimable_periods: number;
    next_mine: Date;
  }> {
    const last_mine = miner_data.last_mine;
    let max_periods: number;
    if (is_premium) {
      max_periods = this.MAX_CLAIMS_PREMIUM;
    } else if (is_auto_mining) {
      max_periods = this.MAX_CLAIMS_AUTO_MINING;
    } else {
      max_periods = this.MAX_CLAIMS_STANDARD;
    }

    // Now
    const now = new Date();
    // Calculate elapsed time
    const elapsed_time = now.getTime() - last_mine.getTime();
    if (elapsed_time < this.MINING_COOLDOWN_MS) {
      return {
        max_periods: max_periods,
        claimable_periods: 0,
        next_mine: new Date(last_mine.getTime() + this.MINING_COOLDOWN_MS),
      };
    }
    const elapsed_periods = Math.floor(elapsed_time / this.MINING_COOLDOWN_MS);

    // 5. Toplanacak periyot sayısını hesapla (minimum: geçen periyot vs max limit)
    const claimable_periods = Math.min(elapsed_periods, max_periods);

    return {
      max_periods: max_periods,
      claimable_periods: claimable_periods,
      next_mine: new Date(last_mine.getTime() + this.MINING_COOLDOWN_MS),
    };
  }
  //! Mine
  async mine(user_id: string) {
    // 1. Kullanıcıyı ve miner detaylarını tek seferde al
    const user = await this.userModel
      // Miner dokümanının tam olarak populate edildiğinden emin olmak için tip tanımı eklenmiştir
      .findById(user_id)
      .select('miner_data balance_data is_premium is_auto_mining')
      .populate<{ miner_data: { miner: MinerDocument; last_mine: Date } }>(
        'miner_data.miner',
      )
      .exec();
    console.log('USER: ', user);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const mineData = await this.calculateMinerData(
      {
        miner: user.miner_data.miner,
        last_mine: user.miner_data.last_mine,
      },
      user.is_premium,
      user.is_auto_mining,
    );
    console.log('mineData', mineData);
    if (mineData.claimable_periods === 0) {
      throw new BadRequestException('Miner is not ready to mine');
    }
    const reward_type = user.miner_data.miner.reward_type.toLowerCase();
    const profit_per_hour = user.miner_data.miner.profit_per_hour;
    const updatedUser = await this.userModel.findByIdAndUpdate(
      user_id,
      {
        $set: {
          'miner_data.last_mine': new Date(),
        },
        $inc: {
          [`balance_data.${reward_type}`]:
            mineData.claimable_periods * profit_per_hour,
        },
      },
      { new: true },
    );
    console.log('updatedUser', updatedUser);
    if (!updatedUser) {
      throw new NotFoundException('Failed to update user');
    }

    return {
      success: true,
      message: 'MINING_SUCCESSFUL',
      balance_data: updatedUser.balance_data,
      miner_data: {
        ...updatedUser.toObject().miner_data,
        next_mine: new Date(
          updatedUser.miner_data.last_mine.getTime() + this.MINING_COOLDOWN_MS,
        ),
        max_periods: mineData.max_periods,
        claimable_periods: 0,
      },
    };
  }

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
