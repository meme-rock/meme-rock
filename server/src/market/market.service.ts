import {
  BadRequestException,
  Injectable,
  Logger,
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
  loadStonePurchase,
  StonePurchase,
  storeStonePurchase,
} from './contract/PurchaseStone_PurchaseStone';
import { ETonPaymentStatus } from 'src/common/enums/ton-payments.enum';
import { HelpersService } from 'src/helpers/helpers.service';
import { EPaymentType } from 'src/common/enums/star-payload.enum';
import {
  EMarketItemType,
  MarketItem,
  MarketItemDocument,
} from 'src/schemas/market.schema';

@Injectable()
export class MarketService {
  private readonly CONTRACT_ADDRESS =
    process.env.PURCHASE_STONE_CONTRACT_ADDRESS;
  private readonly logger = new Logger(MarketService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly botService: BotService,
    @InjectModel(TonPayments.name)
    private tonPaymentsModel: Model<TonPaymentsDocument>,
    private readonly helpersService: HelpersService,
    @InjectModel(MarketItem.name)
    private marketItemModel: Model<MarketItemDocument>,
  ) {}

  async getStonesMarketData() {
    const market_items = await this.marketItemModel
      .find({
        type: EMarketItemType.STONE,
      })
      .sort({ stars_price: 1 }) // Küçükten büyüğe sıralamak her zaman iyidir
      .lean()
      .exec();

    return {
      // 1. Listeyi Star formatına dönüştür
      star_market: market_items.map((item) => ({
        stars_price: item.stars_price,
        stone_amount: item.stone_amount,
        stone_bonus: item.stone_bonus,
        total_stones: item.total_stones,
      })),

      // 2. Aynı listeyi Ton formatına dönüştür
      ton_market: market_items.map((item) => {
        // Önce değerleri hesapla ve küsurattan kurtul (Math.floor ile aşağı yuvarladım)
        // (item.stone_amount || 0) diyerek null riskini de sıfırlıyoruz.
        const baseAmount = Math.floor((item.stone_amount || 0) * 1.3);
        const bonusAmount = Math.floor((item.stone_bonus || 0) * 1.3);

        // Total'i bu iki yeni değerin toplamı olarak ver ki matematik her zaman tutsun
        const totalAmount = baseAmount + bonusAmount;

        return {
          ton_price: item.ton_price,
          stone_amount: baseAmount,
          stone_bonus: bonusAmount,
          total_stones: totalAmount, // DB'deki total'i çarpmak yerine, yenileri toplamak daha garantidir
        };
      }),
    };
  }

  async handleStarsPayment(user_id: string, amount: number): Promise<boolean> {
    try {
      const market_details = STONE_MARKET_STAR.find(
        (item: StarMarketItem) =>
          item.stars_price.toString() === amount.toString(),
      );
      if (!market_details) {
        return false;
      }

      //* Ödeme Başarılıysa
      const updatedUser = await this.userModel.findByIdAndUpdate(
        user_id,
        {
          $inc: {
            'balance_data.stone': market_details.total_stones,
          },
        },
        { new: true },
      );
      if (!updatedUser) {
        return false;
      }
      await this.botService.sendNotificationToUser(
        parseInt(user_id),
        [
          // NOT: statik "!" karakterlerini Telegram için kaçırıyoruz: \!
          '✅ *Payment Successful\\!*',
          '',
          // Dinamik değerleri inline code içine koyup yalnızca inline içindeki kaçışı yapıyoruz
          `*Deposit:* \`${this.helpersService.safeMarkdown(String(amount))} Stars\``,
          `*Stones:* \`${this.helpersService.safeMarkdown(String(market_details.total_stones))}\``,
          '',
          '🎉 Your balance has been *successfully updated\\!*',
          '_Please refresh the app to see the latest changes\\._',
        ].join('\n'),
      );
      return true;
    } catch (error) {
      this.logger.error('Error: ' + error);
      return false;
    }
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
    const lastAddress = Address.parse(wallet_address).toString({
      bounceable: true,
      testOnly: true,
    });

    const address = Address.parse(lastAddress);

    const realTonPrice = fromNano(ton_price);
    const amountNano = toNano(realTonPrice.toString());

    const message: StonePurchase = {
      $$type: 'StonePurchase',
      walletAddress: address,
      amount: BigInt(amountNano),
      userId: user_id,
      objectId: object_id,
    };

    const body = beginCell().store(storeStonePurchase(message)).endCell();
    return body.toBoc().toString('base64');
  }

