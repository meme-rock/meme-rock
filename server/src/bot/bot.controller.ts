import {
  Ctx,
  InjectBot,
  On,
  Start,
  Update,
  Command,
  Action,
} from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { COMMANDS } from './bot.commands';
import { OnModuleInit } from '@nestjs/common';
import { BroadcastService } from './jobs/broadcast.service';
import { Message } from 'telegraf/types';
import { BotService } from './bot.service';
import {
  StarMarketItem,
  STONE_MARKET_STAR,
  STONE_MARKET_TON,
  TonMarketItem,
} from 'src/common/config';
import { UserService } from 'src/user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import { HelpersService } from 'src/helpers/helpers.service';
import { EPaymentType } from 'src/common/enums/star-payload.enum';
import { BoosterService } from 'src/booster/booster.service';
import { MarketService } from 'src/market/market.service';

@Update()
export class BotController implements OnModuleInit {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly broadcastService: BroadcastService,
    private readonly botService: BotService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly helpersService: HelpersService,
    private readonly boosterService: BoosterService,
    private readonly marketService: MarketService,
  ) {}

  onModuleInit() {
    // <-- setMyCommands buraya taşındı mı?
    this.bot.telegram.setMyCommands(COMMANDS);
  }

  @On('pre_checkout_query')
  async onPreCheckout(@Ctx() ctx: Context) {
    await ctx.answerPreCheckoutQuery(true); // ✅ doğru
  }

  @On('successful_payment')
  async handleSuccessfulPayment(@Ctx() ctx: Context) {
    try {
      console.log('Başarılı Ödeme geldi:', ctx);
      const message = ctx.message as Message.SuccessfulPaymentMessage;
      const paymentInfo = message.successful_payment;
      const currency = paymentInfo.currency;
      const amount = paymentInfo.total_amount;
      if (currency !== 'XTR' || !paymentInfo) {
        await this.botService.refundStarsPayment(
          ctx,
          'Your payment refunded, wrong currency or unsuccessful payment',
        );
      }

      const payload = paymentInfo.invoice_payload; // Link oluştururken verdiğiniz benzersiz veri
      const type = JSON.parse(payload).payment_type;
      console.log('type:', type);
      const user_id = message.from?.id?.toString();
      if (!user_id) {
        return await this.botService.refundStarsPayment(
          ctx,
          'Your payment refunded, User not found',
        );
      }
      console.log('message:', message);
      console.log('paymentInfo:', paymentInfo);
      console.log('payload:', payload);
      console.log('amount:', amount);
      console.log('userId:', user_id);
      console.log(
        `Başarılı Ödeme! Kullanıcı: ${user_id}, Payload: ${payload}, Miktar: ${amount}`,
      );
      switch (type) {
        case EPaymentType.BOOSTER:
          const booster_id = JSON.parse(payload).booster_id;
          await this.boosterService.unlockBoosterForStars(user_id, booster_id);
          break;
        case EPaymentType.STONE:
          const amount = JSON.parse(payload).stars_price;
          const success = await this.marketService.handleStarsPayment(
            user_id,
            amount,
          );
          if (!success) {
            return await this.botService.refundStarsPayment(
              ctx,
              'Your payment refunded, Something went wrong',
            );
          }

          break;
        case EPaymentType.PREMIUM:
          break;
        default:
          return await this.botService.refundStarsPayment(
            ctx,
            'Your payment refunded, wrong payment type',
          );
      }

      await this.botService.refundStarsPayment(ctx, 'Test Refund Successful');
      return;
      // Örneğin: await this.telegramService.activateUserService(userId, payload);
    } catch (error) {
      console.log('Başarılı Ödeme hatası:', error);
    }
  }

  @Start()
  async startCommand(@Ctx() ctx: Context) {
    ctx.reply(
      `🎉 **Welcome to ROCK!**\n\n🎮 Press **Play** to dive into an ROCK Airdrop 🚀!\n\n📖 Tap Whitepaper to discover how it all works.`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎮 Play',
                url: 'https://t.me/memerockBot/playrock',
                // WebApp URL'si
              },
              {
                text: '📖 Whitepaper',
                url: 'https://deep-dapp-store.gitbook.io/rock',
              },
            ],
            [{ text: '📢 Join Channel', url: 'https://t.me/thememerock' }],
            [{ text: '💬 Join Chat', url: 'https://t.me/meme_rock_chat' }],
          ],
        },
      },
    );
  }

  //! Broadcast komutları
  @Command('announce')
  async announceCommand(@Ctx() ctx: Context) {
    return this.broadcastService.announceCommand(ctx);
  }

  @Action('announce_text_only')
  async announceTextOnly(@Ctx() ctx: Context) {
    return this.broadcastService.announceTextOnly(ctx);
  }

  @Action('announce_cancel')
  async announceCancel(@Ctx() ctx: Context) {
    return this.broadcastService.announceCancel(ctx);
  }

  @Action('announce_send')
  async announceSend(@Ctx() ctx: Context) {
    return this.broadcastService.announceSend(ctx);
  }

  @On('photo')
  async handlePhoto(@Ctx() ctx: Context) {
    return this.broadcastService.handlePhoto(ctx);
  }

  @On('text')
  async handleText(@Ctx() ctx: Context) {
    return this.broadcastService.handleText(ctx);
  }
}
