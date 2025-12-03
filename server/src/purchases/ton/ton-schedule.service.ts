import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { fromNano } from '@ton/core';
import { isValidObjectId, Model } from 'mongoose';
import { BotService } from 'src/bot/bot.service';
import { ETonPaymentType } from 'src/common/enums/ton-payments.enum';
import { Booster, BoosterDocument } from 'src/schemas/booster.schema';
import { MarketItem, MarketItemDocument } from 'src/schemas/market.schema';
import {
  TonPayments,
  TonPaymentsDocument,
} from 'src/schemas/ton-payments.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { HelpersService } from 'src/helpers/helpers.service';

@Injectable()
export class TonScheduleService {
  private readonly CONTRACT_ADDRESS = process.env.TON_CONTRACT_ADDRESS;
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(TonPayments.name)
    private tonPaymentsModel: Model<TonPaymentsDocument>,
    @InjectModel(MarketItem.name)
    private marketItemModel: Model<MarketItemDocument>,
    @InjectModel(Booster.name)
    private boosterModel: Model<BoosterDocument>,

    private readonly botService: BotService,
    private readonly helpersService: HelpersService,
  ) {}

  async checkTonPayments() {
    try {
      const params = new URLSearchParams({
        address: this.CONTRACT_ADDRESS!,
        limit: '10',
        api_key: process.env.TON_CENTER_API_KEY!,
      });
      const url = `https://testnet.toncenter.com/api/v2/getTransactions?${params.toString()}`;
      console.log('URL: ' + url);
      const response = await fetch(url);
      const responseData = await response.json();
      if (!responseData.ok) {
        throw new BadRequestException('False response from TON Center');
      }
      const transactions = responseData.result;

      for (const transaction of transactions) {
        const in_msg = transaction.in_msg;
        if (!in_msg || !in_msg.value) continue;

        const out_msgs = transaction.out_msgs;
        if (out_msgs.length > 0) {
          continue;
        }
        const bill_id = in_msg.message;
        if (!bill_id || !isValidObjectId(bill_id)) {
          // Normal bir transfer olabilir ama bizim bill_id formatımızda değil
          continue;
        }
        const txHash = transaction.transaction_id.hash;
        const value = fromNano(in_msg.value);
        console.log('Value: ' + value);

        console.log('Bill ID: ' + bill_id);
        await this.processPayment(
          bill_id,
          txHash,
          parseFloat(value.toString()),
        );
      }

      return transactions;
    } catch (error) {}
  }

  private async processPayment(bill_id: string, txHash: string, value: number) {
    try {
      const payment = await this.tonPaymentsModel.findOne({
        _id: bill_id,
        is_confirmed: false,
      });

      if (!payment) return;

      if (value < payment.ton_amount) {
        return;
      }

      console.log('Processing payment:', payment._id, payment.payment_type);
      await this.botService.sendNotificationToUser(
        Number(payment.user_id),
        [
          // NOT: statik "!" karakterlerini Telegram için kaçırıyoruz: \!
          '✅ *Payment Successful\\!*',
          '',
          // Dinamik değerleri inline code içine koyup yalnızca inline içindeki kaçışı yapıyoruz
          `*Deposit:* \`${this.helpersService.safeMarkdown(String(value))} TON\``,
          `*Payment Type:* \`${this.helpersService.safeMarkdown(String(payment.payment_type))}\``,
          '',
          'Your payment has been *successfully processed\\!*',
          '_Please refresh the app to see the latest changes\\._',
        ].join('\n'),
      );
      let ok = false;
      switch (payment.payment_type) {
        case ETonPaymentType.STONE:
          ok = await this.processStonePayment(payment);
          break;
        case ETonPaymentType.BOOSTER:
          ok = await this.processBoosterPayment(payment);
          break;
        case ETonPaymentType.PREMIUM:
          ok = await this.processPremiumPayment(payment);
          break;
        default:
          return;
      }

      await this.tonPaymentsModel.updateOne(
        { _id: bill_id, is_confirmed: false },
        {
          $set: {
            tx_hash: txHash,
            is_confirmed: true,
            expires_at: null,
          },
        },
      );
    } catch (error) {}
  }

  private async processStonePayment(
    payment: TonPaymentsDocument,
  ): Promise<boolean> {
    try {
      const [user, marketItem] = await Promise.all([
        this.userModel.findById(payment.user_id),
        this.marketItemModel.findById(payment.item_id).lean(),
      ]);

      if (!marketItem || !user) return false;

      const baseAmount = Math.floor((marketItem.stone_amount || 0) * 1.3);
      const bonusAmount = Math.floor((marketItem.stone_bonus || 0) * 1.3);
      const totalAmount = baseAmount + bonusAmount;

      const updated = await this.userModel.updateOne(
        { _id: user._id },
        { $inc: { 'balance_data.stone': totalAmount } },
      );

      if (!updated.modifiedCount) return false;

      await this.botService.sendNotificationToUser(
        Number(payment.user_id),
        `You have received ${totalAmount} stones`,
      );
      return true;
    } catch (error) {
      console.error('Error processing stone payment: ' + error);
      return false;
    }
  }

  private async processBoosterPayment(
    payment: TonPaymentsDocument,
  ): Promise<boolean> {
    try {
      const [user, booster] = await Promise.all([
        this.userModel.findById(payment.user_id),
        this.boosterModel.findById(payment.item_id),
      ]);
      if (!booster || !user) return false;
      const levelOneProfit = booster.level_data?.[0]?.profit_per_hour || 0;

      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: user._id, 'boosters.booster': { $nin: [booster._id] } },
        {
          $push: {
            boosters: {
              booster: booster._id,
              current_level: 1,
            },
          },
          $inc: {
            'airdrop_data.profit_per_hour': levelOneProfit,
          },
        },
        { new: true },
      );
      if (!updatedUser) return false;

      this.botService.sendNotificationToUser(
        Number(payment.user_id),
        [
          `✅ *Booster Unlocked\\!*`,
          '',
          `*${booster.title}* Booster has been unlocked successfully`,
        ].join('\n'),
      );

      return true;
    } catch (error) {
      console.error('Error processing booster payment: ' + error);
      return false;
    }
  }

  private async processPremiumPayment(
    payment: TonPaymentsDocument,
  ): Promise<boolean> {
    try {
      const [user, premium] = await Promise.all([
        this.userModel.findById(payment.user_id),
        this.marketItemModel.findById(payment.item_id).lean(),
      ]);
      if (!user || !premium) return false;

      const updated = await this.userModel.findOneAndUpdate(
        { _id: user._id, is_premium: false },
        { $set: { is_premium: true } },
        { new: true },
      );
      if (!updated) return false;

      this.botService.sendNotificationToUser(
        Number(payment.user_id),
        [`✅ *Premium Unlocked\\!*`].join('\n'),
      );
      return true;
    } catch (error) {
      console.error('Error processing premium payment: ' + error);
      return false;
    }
  }
}