  //! TON PAYMENTS
  async checkTonPayments() {
    try {
      // URL parametrelerini oluştur
      const params = new URLSearchParams({
        address: this.CONTRACT_ADDRESS!,
        limit: '2',
        api_key: process.env.TON_CENTER_API_KEY!,
      });
      // const url = `https://toncenter.com/api/v2/getTransactions?${params.toString()}`;
      const url = `https://testnet.toncenter.com/api/v2/getTransactions?${params.toString()}`;
      this.logger.log('URL: ' + url);
      const response = await fetch(url);
      const responseData = await response.json();
      if (!responseData.ok) {
        throw new BadRequestException('False response from TON Center');
      }
      const transactions = responseData.result;

      for (const transaction of transactions) {
        const in_msg = transaction.in_msg;
        const out_msgs = transaction.out_msgs;

        if (out_msgs.length > 0) {
          continue;
        }

        const payload = in_msg.msg_data.body;
        const decodedPayload = await this.decodeRawPayload(payload);
        if (decodedPayload.opCode != '0x98A3C5F1') {
          continue;
        }

        const { user_id, amount, payment_id } = decodedPayload.decodedData;
        const market_details = STONE_MARKET_TON.find(
          (item: TonMarketItem) =>
            item.ton_price.toString() === amount.toString(),
        );
        if (!market_details) {
          this.logger.error('Market details not found');
          continue;
        }
        const updatedPayment = await this.tonPaymentsModel.findOneAndUpdate(
          { _id: payment_id, status: ETonPaymentStatus.PENDING },
          {
            $set: {
              status: ETonPaymentStatus.CONFIRMED,
              expires_at: null,
            },
          },
          { new: true },
        );
        if (!updatedPayment) {
          continue;
        }
        const updatedUser = await this.userModel.findByIdAndUpdate(
          user_id,
          {
            $inc: {
              'game_data.stones': market_details.total_stones,
            },
          },
          { new: true },
        );
        if (!updatedUser) {
          this.logger.error('User not found');
          continue;
        }
        console.log('payment found...');
        await this.botService.sendNotificationToUser(
          user_id,
          [
            // NOT: statik "!" karakterlerini Telegram için kaçırıyoruz: \!
            '✅ *Payment Successful\\!*',
            '',
            // Dinamik değerleri inline code içine koyup yalnızca inline içindeki kaçışı yapıyoruz
            `*Deposit:* \`${this.helpersService.safeMarkdown(String(amount))} TON\``,
            `*Stones:* \`${this.helpersService.safeMarkdown(String(market_details.total_stones))}\``,
            '',
            '🎉 Your balance has been *successfully updated\\!*',
            '_Please refresh the app to see the latest changes\\._',
          ].join('\n'),
        );
      }

      return transactions;
      return {
        success: true,
        message: 'Ton payments checked successfully',
      };
    } catch (error) {
      this.logger.error('Error: ' + error);
      throw new BadRequestException('Error checking ton payments');
    }
  }

  async decoder(payload: string) {
    try {
      // 1. Base64 dizesini Cell objesine dönüştürme
      const cell = Cell.fromBase64(payload);

      // 2. Cell'i okumak için Slice objesine dönüştürme
      const slice = cell.beginParse();

      // 3. loadStonePurchase fonksiyonunu kullanarak veriyi çözme
      const decodedMessage = loadStonePurchase(slice);
      // 4. Address'i string'e çevirip, bigint'i string'e çevirerek JSON-serializable hale getirme
      return {
        type: decodedMessage.$$type,
        wallet_address: decodedMessage.walletAddress.toString({
          bounceable: false,
          testOnly: true,
        }), // Address'i string'e çevir
        amount: fromNano(decodedMessage.amount), // bigint'i string'e çevir
        user_id: decodedMessage.userId,
        payment_id: decodedMessage.objectId,
      };
    } catch (e) {
      console.error('Payload çözümleme hatası:', e);
      throw new Error(`Invalid payload format. Error: ${e.message}`);
    }
  }
  async decodeRawPayload(payload: string) {
    try {
      // Base64 BOC'u hex formatına çevir
      const hexRawBody = Buffer.from(payload, 'base64').toString('hex');

      // Base64 BOC'u Cell'e parse et
      const cell = Cell.fromBase64(payload);
      const slice = cell.beginParse();

      // Op code'u oku (ilk 32 bit)
      const opCode = slice.loadUint(32);

      // Eğer bu bizim StonePurchase op code'umuzsa decode et
      let decodedData: any = null;
      if (opCode != 2560869873) {
        return {
          error: 'Op code tanınmadı',
          payload: payload,
        };
      }
      const stonePurchase = await this.decoder(payload);
      decodedData = stonePurchase;
      return {
        opCode: '0x' + opCode.toString(16).toUpperCase(),
        decodedData,
        message: decodedData
          ? 'Payload başarıyla decode edildi'
          : 'Op code tanınmadı, sadece hex gösteriliyor',
      };
    } catch (error) {
      return {
        error: error.message,
        payload: payload,
      };
    }
  }
}
