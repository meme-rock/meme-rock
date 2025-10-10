import "buffer";
import { useState } from "react";
import {
  TonConnectButton,
  useTonConnectUI,
  useTonAddress,
  SendTransactionRequest,
} from "@tonconnect/ui-react";

export const ProfilePage = () => {
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();
  const [transaction, setTransaction] = useState<SendTransactionRequest | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // İşlemin Base Amount'ı (Backend'e gönderilen miktar)
  const BASE_AMOUNT_TON = "0.2";

  const createPurchaseTransaction = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ton/create-purchase-stone-transaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet_address: walletAddress,
            amount: BASE_AMOUNT_TON, // Backend bu miktara göre payload'u oluşturur (msg.amount = 0.2 TON)
            user_id: "5075071123",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      const transactionData = await response.json();
      console.log(
        "Backend'den Gelen Payload İçeriği (msg.amount = 0.2 TON): ",
        transactionData
      );

      // 🚨 HATA OLUŞTURMA NOKTASI: ctx.value'yu değiştirerek kontrat kuralını ihlal ediyoruz.
      const modifiedTransactionData: SendTransactionRequest = {
        ...transactionData,
        messages: transactionData.messages.map((message: any) => ({
          ...message,
          // Kontratın beklediği miktar 0.2 TON (payload içinde).
          // Biz buraya 0.3 TON göndererek ctx.value != msg.amount yapıyoruz.
          amount: "300000000", // 0.3 TON (Daha önce 0.2 TON idi - 200,000,000 nanoTON)
        })),
      };

      console.warn(
        "TEST MODE: Gönderilen miktar 0.3 TON'a değiştirildi. (Expected Error: 31373 - Amount must be equal)"
      );
      setTransaction(modifiedTransactionData); // Değiştirilmiş objeyi state'e kaydet
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Failed to create transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ... (sendTransaction ve return kısımları aynı kalır) ...
  const sendTransaction = async () => {
    if (!transaction) {
      alert("Please create transaction first!");
      return;
    }

    try {
      // İşlem başarısız olacak, cüzdan onaylasa bile kontrat reject edecek.
      await tonConnectUI.sendTransaction(transaction);

      // Başarılı senaryo (Çok nadir çalışır, çünkü kontrat hata verecek)
      alert("Transaction sent successfully!");
      setTransaction(null);
    } catch (error) {
      // Kontrat hatası, genellikle bu catch bloğunda yakalanmaz,
      // ancak işlemin kendisi blockchain'de FAILED olarak işaretlenir.
      console.error(
        "Error sending transaction (Check blockchain for exit code 31373):",
        error
      );
      alert(
        "Transaction failed on blockchain. Check explorer for Exit Code (31373)."
      );
    }
  };

  return (
    <div>
      <TonConnectButton />
      {walletAddress && <p>Wallet Address: {walletAddress}</p>}
      {tonConnectUI.connected ? <p>Connected</p> : <p>Unconnected</p>}
      {tonConnectUI.connected && (
        <p>Account Address: {tonConnectUI.account?.address}</p>
      )}
      <div className="space-y-2">
        <button
          className="bg-green-500 text-white p-2 rounded-md hover:cursor-pointer hover:bg-green-600 disabled:opacity-50"
          onClick={createPurchaseTransaction}
          disabled={loading || !tonConnectUI.connected}
        >
          {loading
            ? "Creating Transaction..."
            : `Create Stone Purchase Transaction (${BASE_AMOUNT_TON} TON)`}
        </button>

        {transaction && (
          <button
            className="bg-blue-500 text-white p-2 rounded-md hover:cursor-pointer hover:bg-blue-600"
            onClick={sendTransaction}
          >
            Send Stone Purchase Transaction (Test Fail)
          </button>
        )}

        {transaction && (
          <div className="mt-4 p-4 bg-red-100 rounded-md border-l-4 border-red-500">
            <h3 className="font-bold text-red-700">
              TEST MODE: Transaction Will Fail!
            </h3>
            <p className="text-sm">
              Payload içinde beklenen miktar: 0.2 TON.
              <br />
              Gönderilen miktar (ctx.value): 0.3 TON.
              <br />
              Kontrat Exit Code 31373 (Amount mismatch) fırlatacak.
            </p>
            <pre className="text-xs mt-2 overflow-x-auto">
              {JSON.stringify(transaction, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
