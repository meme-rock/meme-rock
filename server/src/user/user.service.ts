import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Miner, MinerDocument } from 'src/schemas/miner.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { EMinerLevel } from 'src/common/enums/miners.enum';
import { EHiltiLevel } from 'src/common/enums/hiltis.enum';
import { Hilti, HiltiDocument } from 'src/schemas/hilti.schema';
import { Booster, BoosterDocument } from 'src/schemas/booster.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Miner.name) private minerModel: Model<MinerDocument>,
    @InjectModel(Hilti.name) private hiltiModel: Model<HiltiDocument>,
    @InjectModel(Booster.name) private boosterModel: Model<BoosterDocument>,
  ) {}

  /**
   * Calculate pending rock coins based on elapsed time since last claim
   * Uses minute-based calculation for precision
   * @param lastClaim - Last claim timestamp
   * @param profitPerHour - User's profit per hour from boosters
   * @param hiltiRockIncome - Rock income from hilti level
   * @returns Calculated pending rocks (rounded to 2 decimals)
   */
  private calculatePendingRocks(
    lastClaim: Date,
    profitPerHour: number,
    hiltiRockIncome: number,
  ): number {
    const now = Date.now();
    const lastClaimTime = new Date(lastClaim).getTime();

    // Calculate elapsed minutes with millisecond precision
    const elapsedMinutes = (now - lastClaimTime) / (1000 * 60);

    // Total profit per hour and convert to per minute
    const totalProfitPerHour = profitPerHour + hiltiRockIncome;
    const profitPerMinute = totalProfitPerHour / 60;

    // Calculate pending rocks
    const pendingRocks = elapsedMinutes * profitPerMinute;

    // Round to 2 decimal places for precision
    return Math.round(pendingRocks * 100) / 100;
  }

  //! Loading Service
  async loading(_id: string, user: CreateUserDto) {
    try {
      console.log('Loading service started for user:', _id);

      // Parallel fetching for optimal performance
      const [hiltis, level1Miner, level1Hilti, existingUser] =
        await Promise.all([
          this.hiltiModel.find().lean().exec(),
          this.minerModel.findOne({ _id: EMinerLevel.LEVEL_1 }).lean().exec(),
          this.hiltiModel.findOne({ _id: EHiltiLevel.LEVEL_1 }).lean().exec(),
          this.userModel
            .findById(_id)
            .populate('game_data.hilti_data.hilti')
            .lean()
            .exec(),
        ]);

      if (!level1Miner || !level1Hilti) {
        throw new Error('LEVEL_1 miner or hilti not found in database');
      }

      // New user creation
      if (!existingUser) {
        const newUser = await this.userModel.create({
          _id,
          telegram_data: user.telegram_data,
          game_data: {
            stones: 0,
            dust: 0,
            spent_dust: 0,
            spent_stone: 0,
            profit_per_hour: 0,
            is_premium: false,
            auto_collector: false,
            miner_data: {
              miner: level1Miner._id,
              last_mine: new Date(),
            },
            hilti_data: {
              hilti: level1Hilti._id,
              last_claim: new Date(),
            },
            boosters: [],
          },
          airdrop_data: {
            rock_coins: 0,
            wallet_address: null,
          },
          invited_by: null,
          invite_count: 0,
        });

        // Populate and return new user
        const populatedUser = await this.userModel
          .findById(_id)
          .populate('game_data.miner_data.miner')
          .populate('game_data.hilti_data.hilti')
          .exec();

        console.log('New user created:', _id);
        return {
          user: populatedUser,
          hiltis,
          message: 'User created successfully',
        };
      }

      // Existing user - calculate and claim pending rocks
      const lastClaim =
        existingUser.game_data?.hilti_data?.last_claim || new Date();
      const profitPerHour = existingUser.game_data?.profit_per_hour || 0;

      // Extract hilti rock income (handle populated document)
      const hiltiData = existingUser.game_data?.hilti_data?.hilti;
      const hiltiRockIncome =
        typeof hiltiData === 'object' && hiltiData !== null
          ? (hiltiData as any).rock_income || 0
          : 0;

      // Calculate pending rocks
      const pendingRocks = this.calculatePendingRocks(
        lastClaim,
        profitPerHour,
        hiltiRockIncome,
      );

      // Atomic update: claim rocks and update timestamp
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          _id,
          {
            $set: {
              telegram_data: user.telegram_data,
              'game_data.hilti_data.last_claim': new Date(),
            },
            $inc: {
              'airdrop_data.rock_coins': pendingRocks,
            },
          },
          { new: true },
        )
        .populate('game_data.miner_data.miner')
        .populate('game_data.hilti_data.hilti')
        .exec();

      // Log claim details
      const elapsedMinutes = (
        (Date.now() - new Date(lastClaim).getTime()) /
        (1000 * 60)
      ).toFixed(2);

      console.log(
        `User ${_id} claimed ${pendingRocks.toFixed(2)} rocks (${elapsedMinutes} minutes elapsed)`,
      );

      return {
        user: updatedUser,
        hiltis,
        message: 'User updated successfully',
      };
    } catch (error) {
      console.error('Error in loading service:', error);

      // Handle duplicate key errors gracefully
      if (error.code === 11000) {
        console.log('Duplicate key error, fetching existing user');
        const [existingUser, hiltis] = await Promise.all([
          this.userModel
            .findById(_id)
            .populate('game_data.miner_data.miner')
            .populate('game_data.hilti_data.hilti')
            .exec(),
          this.hiltiModel.find().lean().exec(),
        ]);

        return {
          user: existingUser,
          hiltis,
          message: 'User already exists',
        };
      }

      throw error;
    }
  }

  async getBoosters() {
    try {
      const boosters = await this.boosterModel.find();
      return boosters;
    } catch (error) {
      console.error('Error in getBoosters service:', error);
      throw error;
    }
  }

  /**
   * Webhook endpoint for ad providers (Adsgram/AdExtra)
   * Called by ad provider's server when user completes an ad
   * @param user_id - User's Telegram ID
   * @param token - Security token to verify request authenticity
   * @returns Success status
   */
  async adRewardWebhook(user_id: string, token: string, provider: string) {
    try {
      // Validate inputs
      if (!user_id) {
        throw new Error('user_id is required');
      }

      if (!token) {
        throw new Error('token is required');
      }

      // Verify token (use env variable in production)
      const WEBHOOK_TOKEN =
        process.env.AD_WEBHOOK_TOKEN || 'meme_rock_ad_secret_2024';

      if (token !== WEBHOOK_TOKEN) {
        console.error(`❌ Invalid token attempt for user ${user_id}`);
        throw new Error('Invalid token');
      }
      console.log(
        'Ad reward webhook received for user:',
        user_id,
        'provider:',
        provider,
      );
      const DUST_REWARD = 5;

      // Atomic update to prevent race conditions
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          user_id,
          {
            $inc: { 'game_data.dust': DUST_REWARD },
          },
          { new: true },
        )
        .select('_id game_data.dust')
        .lean()
        .exec();

      if (!updatedUser) {
        console.error(`❌ User not found: ${user_id}`);
        throw new Error('User not found');
      }

      console.log(
        `✅ Ad reward webhook: User ${user_id} received ${DUST_REWARD} dust (new balance: ${updatedUser.game_data.dust})`,
      );

      return {
        success: true,
        message: 'Reward processed successfully',
      };
    } catch (error) {
      console.error('❌ Ad reward webhook error:', error);
      throw error;
    }
  }

  async getBalanceAfterAdReward(user_id: string) {
    try {
      const user = await this.userModel
        .findById(user_id)
        .select('game_data.dust')
        .lean()
        .exec();
      if (!user) {
        throw new Error('User not found');
      }
      return user.game_data.dust;
    } catch (error) {
      console.error('Error in getBalanceAfterAdReward service:', error);
      throw error;
    }
  }
}
