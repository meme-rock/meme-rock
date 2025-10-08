import { Body, Controller, Post } from '@nestjs/common';
import { TonService } from './ton.service';

@Controller('ton')
export class TonController {
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
}
