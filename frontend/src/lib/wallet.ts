import * as freighterApi from "@stellar/freighter-api";

export async function connectWallet(): Promise<string> {
  try {
    const accessObj = await freighterApi.requestAccess();
    
    if (accessObj.error) {
      console.error("❌ Erişim reddedildi:", accessObj.error);
      throw new Error("Freighter'a erişim izni verilmedi.");
    }

    if (!accessObj.address) {
      throw new Error("Cüzdan adresi alınamadı. Freighter'da bir hesap seçili olduğundan emin olun.");
    }

    console.log("✅ Cüzdan başarıyla bağlandı:", accessObj.address);
    return accessObj.address;
  } catch (error) {
    console.error("❌ Cüzdan bağlantı hatası:", error);
    
    if (error instanceof Error) {
        if (error.message.includes("Freighter is not installed")) {
            throw new Error("Freighter eklentisi bulunamadı. Lütfen kurup tekrar deneyin.");
        }
        throw error;
    }
    
    throw new Error("Cüzdan bağlantısı başarısız oldu. Lütfen tekrar deneyin.");
  }
}