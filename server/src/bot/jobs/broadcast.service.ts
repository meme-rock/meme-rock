import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Context, Telegraf, Markup } from 'telegraf';
import { User, UserDocument } from 'src/schemas/user.schema';

// Duyuru durumlarını takip eden tip
export type AnnounceState = {
  step: number;
  mediaType?: 'photo' | 'text';
  mediaId?: string;
  mediaText?: string;
  buttonText?: string;
  buttonLink?: string;
};

@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);
  private readonly announceStates: Map<number, AnnounceState> = new Map();
  private readonly ADMIN_ID = 5075071123;

  // Broadcast ayarları
  private readonly CHUNK_SIZE = 500;
  private readonly THROTTLE_SIZE = 29;
  private readonly THROTTLE_DELAY_MS = 1100;

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Telegram MarkdownV2 için escape
  private escapeMarkdown(text: string): string {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
  }

  // Admin kontrolü
  private isAdmin(userId: number): boolean {
    return userId === this.ADMIN_ID;
  }

  async announceCommand(ctx: Context) {
    if (!ctx.from || !this.isAdmin(ctx.from.id)) {
      return;
    }

    // Yeni duyuru süreci başlat
    this.announceStates.set(ctx.from.id, { step: 1 });

    await ctx.reply(
      '📣 New Announcement Creation\n\n' +
        'Please send me the announcement media (photo) or text message.',
      Markup.inlineKeyboard([
        [Markup.button.callback('Text Only', 'announce_text_only')],
        [Markup.button.callback('Cancel', 'announce_cancel')],
      ]),
    );
  }

  async announceTextOnly(ctx: Context) {
    if (!ctx.from || !this.isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery();
      return;
    }

    this.announceStates.set(ctx.from.id, {
      step: 2,
      mediaType: 'text',
    });

    await ctx.editMessageText(
      '📝 Please send me the text for the announcement.',
    );
    await ctx.answerCbQuery();
  }

  async announceCancel(ctx: Context) {
    if (!ctx.from || !this.isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery();
      return;
    }

    this.announceStates.delete(ctx.from.id);

    await ctx.editMessageText('Announcement cancelled.');
    await ctx.answerCbQuery();
  }

  async handlePhoto(ctx: Context) {
    if (!ctx.from || !this.isAdmin(ctx.from.id)) return;

    const state = this.announceStates.get(ctx.from.id);
    if (!state || state.step !== 1) return;

    const photos = (ctx.message as any)?.photo;
    if (!photos || photos.length === 0) return;

    const fileId = photos[photos.length - 1].file_id;
    state.mediaType = 'photo';
    state.mediaId = fileId;
    state.mediaText = (ctx.message as any)?.caption || '';
    state.step = 3;

    this.announceStates.set(ctx.from.id, state);

    await ctx.reply(
      '🖼️ Photo received!\n\n' +
        'Now, send me the button text and URL in the format:\n' +
        'Button Text | https://example.com',
    );
  }

  async handleText(ctx: Context) {
    if (!ctx.from || !this.isAdmin(ctx.from.id)) return;

    const state = this.announceStates.get(ctx.from.id);
    if (!state) return;

    const text = (ctx.message as any)?.text;

    // Metin duyurusu için
    if (state.step === 2 && state.mediaType === 'text') {
      state.mediaText = text;
      state.step = 3;
      this.announceStates.set(ctx.from.id, state);

      await ctx.reply(
        '✅ Text received!\n\n' +
          'Now, send me the button text and URL in the format:\n' +
          'Button Text | https://example.com',
      );
      return;
    }

    // Buton bilgisi için
    if (state.step === 3) {
      const parts = text.split('|').map((part) => part.trim());

      if (parts.length !== 2 || !parts[1].startsWith('http')) {
        await ctx.reply(
          '❌ Invalid format. Please send in the format:\n' +
            'Button Text | https://example.com',
        );
        return;
      }

      state.buttonText = parts[0];
      state.buttonLink = parts[1];
      state.step = 4;
      this.announceStates.set(ctx.from.id, state);

      const count = await this.userModel.countDocuments({});

      await ctx.reply(
        `📊 This announcement will be sent to all users (${count} total).\n\n` +
          'Preview your announcement:',
        Markup.inlineKeyboard([
          [Markup.button.callback('Send Now', 'announce_send')],
          [Markup.button.callback('Cancel', 'announce_cancel')],
        ]),
      );

      // Önizlemeyi göster
      const keyboard = Markup.inlineKeyboard([
        Markup.button.url(
          state.buttonText || 'Button',
          state.buttonLink || 'https://example.com',
        ),
      ]);

      const messageText = this.escapeMarkdown(
        state.mediaText || 'No text provided',
      );

      if (state.mediaType === 'photo' && state.mediaId) {
        await ctx.replyWithPhoto(state.mediaId, {
          caption: messageText,
          parse_mode: 'MarkdownV2',
          ...keyboard,
        });
      } else {
        await ctx.reply(messageText, {
          parse_mode: 'MarkdownV2',
          ...keyboard,
        });
      }
      return;
    }
  }

  async announceSend(ctx: Context) {
    if (!ctx.from || !this.isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery();
      return;
    }

    const state = this.announceStates.get(ctx.from.id);
    if (!state || state.step !== 4) {
      await ctx.answerCbQuery();
      return;
    }

    await ctx.answerCbQuery('Starting broadcast...');

    await ctx.editMessageText(
      '🚀 Broadcast started. You will receive updates about the progress.',
    );

    // Broadcast işlemini başlat
    await this.executeBroadcast(ctx, state, ctx.telegram);

    // State'i temizle
    this.announceStates.delete(ctx.from.id);
  }

  private async executeBroadcast(
    ctx: Context,
    state: AnnounceState,
    botApi: any,
  ) {
    let success = 0;
    let failed = 0;
    let processedCount = 0;
    const startTime = Date.now();
    let lastId: any = null;

    const keyboard = Markup.inlineKeyboard([
      Markup.button.url(
        state.buttonText || 'Button',
        state.buttonLink || 'https://example.com',
      ),
    ]);

    const messageText = this.escapeMarkdown(
      state.mediaText || 'No text provided',
    );

    const totalUsers = await this.userModel.countDocuments({});

    if (totalUsers === 0) {
      await ctx.reply('✅ Broadcast complete: No users to notify.');
      return;
    }

    await ctx.reply(`📣 Starting broadcast to ${totalUsers} users...`);

    while (processedCount < totalUsers) {
      const query = lastId ? { _id: { $gt: lastId } } : {};
      const userChunk = await this.userModel
        .find(query)
        .sort({ _id: 1 })
        .limit(this.CHUNK_SIZE)
        .lean()
        .exec();

      if (userChunk.length === 0) break;

      for (let i = 0; i < userChunk.length; i += this.THROTTLE_SIZE) {
        const subChunk = userChunk.slice(i, i + this.THROTTLE_SIZE);

        const promises = subChunk.map((user) => {
          const telegramId = Number(user._id); // _id is telegram ID in your schema

          if (state.mediaType === 'photo' && state.mediaId) {
            return botApi.sendPhoto(telegramId, state.mediaId, {
              caption: messageText,
              parse_mode: 'MarkdownV2',
              ...keyboard,
            });
          } else {
            return botApi.sendMessage(telegramId, messageText, {
              parse_mode: 'MarkdownV2',
              ...keyboard,
            });
          }
        });

        const results = await Promise.allSettled(promises);

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            success++;
          } else {
            failed++;
            const err = result.reason;
            const errorMessage =
              err instanceof Error ? err.message : 'Unknown error';

            if (
              errorMessage.includes('bot was blocked') ||
              errorMessage.includes('chat not found')
            ) {
              this.logger.log(`Skipped user (blocked/not found)`);
            } else {
              this.logger.warn(`Failed to send: ${errorMessage}`);
            }
          }
        });

        // Rate limiting
        if (
          i + this.THROTTLE_SIZE < userChunk.length ||
          processedCount + userChunk.length < totalUsers
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.THROTTLE_DELAY_MS),
          );
        }
      }

      processedCount += userChunk.length;
      lastId = userChunk[userChunk.length - 1]._id;

      // İlerleme raporu
      await ctx.reply(
        `⏳ Progress: ${processedCount}/${totalUsers} (${Math.round((processedCount / totalUsers) * 100)}%)`,
      );
    }

    const totalElapsedSec = (Date.now() - startTime) / 1000;
    const summaryMessage = `
🏁 **Broadcast Completed** 🏁

⏱️ Total time: *${totalElapsedSec.toFixed(1)} seconds*
✅ Successful: *${success}*
❌ Failed: *${failed}*
📊 Success rate: *${((success / totalUsers) * 100).toFixed(2)}%*
    `;

    await botApi.sendMessage(this.ADMIN_ID, summaryMessage, {
      parse_mode: 'Markdown',
    });

    this.logger.log(
      `Broadcast completed: ${success} success, ${failed} failed`,
    );
  }
}
