import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BotService } from 'src/bot/bot.service';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import {
  STONE_MARKET_STAR,
  STONE_MARKET_TON,
  StarMarketItem,
  TonMarketItem,
} from 'src/common/config';
import {
  TonPayments,
  TonPaymentsDocument,
} from 'src/schemas/ton-payments.schema';
import { Address, toNano, beginCell, Cell, fromNano } from '@ton/core';
import {
  StonePurchase,
  storeStonePurchase,
} from './contract/PurchaseStone_PurchaseStone';

@Injectable()
export class MarketService {
  private readonly CONTRACT_ADDRESS =
    process.env.PURCHASE_STONE_CONTRACT_ADDRESS;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly botService: BotService,
    @InjectModel(TonPayments.name)
    private tonPaymentsModel: Model<TonPaymentsDocument>,
  ) {}

  async getStonesMarketData() {
    return {
      star_market: STONE_MARKET_STAR,
      ton_market: STONE_MARKET_TON,
    };
  }
  async createPaymentWithStarsLink(user_id: string, stars_price: number) {
    const user = await this.userModel.findById(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const market_details = STONE_MARKET_STAR.find(
      (item: StarMarketItem) => item.stars_price === stars_price,
    );
    if (!market_details) {
      throw new NotFoundException('Market details not found');
    }
    const payload = JSON.stringify({
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
  }

  //! TON SERVICE

  //? Create link payment with TON
  async createPaymentWithTonLink(
    user_id: string,
    stone_amount: number,
    wallet_address: string,
  ) {
    const market_details = STONE_MARKET_TON.find(
      (item: TonMarketItem) => item.total_stones === stone_amount,
    );
    if (!market_details) {
      throw new NotFoundException('Market details not found');
    }
    const dbTonPayment = await this.tonPaymentsModel.create({
      stone_amount: market_details.total_stones,
      ton_amount: market_details.ton_price,
      wallet_address: wallet_address,
      user_id: user_id,
    });

    return this.prepareTonTransaction(
      wallet_address,
      market_details.ton_price.toString(),
      dbTonPayment._id.toString(),
      user_id,
    );
  }

  prepareTonTransaction(
    wallet_address: string,
    ton_price: string,
    object_id: string,
    user_id: string,
  ) {
    const priceNano = toNano(ton_price);
    const payload = this.prepareTonPayload(
      wallet_address,
      priceNano.toString(),
      object_id,
      user_id,
    );
    const transactionRequest = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 dakika geçerlilik süresi
      messages: [
        {
          address: this.CONTRACT_ADDRESS,
          amount: priceNano.toString(), // NanoTON string
          payload: payload,
        },
      ],
    };

    return transactionRequest;
  }

  prepareTonPayload(
    wallet_address: string,
    ton_price: string,
    object_id: string,
    user_id: string,
  ) {
    const address = Address.parse(wallet_address);
    const amountNano = toNano(ton_price);

    const message: StonePurchase = {
      $$type: 'StonePurchase',
      walletAddress: address,
      amount: amountNano,
      userId: user_id,
      objectId: object_id,
    };

    const body = beginCell().store(storeStonePurchase(message)).endCell();
    return body.toBoc().toString('base64');
  }
}
