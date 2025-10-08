import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { verifyInitData } from './verify-initdata';

@Injectable()
export class TelegramInitDataMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      const telegram_id = req.params._id;
      const init_data =
        req.headers['x-telegram-init-data'] || req.body.init_data;
      if (!init_data || !telegram_id) {
        return res.status(400).json({ message: 'Invalid request' });
      }

      const isValid = verifyInitData(telegram_id, init_data);
      console.log('is Telegram InitData Valid: ', isValid);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid request' });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
