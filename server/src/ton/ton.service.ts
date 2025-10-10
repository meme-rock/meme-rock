import { Injectable, Logger } from '@nestjs/common';
import { Address, toNano, beginCell, Cell, fromNano } from '@ton/core';

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
import { User, UserDocument } from 'src/schemas/user.schema';
import { ETonPaymentStatus } from 'src/common/enums/ton-payments.enum';

@Injectable()
export class TonService {
  private readonly logger = new Logger(TonService.name);
  private readonly CONTRACT_ADDRESS =
    process.env.PURCHASE_STONE_CONTRACT_ADDRESS;
  constructor(
    @InjectModel(TonPayments.name)
    private tonPaymentsModel: Model<TonPaymentsDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
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
        wallet_address: decodedMessage.walletAddress.toString({
          bounceable: false,
          testOnly: true,
        }), // Address'i string'e çevir
        amount: fromNano(decodedMessage.amount.toString()), // bigint'i string'e çevir
        user_id: decodedMessage.userId,
        payment_id: decodedMessage.objectId,
      };
    } catch (e) {
      console.error('Payload çözümleme hatası:', e);
      throw new Error(`Invalid payload format. Error: ${e.message}`);
    }
  }
  async decodeRawPayload(payload: string) {
    try {
      // Base64 BOC'u hex formatına çevir
      const hexRawBody = Buffer.from(payload, 'base64').toString('hex');

      // Base64 BOC'u Cell'e parse et
      const cell = Cell.fromBase64(payload);
      const slice = cell.beginParse();

      // Op code'u oku (ilk 32 bit)
      const opCode = slice.loadUint(32);

      // Eğer bu bizim StonePurchase op code'umuzsa decode et
      let decodedData: any = null;
      if (opCode != 2560869873) {
        return {
          error: 'Op code tanınmadı',
          payload: payload,
        };
      }
      const stonePurchase = await this.decoder(payload);
      decodedData = stonePurchase;
      return {
        opCode: '0x' + opCode.toString(16).toUpperCase(),
        decodedData,
        message: decodedData
          ? 'Payload başarıyla decode edildi'
          : 'Op code tanınmadı, sadece hex gösteriliyor',
      };
    } catch (error) {
      return {
        error: error.message,
        payload: payload,
      };
    }
  }

  async handleTonPayment(account_id: string, lt: string, tx_hash: string) {
    this.logger.log(
      `Received TON API notification: ${JSON.stringify({
        account_id,
        lt,
        tx_hash,
      })}`,
    );

    const MAX_RETRIES = 5;
    const DELAY_MS = 3000;
    let transactionFoundAndProcessed = false; // Başarı durumunu takip eden bayrak

    // URL parametrelerini oluştur
    const params = new URLSearchParams({
      address: account_id,
      limit: '1',
      lt: lt.toString(),
      hash: tx_hash,
      api_key: process.env.TON_CENTER_API_KEY!,
    });

    const url = `https://testnet.toncenter.com/api/v3/transactions?${params.toString()}`;
    this.logger.log('URL: ' + url);

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        const transactions = data.transactions;

        // 1. İşlem Bulundu Kontrolü
        if (transactions && transactions.length > 0) {
          const result = transactions[0];

          // 2. Başarısızlık Kontrolü (Exit Code)
          const exit_code = result.description.compute_ph.exit_code;

          if (exit_code !== 0) {
            this.logger.warn(
              `İşlem Exit Code ${exit_code} ile REDDEDİLDİ. Veritabanı güncellenmiyor.`,
            );
            transactionFoundAndProcessed = true; // İşlem bulundu, FAILED olarak işlendi.
            break; // Döngüden çık
          }

          // 3. Başarılı İşlemi İşleme
          const payload = result.in_msg.message_content.body;
          this.logger.log('Payload başarıyla çekildi.');

          const decodedPayload = await this.decodeRawPayload(payload);
          const { user_id, amount, payment_id } = decodedPayload.decodedData;
          console.log('Decoded Payload: ' + JSON.stringify(decodedPayload));

          // 4. Veritabanı Güncelleme (Atomik İşlemler)

          const stonesToAdd = parseFloat(amount) * 1000;

          // Ödeme kaydını CONFIRMED yap ve TTL'i kaldır
          const updatedPayment = await this.tonPaymentsModel.findByIdAndUpdate(
            payment_id,
            {
              $set: {
                status: ETonPaymentStatus.CONFIRMED,
                expires_at: null,
              },
            },
          );

          // Kullanıcının bakiyesini NOKTALI GÖSTERİM (DOT NOTATION) ile artır
          const updatedUser = await this.userModel.findByIdAndUpdate(user_id, {
            $inc: {
              'game_data.stones': stonesToAdd, // 🚨 Düzeltme yapıldı: Dot Notation
            },
          });

          this.logger.log(
            `ÖDEME BAŞARILI. Kullanıcı ${user_id} için ${stonesToAdd} taş eklendi.`,
          );

          transactionFoundAndProcessed = true; // İşlem bulundu ve başarıyla işlendi.
          break; // Başarılı olduğunda DÖNGÜDEN KESİNLİKLE ÇIK.
        }

        // İşlem bulunamadıysa bekleme mantığı
        if (attempt < MAX_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
        }
      } catch (error) {
        // Hata Loglama (API hatası, çözümleme hatası vb.)
        this.logger.error(
          `Deneme ${attempt + 1} başarısız oldu: ${error.message}`,
        );

        if (attempt === MAX_RETRIES - 1) {
          this.logger.error(
            `İşlem ${tx_hash} ${MAX_RETRIES} denemede bulunamadı.`,
          );
        } else {
          // Sadece son deneme değilse bekle
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
        }
      }
    }

    // İşlem başarılı ya da başarısız olsa da, fonksiyon bir değer döndürmelidir.
    if (!transactionFoundAndProcessed) {
      this.logger.warn(`İşlem ${tx_hash} tüm denemelere rağmen işlenemedi.`);
    }
  }
}
