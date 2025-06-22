// mint-test.js


import { mintTokenToUser } from './mint-soroban.js';

const WALLET_ADDRESS = "GAELIPRPRLJFET6FWVU4KN3R32Z7WH3KCHPTVIJOIYLYIWFUWT2NXJFE";
const TOKEN_AMOUNT = 10000;

async function testMint() {
  try {
    console.log(`🎁 ${TOKEN_AMOUNT} SHT token mint ediliyor...`);
    console.log(`📍 Hedef cüzdan: ${WALLET_ADDRESS}`);
    
    const result = await mintTokenToUser(WALLET_ADDRESS, TOKEN_AMOUNT);
    
    console.log(`✅ Mint işlemi başarılı!`);
    console.log(`📋 Sonuç:`, result);
    
  } catch (error) {
    console.error(`❌ Mint işlemi başarısız:`, error.message);
  }
}

testMint(); 