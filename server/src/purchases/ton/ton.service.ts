import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EMarketItemType,
  MarketItem,
  MarketItemDocument,
} from 'src/schemas/market.schema';
import {
  TonPayments,
  TonPaymentsDocument,
} from 'src/schemas/ton-payments.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Booster, BoosterDocument } from 'src/schemas/booster.schema';
import { ETonPaymentType } from 'src/common/enums/ton-payments.enum';
import { EBoosterUnlockCurrencyType } from 'src/common/enums/boosters.enum';
import { toNano, beginCell } from '@ton/core';

@Injectable()
export class TonService {
  private readonly CONTRACT_ADDRESS = process.env.TON_CONTRACT_ADDRESS;
  constructor(
    @InjectModel(TonPayments.name)
    private tonPaymentsModel: Model<TonPaymentsDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(MarketItem.name)
    private marketItemModel: Model<MarketItemDocument>,
    @InjectModel(Booster.name)
    private boosterModel: Model<BoosterDocument>,
  ) {}

  async purchaseBooster(
    user_id: string,
    booster_id: string,
    wallet_address: string,
  ) {
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
      const ton_price = booster.unlock_options.find(
        (opt) => opt.type === EBoosterUnlockCurrencyType.TON,
      )?.amount;
      if (!ton_price) {
        throw new BadRequestException('Booster requires TON to be purchased');
      }
      const bill = await this.createBill(
        user_id,
        ETonPaymentType.BOOSTER,
        booster_id,
        ton_price,
        wallet_address,
      );
      if (!bill) {
        throw new BadRequestException('Error creating bill');
      }
      return this.createTransaction(ton_price, bill._id.toString());
    } catch (error) {
      console.log('Error: ', error);
      throw new BadRequestException('Error purchasing booster');
    }
  }

  async purchaseStones(
    user_id: string,
    stones_amount: number,
    wallet_address: string,
  ) {
    try {
      const user = await this.userModel.findById(user_id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const ton_market_items = await this.marketItemModel
        .find(
          {
            type: EMarketItemType.STONE,
          },
          {
            ton_price: 1,
            stone_amount: 1,
            stone_bonus: 1,
            total_stones: 1,
          },
        )
        .sort({ ton_price: 1 }) // Küçükten büyüğe sıralamak her zaman iyidir
        .lean()
        .exec();
      if (!ton_market_items) {
        throw new NotFoundException('Market items not found');
      }
      const market_details = ton_market_items.find(
        (item: MarketItem) => item.ton_price === stones_amount,
      );
      if (!market_details) {
        throw new NotFoundException('Market details not found');
      }
      console.log(market_details);
      const bill = await this.createBill(
        user_id,
        ETonPaymentType.STONE,
        market_details._id.toString(),
        market_details.ton_price,
        wallet_address,
      );
      if (!bill) {
        throw new BadRequestException('Error creating bill');
      }
      return this.createTransaction(
        market_details.ton_price,
        bill._id.toString(),
      );
    } catch (error) {
      console.log('Error: ', error);
      throw new BadRequestException('Error purchasing stones');
    }
  }

  async purchasePremium(user_id: string, wallet_address: string) {
    try {
      const user = await this.userModel
        .findOne({ _id: user_id, is_premium: false })
        .lean();
      if (!user) {
        throw new NotFoundException(
          'User not found or already purchased premium',
        );
      }
      const premium_data = await this.marketItemModel
        .findOne({ type: EMarketItemType.PREMIUM })
        .lean();
      if (!premium_data) {
        throw new NotFoundException('Premium data not found');
      }
      const bill = await this.createBill(
        user_id,
        ETonPaymentType.PREMIUM,
        premium_data._id.toString(),
        premium_data.ton_price,
        wallet_address,
      );
      if (!bill) {
        throw new BadRequestException('Error creating bill');
      }
      return this.createTransaction(
        premium_data.ton_price,
        bill._id.toString(),
      );
    } catch (error) {
      console.log('Error: ', error);
      throw new BadRequestException('Error purchasing premium');
    }
  }

  //! private methods
  private async createBill(
    user_id: string,
    payment_type: ETonPaymentType,
    item_id: string,
    ton_amount: number,
    wallet_address: string,
  ): Promise<TonPaymentsDocument> {
    try {
      const bill = await this.tonPaymentsModel.create({
        user_id,
        payment_type,
        item_id,
        ton_amount,
        wallet_address,
      });
      return bill;
    } catch (error) {
      console.log('Error: ', error);
      throw new BadRequestException('Error creating bill');
    }
  }

  private async createTransaction(ton_price: number, payment_id: string) {
    try {
      const priceNano = toNano(ton_price);
      const payload = await this.preparePayload(payment_id);
      const transactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 dakika geçerlilik süresi
        messages: [
          {
            address: this.CONTRACT_ADDRESS,
            amount: priceNano.toString(),
            payload: payload,
          },
        ],
      };
      return transactionRequest;
    } catch (error) {}
  }

  private async preparePayload(payment_id: string) {
    try {
      const body = beginCell()
        .storeUint(0, 32)
        .storeStringTail(payment_id)
        .endCell();
      return body.toBoc().toString('base64');
    } catch (error) {
      console.log('Error: ', error);
      throw new BadRequestException('Error preparing payload');
    }
  }
}
