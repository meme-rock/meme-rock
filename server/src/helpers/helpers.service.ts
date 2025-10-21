import { Injectable } from '@nestjs/common';

@Injectable()
export class HelpersService {
  constructor() {}

  escapeInlineCodeForMarkdownV2(text: string): string {
    // Telegram'a giden string içinde ` ve \ karakterlerini kaçır
    return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
  }
}
