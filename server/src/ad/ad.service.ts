import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class AdService {
  private readonly WEBHOOK_TOKEN = process.env.AD_WEBHOOK_TOKEN;
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
      if (token !== this.WEBHOOK_TOKEN) {
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
            $inc: {
              'balance_data.dust': DUST_REWARD,
              'ad_data.ads_watched_total': 1,
              'ad_data.ads_watched_daily': 1,
            },
          },
          { new: true },
        )
        .select('_id balance_data.dust')
        .lean()
        .exec();

      if (!updatedUser) {
        console.error(`❌ User not found: ${user_id}`);
        throw new Error('User not found');
      }

      console.log(
        `✅ Ad reward webhook: User ${user_id} received ${DUST_REWARD} dust (new balance: ${updatedUser.balance_data.dust})`,
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

  async getAfterAdReward(user_id: string) {
    try {
      const user = await this.userModel
        .findById(user_id, { balance_data: 1, ad_data: 1, _id: 0 })
        .lean()
        .exec();
      if (!user) {
        throw new Error('User not found');
      }
      return {
        balance: user.balance_data,
        ad_data: user.ad_data,
      };
    } catch (error) {
      console.error('Error in getBalanceAfterAdReward service:', error);
      throw error;
    }
  }
}
