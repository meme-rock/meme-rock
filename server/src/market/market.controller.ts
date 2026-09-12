import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { MarketService } from './market.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('get-stones-market-data')
  @Throttle({ strict: { limit: 1, ttl: 1000 } })
  async getStonesMarketData() {
    console.log('get-stones-market-data');
    return await this.marketService.getStonesMarketData();
  }

  @Post('purchase-stones-with-ton/:user_id')
  @Throttle({ strict: { limit: 1, ttl: 1000 } })
  async purchaseStonesWithTon(
    @Param('user_id') user_id: string,
    @Body()
    {
      stone_amount,
      wallet_address,
    }: { stone_amount: number; wallet_address: string },
  ) {
    console.log('stone_amount: ', stone_amount);
    console.log('wallet_address: ', wallet_address);
    return await this.marketService.createPaymentWithTonLink(
      user_id,
      stone_amount,
      wallet_address,
    );
  }

  @Public()
  @Get('check-ton-payments')
  async checkTonPayments(@Headers('x-api-key') api_key: string) {
    if (api_key !== process.env.TON_ENDPOINT_SECRET) {
      throw new UnauthorizedException('Invalid Request');
    }
    return await this.marketService.checkTonPayments();
  }
}
