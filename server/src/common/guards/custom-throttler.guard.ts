// src/common/guards/custom-throttler.guard.ts

import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: ThrottlerRequest): Promise<string> {
    // Request'ten telegram_id ve IP'yi al
    const telegramId = this.extractTelegramId(req);
    console.log('requested telegram_id: ', telegramId);
    // 🛑 KRİTİK: Telegram ID varsa onu kullan (cihazdan bağımsız), yoksa IP kullan (fallback)
    return `telegram_${telegramId}`;
  }

  protected extractTelegramId(req: any): string | null {
    // Request null/undefined kontrolü
    if (!req) {
      return null;
    }

    // 1. URL params'dan telegram_id/id'yi al (örn: /user/loading/5075071123)
    if (req.params?.user_id || req.params?.id) {
      return String(req.params.user_id || req.params.id);
    }

    // 2. Body'den user_id'yi al
    if (req.body?.user_id) {
      return String(req.body.user_id);
    }

    // 3. Header'dan user ID'yi al (Init Data middleware sonrası)
    if (req.headers) {
      const telegramIdHeader =
        req.headers['x-user-id'] || req.headers['user-id'];
      if (telegramIdHeader) {
        return String(telegramIdHeader);
      }
    }

    // 4. Query parameter'dan user_id'yi al (ad-reward gibi webhook'lar için)
    if (req.query?.user_id || req.query?.userid) {
      return String(req.query.user_id || req.query.userid);
    }

    return null;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: { totalHits: number; timeToBlockExpire: number },
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();
    const telegramId = this.extractTelegramId(request);

    // Custom response mesajı
    const response = {
      success: false,
      message: 'Too many requests',
    };

    throw new HttpException(response, HttpStatus.TOO_MANY_REQUESTS);
  }

  // Debug için log ekleme (opsiyonel)
  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const telegramId = this.extractTelegramId(requestProps);

    // Debug log (production'da kaldırılabilir)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔒 Throttling check - Key: telegram_${telegramId}`);
    }

    return super.handleRequest(requestProps);
  }
}
