// mint-soroban.js
import { spawn } from "child_process";
import dotenv from "dotenv";
dotenv.config();

// Sabit değerler
const CONTRACT_ID = process.env.CONTRACT_ID || "CABMEP42UH27TWH6R4DHYJAKUDW5BKADDBNEZHCT62MTL5EMUDTNKPZT";
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "SCWVKVGN6KRXWF37OD2OZAM2VPQWQL7HV4QYLOSYB6HC4Z5M77A2VEG3";
// Not: ADMIN_PUBLIC_KEY backend/index.js içinde .env'den okunuyor. Buradaki sadece referans içindir.
const ADMIN_PUBLIC_KEY_REFERENCE = "GA2ZDX3GMACMNLCTLPVWPYV2W4PXNWGL654VYSQREYVX6JAJGOGM6SNY";
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
const SOROBAN_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

function sorobanCli(command, sourceAccount) {
  return new Promise((resolve, reject) => {
    const baseArgs = [
      "contract",
      "invoke",
      "--id",
      CONTRACT_ID,
      "--source-account",
      sourceAccount || ADMIN_SECRET_KEY, // Belirtilmemişse admin kullan
      "--rpc-url",
      SOROBAN_RPC_URL,
      "--network-passphrase",
      SOROBAN_NETWORK_PASSPHRASE,
      "--",
    ];

    const commandArgs = command.split(" ");
    const allArgs = baseArgs.concat(commandArgs);
    
    console.log("🚀 Spawning Soroban CLI:", "soroban", allArgs.join(" "));

    const sorobanProcess = spawn("soroban", allArgs);

    let stdout = "";
    let stderr = "";

    sorobanProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    sorobanProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    sorobanProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("❌ Soroban CLI Error Details:");
        console.error(`➡️  Command: soroban ${allArgs.join(" ")}`);
        console.error(`➡️  Exit Code: ${code}`);
        console.error(`➡️  Stdout: ${stdout}`);
        console.error(`➡️  Stderr: ${stderr}`);
        return reject(new Error(`Soroban CLI Error: ${stderr.trim()}`));
      }
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (e) {
        resolve(stdout.trim());
      }
    });

    sorobanProcess.on('error', (err) => {
      console.error('Failed to start subprocess.', err);
      reject(err);
    });
  });
}

export async function mintTokenToUser(wallet, amount) {
  console.log(`🎁 Minting ${amount} SHT to ${wallet} on testnet...`);
  const amountXdr = amount * 10**7; 
  return sorobanCli(`mint --to ${wallet} --amount ${amountXdr}`);
}

export async function getBalanceOf(wallet) {
  console.log(`💰 Fetching balance for ${wallet} from testnet...`);
  const balanceResult = await sorobanCli(`balance --id ${wallet}`);
  
  if (balanceResult) {
    return parseInt(balanceResult) / 10**7;
  }
  return 0;
}

export async function transferTokens(fromWallet, toWallet, amount) {
  console.log(`💸 Transfer işlemi: ${amount} SHT, ${fromWallet} cüzdanından yakılıp, ${toWallet} cüzdanına mint edilecek...`);
  const amountXdr = amount * 10**7; 

  try {
    // Adım 1: Kullanıcının cüzdanından token'ları yak (burn)
    // Bu işlem için kaynak hesap (source-account) admin olmalı çünkü kontratta yetki admin'de.
    console.log(`🔥 Adım 1: ${amount} SHT, ${fromWallet} cüzdanından yakılıyor...`);
    await sorobanCli(`burn --from ${fromWallet} --amount ${amountXdr}`, ADMIN_SECRET_KEY);
    console.log("✅ Yakma işlemi başarılı.");

    // Adım 2: Adminin cüzdanına aynı miktarda token mint et
    console.log(`🌱 Adım 2: ${amount} SHT, ${toWallet} (admin) cüzdanına mint ediliyor...`);
    const mintResult = await sorobanCli(`mint --to ${toWallet} --amount ${amountXdr}`, ADMIN_SECRET_KEY);
    console.log("✅ Mint etme işlemi başarılı.");
    
    // İşlem başarılı, transaction hash'ini veya bir başarı objesini dön
    // Gerçek tx hash'i mint işleminden dönecektir.
    return {
      success: true,
      txHash: mintResult || `transfer-op-${Date.now()}`,
      isMock: false
    };

  } catch (error) {
    console.error("⚠️ Token transfer (burn-and-mint) işlemi başarısız oldu:", error);
    // Hata durumunda, hatayı yukarıya fırlat ki index.js'deki catch bloğu yakalasın.
    throw error;
  }
}