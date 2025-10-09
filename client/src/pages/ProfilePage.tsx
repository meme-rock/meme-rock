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
            amount: "0.5", // 0.02 TON
            user_id: "5075071123",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      const transactionData = await response.json();
      console.log("transactionData: ", transactionData);
      setTransaction(transactionData);
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Failed to create transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendTransaction = async () => {
    if (!transaction) {
      alert("Please create transaction first!");
      return;
    }

    try {
      await tonConnectUI.sendTransaction(transaction);
      alert("Transaction sent successfully!");
      setTransaction(null); // Reset transaction after sending
    } catch (error) {
      console.error("Error sending transaction:", error);
      alert("Failed to send transaction. Please try again.");
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
            : "Create Stone Purchase Transaction (0.02 TON)"}
        </button>

        {transaction && (
          <button
            className="bg-blue-500 text-white p-2 rounded-md hover:cursor-pointer hover:bg-blue-600"
            onClick={sendTransaction}
          >
            Send Stone Purchase Transaction
          </button>
        )}

        {transaction && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="font-bold">Transaction Details:</h3>
            <pre className="text-xs mt-2 overflow-x-auto">
              {JSON.stringify(transaction, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
