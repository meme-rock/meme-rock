import { Injectable, Logger } from '@nestjs/common';
import { Ctx, InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { Message } from 'telegraf/types';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  async isChatMember(
    user_id: number,
    chat_id: string | number,
  ): Promise<boolean> {
    try {
      const validChats: string[] = [
        '@testforbilal',
        '@thememerock',
        '@deepdapp',
      ];
      if (!validChats.includes(chat_id.toString())) {
        return false;
      }
      const member = await this.bot.telegram.getChatMember(chat_id, user_id);
      console.log('member', member);
      // Kullanıcı üye ise status 'member', 'administrator', 'creator' veya 'restricted' olabilir
      // 'left' veya 'kicked' ise üye değildir
      return ['member', 'administrator', 'creator', 'restricted'].includes(
        member.status,
      );
    } catch (error) {
      console.error('Error checking chat member:', error);
      return false;
    }
  }

  async createInvoiceLink(
    title: string,
    description: string,
    payload: string,
    provider_token: string,
    prices: { label: string; amount: number }[],
  ) {
    try {
      const invoice_link = await this.bot.telegram.createInvoiceLink({
        title,
        description,
        payload,
        provider_token,
        currency: 'XTR',
        prices,
      });
      console.log('invoice_link', invoice_link);
      return invoice_link;
    } catch (error) {
      console.error('Error creating invoice link:', error);
      return null;
    }
  }

  async refundStarsPayment(@Ctx() ctx: Context, msg: string) {
    try {
      const message = ctx.message as Message.SuccessfulPaymentMessage;
      const charge_id = message.successful_payment
        .telegram_payment_charge_id as string;

      const result = await (this.bot.telegram as any)
        .callApi('refundStarPayment', {
          user_id: message.from?.id,
          telegram_payment_charge_id: charge_id,
        })
        .then(() => {
          return ctx.reply(msg);
        })
        .catch(() => {
          return ctx.reply('Refund Failed');
        });
      return result;
    } catch (err) {
      console.error('Refund error:', err.response?.description ?? err);
      throw err;
    }
  }

  async testRefundStarsPayment(telegram_payment_charge_id: string) {
    const result = await (this.bot.telegram as any)
      .callApi('refundStarPayment', {
        user_id: 5075071123,
        telegram_payment_charge_id: telegram_payment_charge_id,
      })
      .then(() => {
        return 'Refund Successful';
      })
      .catch(() => {
        return 'Refund Failed';
      });
    return result;
  }

  async sendNotificationToUser(user_id: number, message: string) {
    try {
      await this.bot.telegram.sendMessage(user_id, message, {
        parse_mode: 'MarkdownV2',
      });

      return { success: true, message: 'Notification sent successfully' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Failed to send notification to user ${user_id}: ${errorMessage}`,
      );

      // Bot blocked veya chat not found gibi durumları handle et
      if (
        errorMessage.includes('bot was blocked') ||
        errorMessage.includes('chat not found') ||
        errorMessage.includes('user is deactivated')
      ) {
        return {
          success: false,
          message: 'User blocked bot or chat not found',
          error: errorMessage,
        };
      }

      return {
        success: false,
        message: 'Failed to send notification',
        error: errorMessage,
      };
    }
  }
}
