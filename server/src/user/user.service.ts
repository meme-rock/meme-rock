import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
      const [hiltis, miners, level1Miner, level1Hilti, existingUser] =
        await Promise.all([
          this.hiltiModel.find().lean().exec(),
          this.minerModel.find().lean().exec(),
          this.minerModel.findOne({ _id: EMinerLevel.LEVEL_1 }).lean().exec(),
          this.hiltiModel.findOne({ _id: EHiltiLevel.LEVEL_1 }).lean().exec(),
          this.userModel
            .findById(_id)
            .populate('hilti_data.hilti')
            .populate('miner_data.miner')
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
          balance_data: {},
          payment_data: {},
          airdrop_data: {},
          ad_data: {},
          // ANCAK, Miner ve Hilti referanslarını manuel olarak atamalıyız.
          miner_data: {
            miner: level1Miner._id, // Başlangıç Miner referansı atanmalı
            last_mine: new Date(), // MinerData içindeki varsayılan değerleri açıkça atamak daha güvenlidir.
          },
          hilti_data: {
            hilti: level1Hilti._id, // Başlangıç Hilti referansı atanmalı
          },
          boosters: [],
          is_premium: false,
          invited_by: null,
          invite_count: 0,
          created_at: new Date(),
          last_online: new Date(),
        });

        // Populate and return new user
        const populatedUser = await this.userModel
          .findById(_id)
          .populate('miner_data.miner')
          .populate('hilti_data.hilti')
          .exec();

        console.log('New user created:', _id);
        return {
          user: populatedUser,
          hiltis,
          miners,
          message: 'User created successfully',
        };
      }

      // Existing user - calculate and claim pending rocks
      const lastClaim = existingUser.last_online || new Date();
      const profitPerHour = existingUser.airdrop_data?.profit_per_hour || 0;

      // Extract hilti rock income (handle populated document)
      const hiltiData = existingUser.hilti_data.hilti;
      const hiltiRockIncome =
        typeof hiltiData === 'object' && hiltiData !== null
          ? (hiltiData as any).profit_per_hour || 0
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
              last_online: new Date(),
            },
            $inc: {
              'airdrop_data.rock_coins': pendingRocks,
            },
          },
          { new: true },
        )
        .populate('miner_data.miner')
        .populate('hilti_data.hilti')
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
        miners,
        message: 'User updated successfully',
      };
    } catch (error) {
      console.error('Error in loading service:', error);

      // Handle duplicate key errors gracefully
      if (error.code === 11000) {
        console.log('Duplicate key error, fetching existing user');
        const [existingUser, hiltis, miners] = await Promise.all([
          this.userModel
            .findById(_id)
            .populate('miner_data.miner')
            .populate('hilti_data.hilti')
            .exec(),
          this.hiltiModel.find().lean().exec(),
          this.minerModel.find().lean().exec(),
        ]);

        return {
          user: existingUser,
          hiltis,
          miners,
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
            $inc: { 'balance_data.dust': DUST_REWARD },
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

  async getBalanceAfterAdReward(user_id: string) {
    try {
      const user = await this.userModel
        .findById(user_id)
        .select('balance_data.dust')
        .lean()
        .exec();
      if (!user) {
        throw new Error('User not found');
      }
      return user.balance_data.dust;
    } catch (error) {
      console.error('Error in getBalanceAfterAdReward service:', error);
      throw error;
    }
  }

  async stoneToDustExchange(user_id: string, stones: number) {
    if (stones <= 0) {
      throw new BadRequestException('Stones must be greater than 0');
    }
    try {
      const updatedBalance = await this.userModel
        .findByIdAndUpdate(
          {
            _id: user_id,
            'balance_data.stone': { $gte: stones },
          },
          {
            $inc: {
              'balance_data.dust': stones * 3,
              'balance_data.stone': -stones,
            },
          },
          { new: true },
        )
        .select('balance_data.dust balance_data.stone')
        .lean()
        .exec();
      if (!updatedBalance) {
        throw new NotFoundException('User not found or insufficient stones');
      }
      return updatedBalance;
    } catch (error) {
      console.error('Error in stoneToDustExchange service:', error);
      throw new InternalServerErrorException(
        'Error in stoneToDustExchange service',
      );
    }
  }

  async dustToStoneExchange(user_id: string, dust: number) {
    if (dust < 100 || dust % 100 !== 0) {
      throw new BadRequestException(
        'Dust must be greater than 100 and a multiple of 100',
      );
    }
    try {
      const updatedBalance = await this.userModel
        .findByIdAndUpdate(
          {
            _id: user_id,
            'balance_data.dust': { $gte: dust },
          },
          {
            $inc: {
              'balance_data.dust': -dust,
              'balance_data.stone': dust / 100,
            },
          },
          { new: true },
        )
        .select('balance_data.dust balance_data.stone')
        .lean()
        .exec();
      if (!updatedBalance) {
        throw new NotFoundException('User not found or insufficient dust');
      }
      return updatedBalance;
    } catch (error) {
      console.error('Error in dustToStoneExchange service:', error);
      throw new InternalServerErrorException(
        'Error in dustToStoneExchange service',
      );
    }
  }

  //! Mine Daily Stone Reward
  async mineDailyStoneReward(user_id: string) {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
      // --- ADIM 1: ÖN KONTROL (PRE-CHECK) ---
      // Gerekli hata mesajlarını verebilmek için önce kullanıcıyı
      // 'select' ile sadece gereken alanları çekerek (optimize) bul.
      const user = await this.userModel
        .findById(user_id)
        .select('miner_data.last_mine') // Sadece bu alana ihtiyacımız var
        .lean();

      // Senaryo 1: Kullanıcı hiç bulunamadı.
      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND');
      }

      // Senaryo 2: Kullanıcı bulundu ancak bekleme süresi (cooldown) henüz dolmamış.
      if (user.miner_data.last_mine > twentyFourHoursAgo) {
        const nextAvailableTime = new Date(
          user.miner_data.last_mine.getTime() + 24 * 60 * 60 * 1000,
        );

        // API'ye sadece bir string değil, detaylı bir obje dönmek daha iyidir.
        throw new BadRequestException({
          message: 'MINER_REWARD_NOT_READY_YET',
          next_available_at: nextAvailableTime.toISOString(),
        });
      }

      // --- ADIM 2: ATOMİK GÜNCELLEME (ATOMIC UPDATE) ---
      // Ön kontrolleri geçti. Şimdi asıl güncellemeyi 'aggregate' ile
      // atomik olarak yapıyoruz.
      // Buradaki $match, bir "çift tıklama" (race condition) anında
      // ikinci isteğin elenmesini garantileyen SON KİLİT görevi görür.
      await this.userModel
        .aggregate([
          {
            $match: {
              _id: user_id,
              'miner_data.last_mine': { $lt: twentyFourHoursAgo },
            },
          },
          {
            $lookup: {
              from: this.minerModel.collection.name,
              localField: 'miner_data.miner', //
              foreignField: '_id', //
              as: 'miner_doc',
            },
          },
          {
            $set: {
              miner_doc: { $arrayElemAt: ['$miner_doc', 0] },
            },
          },
          {
            $set: {
              'balance_data.stone': {
                //
                $add: [
                  { $ifNull: ['$balance_data.stone', 0] },
                  { $ifNull: ['$miner_doc.stones_income', 0] }, //
                ],
              },
              'miner_data.last_mine': now, //
            },
          },
          { $unset: 'miner_doc' },
          {
            $merge: {
              into: this.userModel.collection.name,
              on: '_id',
              whenMatched: 'replace',
              whenNotMatched: 'discard',
            },
          },
        ])
        .exec();

      // --- ADIM 3: BAŞARILI SONUCU DÖNDÜR ---
      // İşlem %100 başarılı oldu. Kullanıcıya güncel veriyi döndür.
      const updatedSnapshot = await this.userModel
        .findById(user_id)
        .select('balance_data.stone miner_data.last_mine')
        .lean()
        .exec();

      // updateSnapshot null olamaz çünkü en başta varlığını kontrol ettik.
      return updatedSnapshot;
    } catch (error) {
      // Bizim fırlattığımız (throw) bilinen hataları (NotFound, BadRequest) tekrar yakalama.
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Bilinmeyen, sistemsel bir hata oluştu (örn. DB bağlantı koptu).
      console.error('Unexpected error in mineDailyStoneReward:', error);
      throw new InternalServerErrorException('UNEXPECTED_SERVER_ERROR');
    }
  }
}
