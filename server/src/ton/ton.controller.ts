import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { TonService } from './ton.service';
import { Cell } from '@ton/core';

@Controller('ton')
export class TonController {
  private readonly logger = new Logger(TonController.name);
  constructor(private readonly tonService: TonService) {}

  @Post('create-purchase-stone-transaction')
  async createTransaction(
    @Body() body: { wallet_address: string; amount: string; user_id: string },
  ) {
    console.log('body: ', body);
    return await this.tonService.createPurchaseStoneTransaction(
      body.wallet_address,
      body.amount,
      body.user_id,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleTonApiNotification(@Body() body: any) {
    this.logger.log(`Received TON API notification: ${JSON.stringify(body)}`);
  }

  @Post('decode-payload')
  async decodeRawPayload2(@Body() body: { payload: string }) {
    return await this.tonService.decodeRawPayload(body.payload);
  }
}
