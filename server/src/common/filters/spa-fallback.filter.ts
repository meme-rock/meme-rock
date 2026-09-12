import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Client ve API aynı serviste çalıştığında, API rotalarıyla eşleşmeyen
 * tarayıcı isteklerini SPA'nın index.html'ine yönlendirir.
 *
 * React Router client-side çalıştığı için /mine, /profile gibi adresler
 * sunucuda karşılığı olmayan rotalardır; onlara index.html dönmezsek
 * sayfa yenilendiğinde 404 alınır.
 *
 * Sadece HTML bekleyen GET istekleri yönlendirilir — API çağrıları
 * ve asset istekleri normal 404 almaya devam eder.
 */
@Catch(NotFoundException)
export class SpaFallbackFilter implements ExceptionFilter {
  constructor(private readonly indexHtmlPath: string) {}

  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const accept = req.headers.accept ?? '';
    const wantsHtml = req.method === 'GET' && accept.includes('text/html');

    if (wantsHtml) {
      return res.sendFile(this.indexHtmlPath);
    }

    return res.status(404).json(exception.getResponse());
  }
}
