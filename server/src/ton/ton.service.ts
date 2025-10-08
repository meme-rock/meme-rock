import { Injectable } from '@nestjs/common';
import { Address, toNano, beginCell, Cell } from '@ton/core';
import { TonClient } from '@ton/ton'; // <-- Yeni import
import {
  loadStonePurchase,
  StonePurchase,
  storeStonePurchase,
} from './contract/PurchaseStone_PurchaseStone';

// Kontratınızdaki StonePurchase Op Code'u (0x98A3C5F1)
const STONE_PURCHASE_OP_CODE = 2560869873;
@Injectable()
export class TonService {
  private readonly CONTRACT_ADDRESS =
    process.env.PURCHASE_STONE_CONTRACT_ADDRESS;

  // TON Client'ı tanımlayın (TON_API_ENDPOINT ve KEY env'den gelmeli)
  private readonly client = new TonClient({
    endpoint: process.env.TON_API_ENDPOINT || '',
    apiKey: process.env.TON_API_KEY,
  });
  /**
   * StonePurchase mesajı için Base64 payload'u hazırlar.
   * @param userAddress Kullanıcının Raw cüzdan adresi (TonConnect'ten gelen)
   * @param purchaseAmount Ton cinsinden satın alma miktarı (Örn: 0.02)
   * @returns Base64 olarak kodlanmış Cell payload'u
   */
  prepareStonePurchasePayload(
    userAddress: string,
    purchaseAmount: string,
  ): string {
    const userAddr = Address.parse(userAddress);
    const amountNano = toNano(purchaseAmount); // TON'u nanoTON'a çevir

    // StonePurchase mesaj objesini oluştur
    const message: StonePurchase = {
      $$type: 'StonePurchase',
      user: userAddr,
      // Kontratınız ctx.value == msg.amount bekliyor, bu yüzden eşit olmalı
      amount: amountNano,
    };

    // Mesajı Cell'e dönüştür ve Base64'e çevir
    const body = beginCell().store(storeStonePurchase(message)).endCell();
    /* const body = beginCell()
      .storeUint(0, 32) // indicates text comment follows
      .storeStringTail('Hello, TON!') // write our text comment
      .endCell(); */
    return body.toBoc().toString('base64');
  }

  /**
   * TonConnect için tam SendTransactionRequest objesini hazırlar.
   * @param userAddress Kullanıcının Raw cüzdan adresi
   * @param amount TON cinsinden miktar
   * @returns Hazır SendTransactionRequest objesi
   */
  preparePurchaseTransaction(userAddress: string, amount: string) {
    const amountNano = toNano(amount);
    const payload = this.prepareStonePurchasePayload(userAddress, amount);

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

  async createPurchaseStoneTransaction(userAddress: string, amount: string) {
    return this.preparePurchaseTransaction(userAddress, amount);
  }

  async decodePayload(payload: string) {
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
        user: decodedMessage.user.toString({
          bounceable: false,
          testOnly: true,
        }), // Address'i string'e çevir
        amount: decodedMessage.amount.toString(), // bigint'i string'e çevir
      };
    } catch (e) {
      console.error('Payload çözümleme hatası:', e);
      throw new Error(`Invalid payload format. Error: ${e.message}`);
    }
  }
}
