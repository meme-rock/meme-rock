import { Injectable } from '@nestjs/common';
import { Address, toNano, beginCell } from '@ton/core';
import {
  StonePurchase,
  storeStonePurchase,
  PurchaseStone,
} from './contract/PurchaseStone_PurchaseStone';

@Injectable()
export class TonService {
  private readonly CONTRACT_ADDRESS =
    process.env.PURCHASE_STONE_CONTRACT_ADDRESS;

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
}
