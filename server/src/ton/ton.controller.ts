import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { TonService } from './ton.service';

@Controller('ton')
export class TonController {
  private readonly logger = new Logger(TonController.name);
  constructor(private readonly tonService: TonService) {}

  @Post('create-purchase-stone-transaction')
  async createTransaction(
    @Body() body: { userAddress: string; amount: string },
  ) {
    console.log('body: ', body);
    return await this.tonService.createPurchaseStoneTransaction(
      body.userAddress,
      body.amount,
    );
  }
  @Post('decode-payload')
  async decodePayload(@Body() body: { payload: string }) {
    return await this.tonService.decodePayload(body.payload);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleTonApiNotification(@Body() body: any) {
    this.logger.log(`Received TON API notification: ${JSON.stringify(body)}`);
  }
}
