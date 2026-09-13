import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * /admin/* uçlarını paylaşılan bir anahtarla korur.
 *
 * Bu uçlar oyun ekonomisini değiştirir (miner fiyatları, booster seviyeleri,
 * market paketleri, görevler). Telegram initData ile korunamazlar çünkü
 * istekler admin panelinden gelir, Telegram istemcisinden değil.
 *
 * ADMIN_API_KEY tanımlı değilse guard TÜM istekleri reddeder (fail-closed) —
 * ortam değişkeni unutulduğunda panelin internete açık kalmasındansa
 * çalışmaması yeğdir.
 */
@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(AdminApiKeyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.ADMIN_API_KEY;

    if (!expected) {
      this.logger.error(
        'ADMIN_API_KEY tanımlı değil — /admin/* uçları kapalı tutuluyor.',
      );
      throw new UnauthorizedException('Admin API is not configured');
    }

    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers['x-admin-key'];
    const provided = Array.isArray(header) ? header[0] : header;

    if (!provided || provided !== expected) {
      this.logger.warn(`Rejected admin request: ${req.method} ${req.url}`);
      throw new UnauthorizedException('Invalid admin key');
    }

    return true;
  }
}
