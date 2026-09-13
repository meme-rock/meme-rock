import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import {
  parseAndVerifyInitData,
  VerifiedInitData,
} from 'src/user/middleware/verify-initdata';

export interface AuthenticatedRequest extends Request {
  telegram?: VerifiedInitData;
}

/**
 * Her istekte Telegram Web App initData'sını doğrular ve rotadaki
 * :user_id parametresinin doğrulanmış kullanıcıya ait olduğunu garanti eder.
 *
 * Bu ikinci kontrol kritik: initData doğru olsa bile, onu gönderen kullanıcı
 * başka birinin user_id'siyle istek atarak o hesabı oynatabilir (IDOR).
 *
 * @Public() ile işaretli uçlar atlanır (webhook, cron, admin).
 */
@Injectable()
export class TelegramAuthGuard implements CanActivate {
  private readonly logger = new Logger(TelegramAuthGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const header = req.headers['x-telegram-init-data'];
    const initData = Array.isArray(header) ? header[0] : header;

    if (!initData) {
      throw new UnauthorizedException('Missing Telegram init data');
    }

    const verified = parseAndVerifyInitData(initData);
    if (!verified) {
      throw new UnauthorizedException('Invalid or expired Telegram init data');
    }

    // Rota bir kullanıcıya aitse, o kullanıcı istek sahibi olmalı
    const routeUserId = req.params?.user_id;
    if (routeUserId && routeUserId !== verified.telegram_id) {
      this.logger.warn(
        `Blocked cross-user request: ${verified.telegram_id} -> ${routeUserId} ${req.method} ${req.url}`,
      );
      throw new ForbiddenException('User mismatch');
    }

    req.telegram = verified;
    return true;
  }
}
