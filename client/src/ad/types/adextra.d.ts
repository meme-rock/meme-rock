// types/adextra.d.ts

/**
 * AdExtra'nın global `window` nesnesindeki TypeScript tanımlamaları.
 */
declare global {
  interface Window {
    /**
     * AdExtra reklamını göstermek için kullanılan global fonksiyon.
     * @param onSuccess Reklam başarıyla tamamlandığında çağrılan callback.
     * @param onError Reklam gösteriminde bir hata oluştuğunda veya reklam bulunamadığında çağrılan callback.
     */
    p_adextra: (onSuccess?: () => void, onError?: () => void) => void;
  }
}

// Bu dosyanın bir modül olduğunu belirtmek için bu satır gereklidir.
export {};
