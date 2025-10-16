import React, { useState } from "react";

// AdExtra global fonksiyonunu TypeScript'e tanıtmak için
// Window interface'ini genişletiyoruz. Bu, p_adextra'yı kullanırken hata vermesini önler.
// p_adextra'nın onSuccess ve onError için parametre almadığını (veya belgede belirtilmediğini) varsayıyoruz.
// Ancak hatalarınız parametre beklendiğini gösterdiği için, fonksiyon imzasını onAdError için string parametresi alacak şekilde tanımlıyoruz.
declare global {
  interface Window {
    p_adextra: (
      onSuccess: () => void,
      onError: (error: string) => void
    ) => void;
  }
}

// Hata tiplerini doğru tanımlayarak Code 7006 ve Code 2345'i çözüyoruz.
export const TestPage = () => {
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [message, setMessage] = useState(
    "Reklamı izle ve ödül kazanmak için tıkla."
  );

  const handleShowAd = () => {
    // 1. Kütüphane Kontrolü
    // 'p_adextra' fonksiyonunun varlığını kontrol ederken, 'window' objesinde olup olmadığını kontrol edin.
    if (typeof window.p_adextra !== "function") {
      setMessage(
        "Hata: AdExtra kütüphanesi yüklenmedi. Lütfen index.html kontrol edin."
      );
      console.error("AdExtra kütüphanesi (p_adextra) yüklenmedi.");
      return;
    }

    setIsAdLoading(true);
    setMessage("Reklam Yükleniyor... Lütfen bekleyin.");

    // --- AdExtra Callback Fonksiyonları ---

    // onSuccess: Başarılı bir reklam gösterimi sonrası çağrılır.
    // Bu imza '() => void' olarak düzeltildi.
    const onAdComplete = () => {
      console.log("Reklam gösterimi tamamlandı.");
      setIsAdLoading(false);
      setMessage("Reklam tamamlandı! Ödülünüz kısa süre içinde eklenecektir.");
    };

    // onError: Hata oluştuğunda çağrılır.
    // Parametre tipi 'any' yerine 'string' (veya özel bir hata objesi) olarak belirtilmeliydi.
    // Genellikle hata mesajı veya kodu döndürülür. String kullanıyoruz.
    const onAdError = (error: string) => {
      console.error("AdExtra reklam yükleme hatası:", error);
      setIsAdLoading(false);
      setMessage(
        `Reklam yüklenirken bir sorun oluştu: ${error}. Tekrar deneyin.`
      );
    };

    // --- AdExtra Fonksiyonunu Çağırma ---
    // Callback'ler artık doğru TypeScript imzalarına sahiptir.

    window.p_adextra(onAdComplete, onAdError);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>AdExtra Entegrasyon Test Sayfası</h1>

      <p style={styles.message}>{message}</p>

      <button
        onClick={handleShowAd}
        disabled={isAdLoading}
        style={{
          ...styles.button,
          backgroundColor: isAdLoading ? "#ccc" : "#4CAF50",
        }}
      >
        {isAdLoading ? "YÜKLENİYOR..." : "REKLAM İZLE VE ÖDÜL KAZAN"}
      </button>

      <p style={styles.footer}>
        Ödül verme işlemi AdExtra webhook'u tarafından arka planda
        yürütülecektir.
      </p>
    </div>
  );
};

// Basit stil tanımları (Code 2322'yi çözmek için, stil objelerini
// React.CSSProperties tipini karşılayacak şekilde düzenledik).
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column", // Artık doğru tipte
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    color: "#333",
    marginBottom: "40px",
  },
  message: {
    fontSize: "1.1em",
    color: "#555",
    marginBottom: "20px",
  },
  button: {
    padding: "15px 30px",
    fontSize: "1.2em",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  footer: {
    marginTop: "30px",
    fontSize: "0.9em",
    color: "#888",
  },
};
