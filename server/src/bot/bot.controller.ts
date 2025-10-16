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

@Update()
export class BotController implements OnModuleInit {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly broadcastService: BroadcastService,
  ) {}

  onModuleInit() {
    // <-- setMyCommands buraya taşındı mı?
    this.bot.telegram.setMyCommands(COMMANDS);
  }
  @On('pre_checkout_query')
  async handlePreCheckout(@Ctx() ctx: Context) {
    return ctx.answerPreCheckoutQuery(true).catch(() => {
      ctx.reply('Payment failed. Please try again.');
    });
  }
  @Start()
  async startCommand(@Ctx() ctx: Context) {
    await ctx.reply('Hello World');
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
