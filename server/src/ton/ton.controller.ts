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
  @Post('raw')
  async decodeRawPayload(@Body() body: { payload: string }) {
    const buffer = Buffer.from(body.payload, 'hex');
    const base64String = buffer.toString('base64');
    return {
      base64String,
    };
  }
  @Post('raw-2')
  async decodeRawPayload2(@Body() body: { payload: string }) {
    try {
      // Base64 BOC'u hex formatına çevir
      const hexRawBody = Buffer.from(body.payload, 'base64').toString('hex');

      // Base64 BOC'u Cell'e parse et
      const cell = Cell.fromBase64(body.payload);
      const slice = cell.beginParse();

      // Op code'u oku (ilk 32 bit)
      const opCode = slice.loadUint(32);

      // Eğer bu bizim StonePurchase op code'umuzsa decode et
      let decodedData: any = null;
      if (opCode === 2560869873) {
        // 0x98A3C5F1
        // Slice'ı başa al ve loadStonePurchase kullan
        const fullSlice = cell.beginParse();
        const stonePurchase = await this.tonService.decodePayload(body.payload);
        decodedData = stonePurchase;
      }

      return {
        hexRawBody,
        opCode: '0x' + opCode.toString(16).toUpperCase(),
        opCodeDecimal: opCode,
        decodedData,
        message: decodedData
          ? 'Payload başarıyla decode edildi'
          : 'Op code tanınmadı, sadece hex gösteriliyor',
      };
    } catch (error) {
      return {
        error: error.message,
        payload: body.payload,
      };
    }
  }
}
