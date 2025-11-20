import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BotService } from 'src/bot/bot.service';
import { EBoosterUnlockCurrencyType } from 'src/common/enums/boosters.enum';
import { EPaymentType } from 'src/common/enums/star-payload.enum';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BoosterDocument } from 'src/schemas/booster.schema';
import { Booster } from 'src/schemas/booster.schema';
import { HelpersService } from 'src/helpers/helpers.service';
import {
  EMarketItemType,
  MarketItem,
  MarketItemDocument,
} from 'src/schemas/market.schema';
@Injectable()
export class StarService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Booster.name) private boosterModel: Model<BoosterDocument>,
    @InjectModel(MarketItem.name)
    private marketItemModel: Model<MarketItemDocument>,
    private readonly helpersService: HelpersService,
    private readonly botService: BotService,
  ) {}

  async purchaseBooster(user_id: string, booster_id: string) {
    try {
      const user = await this.userModel.findById(user_id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const booster = await this.boosterModel.findById(booster_id).lean();
      console.log('booster: ', booster);
      if (!booster) {
        throw new NotFoundException('Booster not found');
      }
      const stars_price = booster.unlock_options.find(
        (opt) => opt.type === EBoosterUnlockCurrencyType.STAR,
      )?.amount;
      if (!stars_price) {
        throw new BadRequestException('Booster requires stars to be purchased');
      }
      const payload = JSON.stringify({
        payment_type: EPaymentType.BOOSTER,
        user_id: user_id,
        stars_price: stars_price,
        booster_title: booster.title,
        booster_id: booster_id,
      });
      const prices = [
        {
          label: `${stars_price} Stars`,
          amount: stars_price,
        },
      ];
      const invoice_link = await this.botService.createInvoiceLink(
        `${booster.title} Booster`,
        `Purchase for ${booster.title} Booster for ${stars_price} Stars`,
        payload,
        '',
        prices,
      );
      if (!invoice_link) {
        throw new BadRequestException('Invoice link could not be created');
      }
      return {
        invoice_link: invoice_link,
      };
    } catch (error) {
      console.error('Error in purchaseBoosterWithStars:', error);
      throw error;
    }
  }

  async purchaseStones(user_id: string, stars_price: number) {
    try {
      const user = await this.userModel.findById(user_id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const star_market_items = await this.marketItemModel
        .find(
          {
            type: EMarketItemType.STONE,
          },
          {
            stars_price: 1,
            stone_amount: 1,
            stone_bonus: 1,
            total_stones: 1,
            _id: 0,
          },
        )
        .sort({ stars_price: 1 }) // Küçükten büyüğe sıralamak her zaman iyidir
        .lean()
        .exec();
      console.log('star_market_items: ', star_market_items);
      const market_details = star_market_items.find(
        (item: MarketItem) => item.stars_price === stars_price,
      );
      if (!market_details) {
        throw new NotFoundException('Market details not found');
      }
      const payload = JSON.stringify({
        payment_type: EPaymentType.STONE,
        user_id: user_id,
        stars_price: stars_price,
        stone_amount: market_details.stone_amount,
        stone_bonus: market_details.stone_bonus,
        total_stones: market_details.total_stones,
      });
      const prices = [
        {
          label: `${market_details.total_stones} Stones`,
          amount: market_details.stars_price,
        },
      ];
      const invoice_link = await this.botService.createInvoiceLink(
        `${market_details.total_stones} Stones`,
        `Purchase for ${market_details.total_stones} Stones for ${market_details.stars_price} Stars`,
        payload,
        '',
        prices,
      );
      if (!invoice_link) {
        throw new BadRequestException('Invoice link could not be created');
      }
      return {
        invoice_link: invoice_link,
      };
    } catch (error) {
      console.error('Error in purchaseStones:', error);
      throw new BadRequestException('Error creating invoice link');
    }
  }

  async purchasePremium(user_id: string) {
    try {
      const user = await this.userModel.findById(user_id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const premium_data = await this.marketItemModel
        .findOne(
          {
            type: EMarketItemType.PREMIUM,
          },
          {
            stars_price: 1,
            _id: 0,
          },
        )
        .lean()
        .exec();
      if (!premium_data) {
        throw new NotFoundException('Premium data not found');
      }
      console.log('premium_data: ', premium_data);
      const payload = JSON.stringify({
        payment_type: EPaymentType.PREMIUM,
        user_id: user_id,
        stars_price: premium_data.stars_price,
      });
      const prices = [
        {
          label: `Premium Pass Season 1`,
          amount: premium_data.stars_price,
        },
      ];
      const invoice_link = await this.botService.createInvoiceLink(
        `Premium Pass Season 1`,
        `Purchase for Premium Pass Season 1 for ${premium_data.stars_price} Stars`,
        payload,
        '',
        prices,
      );
      if (!invoice_link) {
        throw new BadRequestException('Invoice link could not be created');
      }
      return {
        invoice_link: invoice_link,
      };
    } catch (error) {
      console.error('Error in purchasePremium:', error);
      throw new BadRequestException('Error creating invoice link');
    }
  }
  async givePremiumToUser(
    user_id: string,
    payment_amount: number,
  ): Promise<boolean> {
    try {
      console.log('givePremiumToUser started');
      const [updatedUser, premium_price] = await Promise.all([
        await this.userModel
          .findOneAndUpdate(
            {
              _id: user_id,
              is_premium: false, // Kullanıcı Premium değilse
            },
            {
              $set: {
                is_premium: true, // Premium yap
              },
            },
            {
              new: true, // Güncellenmiş dokümanı döndür
              select: { is_premium: 1, _id: 0 }, // <-- Projection'ı options objesi içine select olarak ekledik
            },
          )
          .lean()
          .exec(),
        await this.marketItemModel
          .findOne(
            {
              type: EMarketItemType.PREMIUM,
            },
            {
              stars_price: 1,
              _id: 0,
            },
          )
          .lean()
          .exec(),
      ]);
      if (
        !updatedUser ||
        !premium_price ||
        premium_price.stars_price !== payment_amount
      ) {
        return false;
      }
      await this.botService.sendNotificationToUser(
        parseInt(user_id),
        [
          // NOT: statik "!" karakterlerini Telegram için kaçırıyoruz: \!
          '✅ *Payment Successful\\!*',
          '',
          // Dinamik değerleri inline code içine koyup yalnızca inline içindeki kaçışı yapıyoruz
          `*Deposit:* \`${this.helpersService.safeMarkdown(String(payment_amount))} Stars\``,
          `*Premium Pass:* \`${this.helpersService.safeMarkdown(String(premium_price.stars_price))} Stars\``,
          '',
          '🎉 Your premium has been *successfully updated\\!*',
          '_Please refresh the app to see the latest changes\\._',
        ].join('\n'),
      );
      return true;
    } catch (error) {
      console.error('Error in givePremiumToUser:', error);
      throw new BadRequestException('Error giving premium to user');
    }
  }
}
