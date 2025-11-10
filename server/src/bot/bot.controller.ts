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

@Update()
export class BotController implements OnModuleInit {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly broadcastService: BroadcastService,
    private readonly botService: BotService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly helpersService: HelpersService,
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
      if (currency !== 'XTR') {
        await this.botService.refundStarsPayment(
          ctx,
          'Your payment refunded, you have to pay with Telegram stars',
        );
      }
      const payload = paymentInfo.invoice_payload; // Link oluştururken verdiğiniz benzersiz veri

      const user_id = message.from?.id;
      console.log('message:', message);
      console.log('paymentInfo:', paymentInfo);
      console.log('payload:', payload);
      console.log('amount:', amount);
      console.log('userId:', user_id);
      console.log(
        `Başarılı Ödeme! Kullanıcı: ${user_id}, Payload: ${payload}, Miktar: ${amount}`,
      );

      const market_details = STONE_MARKET_STAR.find(
        (item: StarMarketItem) =>
          item.stars_price.toString() === amount.toString(),
      );
      if (!market_details) {
        return await this.botService.refundStarsPayment(
          ctx,
          'Your payment refunded, Something went wrong',
        );
      }
      //* Ödeme Başarılıysa
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
        return await this.botService.refundStarsPayment(
          ctx,
          'Your payment refunded, User not found',
        );
      }
      await ctx.reply(
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
      // 1. **Payload'ı kullanarak** veritabanınızda ilgili siparişi "Ödendi" olarak işaretleyin.
      // 2. Kullanıcının hizmetini (premium erişim, ürün vb.) aktif hale getirin.
      // 3. Kullanıcıya bir onay mesajı gönderin.
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
