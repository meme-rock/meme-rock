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
import { EMinerLevel, EMinerRewardType } from 'src/common/enums/miners.enum';
import { EHiltiLevel } from 'src/common/enums/hiltis.enum';
import { Hilti, HiltiDocument } from 'src/schemas/hilti.schema';
import { Booster, BoosterDocument } from 'src/schemas/booster.schema';
import { ACHIEVEMENTS_CONFIG } from 'src/common/achievements.config';
import { ACHIVEMENTS } from 'src/common/config';
import { UserAchivementService } from './user-achivement.service';

@Injectable()
export class UserService {
  private readonly MINING_COOLDOWN_MS = 1 * 60 * 60 * 1000; // 1 Saat
  // Test için 15 saniye:
  // private readonly MINING_COOLDOWN_MS = 15 * 1000;

  // Offline toplanabilecek maksimum periyot sayıları
  private readonly MAX_CLAIMS_STANDARD = 2; // 2 periyot (örn. 2 saat)
  private readonly MAX_CLAIMS_AUTO_MINING = 6; // 6 periyot (örn. 6 saat)
  private readonly MAX_CLAIMS_PREMIUM = 24; // 24 periyot (örn. 24 saat)
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Miner.name) private minerModel: Model<MinerDocument>,
    @InjectModel(Hilti.name) private hiltiModel: Model<HiltiDocument>,
    @InjectModel(Booster.name) private boosterModel: Model<BoosterDocument>,
    private userAchivementService: UserAchivementService,
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

  //! Mine On Loading Service
  async mineOnLoading(_id: string) {
    try {
      // 1. Kullanıcıyı ve miner bilgilerini getir (sadece gerekli alanlar)
      const user = await this.userModel
        .findById(_id)
        .populate<{
          miner_data: { last_mine: Date; miner: MinerDocument };
        }>('miner_data.miner')
        .select(
          'miner_data.last_mine miner_data.miner is_premium is_auto_mining balance_data.stone balance_data.dust',
        )
        .exec();

      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND');
      }

      const miner = user.miner_data.miner;
      const reward_type = miner.reward_type;

      // Veri tutarsızlığı kontrolü
      if (!miner || typeof miner.profit_per_hour === 'undefined') {
        console.error(`Inconsistent data: User ${_id} has missing miner data.`);
        throw new InternalServerErrorException('MINER_DATA_NOT_FOUND');
      }

      // 2. Zaman hesaplamaları
      const now = Date.now();
      const lastMineTime = new Date(user.miner_data.last_mine).getTime();
      const elapsedMilliseconds = now - lastMineTime;

      // Eğer 1 periyot (1 saat) bile dolmadıysa, hiçbir şey yapma
      if (elapsedMilliseconds < this.MINING_COOLDOWN_MS) {
        return {
          success: true,
          claimed_reward: 0,
          reward_type: reward_type,
          periods_claimed: 0,
          message: 'NOT_ENOUGH_TIME_PASSED',
        };
      }

      // 3. Kaç periyot geçtiğini hesapla
      const elapsedPeriods = Math.floor(
        elapsedMilliseconds / this.MINING_COOLDOWN_MS,
      );

      // 4. Maksimum toplanabilecek periyot sayısını belirle
      // Öncelik sırası: is_premium > is_auto_mining > standard
      let maxClaimablePeriods: number;

      if (user.is_premium) {
        // Premium kullanıcı: is_auto_mining durumu önemli değil, her zaman 24
        maxClaimablePeriods = this.MAX_CLAIMS_PREMIUM;
      } else if (user.is_auto_mining) {
        // Auto-mining aktif ama premium değil: 6 periyot
        maxClaimablePeriods = this.MAX_CLAIMS_AUTO_MINING;
      } else {
        // Normal kullanıcı: 2 periyot
        maxClaimablePeriods = this.MAX_CLAIMS_STANDARD;
      }

      // 5. Toplanacak periyot sayısını hesapla (minimum: geçen periyot vs max limit)
      const periodsToClaimCalculated = Math.min(
        elapsedPeriods,
        maxClaimablePeriods,
      );

      // 6. Hiç toplanacak şey yoksa erken dön
      if (periodsToClaimCalculated === 0) {
        return {
          success: true,
          claimed_reward: 0,
          reward_type: reward_type,
          periods_claimed: 0,
          message: 'NO_PERIODS_TO_CLAIM',
        };
      }

      // 7. Toplam ödül hesapla
      const totalReward = periodsToClaimCalculated * miner.profit_per_hour;

      // 8. last_mine zamanını güncelle
      // Sadece toplanan periyotlar kadar geriye git (kalan periyotları korumak için)
      const newLastMineTime = new Date(
        lastMineTime + periodsToClaimCalculated * this.MINING_COOLDOWN_MS,
      );

      // 9. Atomik güncelleme: reward ekle (stone veya dust) ve last_mine'ı güncelle
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          _id,
          {
            $inc: {
              [`balance_data.${reward_type.toLowerCase()}`]: totalReward,
            },
            $set: { 'miner_data.last_mine': newLastMineTime },
          },
          {
            new: true,
            select: 'balance_data.stone balance_data.dust miner_data.last_mine',
          },
        )
        .exec();

      if (!updatedUser) {
        throw new InternalServerErrorException('FAILED_TO_UPDATE_USER');
      }

      console.log(
        `✅ Loading: User ${_id} claimed ${totalReward} ${reward_type} (${periodsToClaimCalculated} periods, max: ${maxClaimablePeriods})`,
      );

      return {
        success: true,
        claimed_reward: totalReward,
        reward_type: reward_type,
        periods_claimed: periodsToClaimCalculated,
        new_stone_balance: updatedUser.balance_data.stone,
        new_dust_balance: updatedUser.balance_data.dust,
        new_last_mine: updatedUser.miner_data.last_mine,
        message: 'REWARD_CLAIMED_SUCCESSFULLY',
      };
    } catch (error) {
      // Bilinen hataları olduğu gibi fırlat
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Beklenmedik hatalar
      console.error('Error in mineOnLoading service:', error);
      throw new InternalServerErrorException('UNEXPECTED_SERVER_ERROR');
    }
  }

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

        if (!populatedUser) {
          throw new Error('Failed to create user');
        }

        // Get merged achievements with claim status
        const mergedAchievements =
          this.userAchivementService.returnMergedAchivements(populatedUser);

        console.log('New user created:', _id);
        return {
          user: populatedUser,
          hiltis,
          miners,
          achievements: mergedAchievements,
          message: 'User created successfully',
        };
      }

      // Existing user - calculate and claim pending rocks and stones
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

      // Log claim details for rocks
      const elapsedMinutes = (
        (Date.now() - new Date(lastClaim).getTime()) /
        (1000 * 60)
      ).toFixed(2);

      console.log(
        `User ${_id} claimed ${pendingRocks.toFixed(2)} rocks (${elapsedMinutes} minutes elapsed)`,
      );

      // Call mineOnLoading to claim pending rewards (stone/dust) from miner
      try {
        const mineClaimResult = await this.mineOnLoading(_id);
        console.log(
          `User ${_id} mine claim result:`,
          mineClaimResult.message,
          `(${mineClaimResult.claimed_reward} ${mineClaimResult.reward_type})`,
        );
      } catch (mineError) {
        // Mine claim hatası kritik değil, loading işlemini engellemez
        console.warn(
          `Warning: Mine claim failed for user ${_id}:`,
          mineError.message,
        );
      }

      // Final user data'yı tekrar getir (mine claim sonrası güncel data için)
      const finalUser = await this.userModel
        .findById(_id)
        .populate('miner_data.miner')
        .populate('hilti_data.hilti')
        .exec();

      if (!finalUser) {
        throw new Error('User not found after update');
      }

      // Get merged achievements with claim status
      const mergedAchievements =
        this.userAchivementService.returnMergedAchivements(finalUser);

      return {
        user: finalUser,
        hiltis,
        miners,
        achievements: mergedAchievements,
        message: 'User updated successfully',
      };
    } catch (error) {
      console.error('Error in loading service:', error);
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

  //! Daily Reward
  async claimDailyReward(user_id: string) {
    try {
      // Reset date is 7 AM UTC
      const resetDate = new Date(
        new Date().toUTCString().split(' ')[0] + 'T07:00:00Z',
      );

      // Get user
      const user = await this.userModel
        .findById(user_id)
        .select('daily_reward_data')
        .lean()
        .exec();

      // If user not found, throw error
      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND');
      }

      // If last claim date is before 48 hours ago, reset the daily reward data
      if (
        user.daily_reward_data.last_claim_date <
        new Date(Date.now() - 48 * 60 * 60 * 1000)
      ) {
        user.daily_reward_data.day = 0;
        user.daily_reward_data.last_claim_date = new Date();
      } else {
        user.daily_reward_data.day++;
      }

      // Save user
      await user.save();
    } catch (error) {
      console.error('Error in claimDailyReward service:', error);
      throw new InternalServerErrorException('UNEXPECTED_SERVER_ERROR');
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
                  { $ifNull: ['$miner_doc.profit_per_hour', 0] }, //
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

  //! Mine (Stone or Dust)
  async mine(user_id: string) {
    const now = new Date();
    // 1 saatlik bekleme süresini milisaniye cinsinden tanımlayalım
    const MINING_COOLDOWN_MS = 1 * 60 * 60 * 1000;
    // 1 saat öncesinin tam zamanı
    const oneHourAgo = new Date(now.getTime() - MINING_COOLDOWN_MS);

    try {
      // 1. ADIM: Kullanıcının hangi miner'a sahip olduğunu ve ödül miktarını öğren.
      // Bu bilgiyi atomik güncelleme için kullanacağız.
      // Sadece gerekli alanları seçerek (select) sorguyu hızlandırıyoruz.
      const userForMiner = await this.userModel
        .findById(user_id)
        .select('miner_data.miner') // Sadece miner'ın ID'sine ihtiyacımız var
        .lean()
        .exec();

      if (!userForMiner) {
        throw new NotFoundException('USER_NOT_FOUND');
      }

      // 2. ADIM: Miner'ın saatlik kârını ve reward_type'ı al.
      const miner = await this.minerModel
        .findById(userForMiner.miner_data.miner)
        .select('profit_per_hour reward_type') // Kâr ve reward type'a ihtiyacımız var
        .lean()
        .exec();

      // Bu bir tutarsızlık durumudur, kullanıcının sahip olduğu miner DB'de yoksa.
      if (!miner) {
        console.error(
          `Inconsistent data: User ${user_id} has non-existent miner ${userForMiner.miner_data.miner}`,
        );
        throw new InternalServerErrorException('MINER_DATA_NOT_FOUND');
      }

      const profitAmount = miner.profit_per_hour;
      const reward_type = miner.reward_type;

      // 3. ADIM: ATOMİK GÜNCELLEME
      // findOneAndUpdate kullanarak hem şartı kontrol et (1 saat geçti mi?)
      // hem de güncellemeyi (ödülü ekle, zamanı sıfırla) tek bir işlemde yap.
      const updatedUser = await this.userModel
        .findOneAndUpdate(
          {
            _id: user_id,
            'miner_data.last_mine': { $lte: oneHourAgo }, // ŞART: Son toplama 1 saat önceden ESKİ veya EŞİTSE
          },
          {
            $set: { 'miner_data.last_mine': now }, // Güncelle: Son toplama zamanını 'şimdi' yap
            $inc: {
              [`balance_data.${reward_type.toLowerCase()}`]: profitAmount,
            }, // Güncelle: Bakiyeye reward'ı ekle (stone veya dust)
          },
          {
            new: true, // Metodun, belgenin güncellenmiş halini döndürmesini sağla
            select: 'balance_data.stone balance_data.dust miner_data.last_mine', // Sadece bu yeni değerleri döndür
          },
        )
        .exec();

      // 4. ADIM: Sonucu Değerlendir
      if (!updatedUser) {
        // Eğer updatedUser 'null' dönerse, bu demektir ki kullanıcı bulundu
        // ANCAK 'miner_data.last_mine' şartı ($lte: oneHourAgo) sağlanmadı.
        // Yani, kullanıcı toplamak için çok erken davrandı.
        throw new BadRequestException('MINER_REWARD_NOT_READY_YET');
      }

      // 5. ADIM: Başarılı yanıtı döndür
      return {
        success: true,
        reward_type: reward_type,
        claimed_reward: profitAmount,
        new_stone_balance: updatedUser.balance_data.stone,
        new_dust_balance: updatedUser.balance_data.dust,
        last_mine: updatedUser.miner_data.last_mine,
        // Bir sonraki toplama için kalan süre her zaman 1 saattir (saniye cinsinden)
        remaining_time_seconds: Math.ceil(MINING_COOLDOWN_MS / 1000), // 3600
      };
    } catch (error) {
      // Eğer hata bizim tarafımızdan (NotFound, BadRequest) atıldıysa, onu olduğu gibi yolla
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Diğer beklenmedik hataları logla ve genel bir hata dön
      console.error('Error in mine service:', error);
      throw new InternalServerErrorException('UNEXPECTED_SERVER_ERROR');
    }
  }
}
