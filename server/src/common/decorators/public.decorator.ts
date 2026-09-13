import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Telegram initData doğrulamasını atlar.
 * Sadece Telegram istemcisinden GELMEYEN uçlar için kullanılır:
 * sunucudan sunucuya webhook'lar, zamanlanmış işler ve admin paneli.
 * Bu uçların KENDİ kimlik doğrulaması olmalıdır (API key vb.).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
