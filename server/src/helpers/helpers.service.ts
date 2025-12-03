import { Injectable } from '@nestjs/common';

@Injectable()
export class HelpersService {
  constructor() {}

  /**
   * YENİ FONKSİYON:
   * Telegram MarkdownV2 için düz metin, link ve bold
   * karakterlerini güvenli hale getirir.
   * @param text - Güvenli hale getirilecek metin
   */
  safeMarkdown(text: string): string {
    const chars = [
      '_',
      '*',
      '[',
      ']',
      '(',
      ')',
      '~',
      '`',
      '>',
      '#',
      '+',
      '-',
      '=',
      '|',
      '{',
      '}',
      '.',
      '!',
    ];
    return chars.reduce(
      (acc, ch) => acc.replace(new RegExp(`\\${ch}`, 'g'), `\\${ch}`),
      text,
    );
  }
}
