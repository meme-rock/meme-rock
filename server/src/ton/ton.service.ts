import { Injectable } from '@nestjs/common';
import { Address, toNano, beginCell, Cell } from '@ton/core';

import {
  loadStonePurchase,
  StonePurchase,
  storeStonePurchase,
} from './contract/PurchaseStone_PurchaseStone';
import { InjectModel } from '@nestjs/mongoose';
import {
  TonPayments,
  TonPaymentsDocument,
} from 'src/schemas/ton-payments.schema';
import { Model } from 'mongoose';

// Kontratınızdaki StonePurchase Op Code'u (0x98A3C5F1)
const STONE_PURCHASE_OP_CODE = 2560869873;
@Injectable()
export class TonService {
  private readonly CONTRACT_ADDRESS =
    process.env.PURCHASE_STONE_CONTRACT_ADDRESS;
  constructor(
    @InjectModel(TonPayments.name)
    private tonPaymentsModel: Model<TonPaymentsDocument>,
  ) {}

  //! 3. for prepare stone purchase payload
  /**
   * StonePurchase mesajı için Base64 payload'u hazırlar.
   * @param amount Ton cinsinden satın alma miktarı (Örn: 0.02)
   * @param walletAddress Kullanıcının Raw cüzdan adresi (TonConnect'ten gelen)
   * @Param userId Kullanıcının Telegram ID'si
   * @Param objectId MongoDB ObjectId
   * @returns Base64 olarak kodlanmış Cell payload'u
   */
  prepareStonePurchasePayload(
    walletAddress: string,
    amount: string,
    objectId: string,
    userId: string,
  ): string {
    const wallet_address = Address.parse(walletAddress);
    const amountNano = toNano(amount); // TON'u nanoTON'a çevir
    // StonePurchase mesaj objesini oluştur
    const message: StonePurchase = {
      $$type: 'StonePurchase',
      walletAddress: wallet_address,
      // Kontratınız ctx.value == msg.amount bekliyor, bu yüzden eşit olmalı
      amount: amountNano,
      userId: userId,
      objectId: objectId,
    };

    // Mesajı Cell'e dönüştür ve Base64'e çevir
    const body = beginCell().store(storeStonePurchase(message)).endCell();
    /* const body = beginCell()
      .storeUint(0, 32) // indicates text comment follows
      .storeStringTail('Hello, TON!') // write our text comment
      .endCell(); */
    return body.toBoc().toString('base64');
  }

  //! 2. for prepare purchase transaction
  /**
   * TonConnect için tam SendTransactionRequest objesini hazırlar.
   * @param amount Ton cinsinden satın alma miktarı (Örn: 0.02)
   * @param walletAddress Kullanıcının Raw cüzdan adresi (TonConnect'ten gelen)
   * @Param userId Kullanıcının Telegram ID'si
   * @Param objectId MongoDB ObjectId
   * @returns Hazır SendTransactionRequest objesi
   */
  preparePurchaseTransaction(
    walletAddress: string,
    amount: string,
    objectId: string,
    userId: string,
  ) {
    const amountNano = toNano(amount);
    const payload = this.prepareStonePurchasePayload(
      walletAddress,
      amount,
      objectId,
      userId,
    );

    const transactionRequest = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 dakika geçerlilik süresi
      messages: [
        {
          address: this.CONTRACT_ADDRESS,
          amount: amountNano.toString(), // NanoTON string
          payload: payload,
        },
      ],
    };

    return transactionRequest;
  }

  //! 1. for create purchase stone transaction
  async createPurchaseStoneTransaction(
    walletAddress: string,
    amount: string,
    userId: string,
  ) {
    const dbTonPayment = await this.tonPaymentsModel.create({
      amount: amount,
      wallet_address: walletAddress,
      user_id: userId,
    });
    return this.preparePurchaseTransaction(
      walletAddress,
      amount,
      dbTonPayment._id.toString(),
      userId,
    );
  }

  async decoder(payload: string) {
    try {
      // 1. Base64 dizesini Cell objesine dönüştürme
      const cell = Cell.fromBase64(payload);

      // 2. Cell'i okumak için Slice objesine dönüştürme
      const slice = cell.beginParse();

      // 3. loadStonePurchase fonksiyonunu kullanarak veriyi çözme
      const decodedMessage = loadStonePurchase(slice);

      // 4. Address'i string'e çevirip, bigint'i string'e çevirerek JSON-serializable hale getirme
      return {
        type: decodedMessage.$$type,
        walletAddress: decodedMessage.walletAddress.toString({
          bounceable: false,
          testOnly: true,
        }), // Address'i string'e çevir
        amount: decodedMessage.amount.toString(), // bigint'i string'e çevir
        userId: decodedMessage.userId,
        objectId: decodedMessage.objectId,
      };
    } catch (e) {
      console.error('Payload çözümleme hatası:', e);
      throw new Error(`Invalid payload format. Error: ${e.message}`);
    }
  }
  async decodeRawPayload(payload: string) {
    try {
      let cell: Cell;
      let hexRawBody: string;
      let base64Payload: string;

      // Payload formatını kontrol et: Hex mi Base64 mü?
      if (payload.startsWith('b5ee9c72') || /^[0-9a-fA-F]+$/.test(payload)) {
        // Hex formatında gelmiş
        hexRawBody = payload.toLowerCase();
        const buffer = Buffer.from(payload, 'hex');
        base64Payload = buffer.toString('base64');
        cell = Cell.fromBase64(base64Payload);
      } else {
        // Base64 formatında gelmiş
        base64Payload = payload;
        hexRawBody = Buffer.from(payload, 'base64').toString('hex');
        cell = Cell.fromBase64(payload);
      }

      // Cell'i parse et
      const slice = cell.beginParse();

      // Op code'u oku (ilk 32 bit)
      const opCode = slice.loadUint(32);

      // Eğer bu bizim StonePurchase op code'umuzsa decode et
      if (opCode != 2560869873) {
        return {
          error: 'Op code tanınmadı',
          opCode: '0x' + opCode.toString(16).toUpperCase(),
          opCodeDecimal: opCode,
          payload: payload,
        };
      }

      // Decode işlemi için base64 kullan
      const stonePurchase = await this.decoder(base64Payload);

      return {
        hexRawBody,
        base64Payload,
        opCode: '0x' + opCode.toString(16).toUpperCase(),
        opCodeDecimal: opCode,
        decodedData: stonePurchase,
        message: 'Payload başarıyla decode edildi',
      };
    } catch (error) {
      return {
        error: error.message,
        payload: payload,
      };
    }
  }
}
