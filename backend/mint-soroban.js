// mint-soroban.js
import { exec } from "child_process";
import dotenv from "dotenv";
dotenv.config();

// Sabit değerler
const CONTRACT_ID = process.env.CONTRACT_ID || "CABMEP42UH27TWH6R4DHYJAKUDW5BKADDBNEZHCT62MTL5EMUDTNKPZT";
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "SCWVKVGN6KRXWF37OD2OZAM2VPQWQL7HV4QYLOSYB6HC4Z5M77A2VEG3";
const ADMIN_PUBLIC_KEY = "GASUZBOCEEYODKEA6M2RYVNADFVBSANCPYNZLWXWX4IQV2IHQTSDBJQE"; // Admin public key
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
const SOROBAN_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

function sorobanCli(command) {
  return new Promise((resolve, reject) => {
    const fullCommand = `soroban contract invoke --id ${CONTRACT_ID} --source-account ${ADMIN_SECRET_KEY} --rpc-url ${SOROBAN_RPC_URL} --network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}" -- ${command}`;
    
    exec(fullCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        console.error(`stderr: ${stderr}`);
        return reject(new Error(`Soroban CLI Error: ${stderr}`));
      }
      // Soroban CLI'dan gelen JSON string'i parse edelim
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (e) {
        resolve(stdout.trim());
      }
    });
  });
}

export async function mintTokenToUser(wallet, amount) {
  console.log(`🎁 Minting ${amount} SHT to ${wallet} on testnet...`);
  // Soroban'da amount 7 ondalık basamakla gönderilmeli
  const amountXdr = amount * 10**7; 
  return sorobanCli(`mint --to "${wallet}" --amount "${amountXdr}"`);
}

export async function getBalanceOf(wallet) {
  console.log(`💰 Fetching balance for ${wallet} from testnet...`);
  const balanceResult = await sorobanCli(`balance --id "${wallet}"`);
  
  // Dönen değer 7 ondalık basamaklı olacağından düzeltelim
  return parseInt(balanceResult) / 10**7;
}

export async function transferTokens(toWallet, amount) {
  console.log(`💸 Transferring ${amount} SHT from ${ADMIN_PUBLIC_KEY} to ${toWallet} on testnet...`);
  // Soroban'da amount 7 ondalık basamakla gönderilmeli
  const amountXdr = amount * 10**7; 
  return sorobanCli(`transfer --from "${ADMIN_PUBLIC_KEY}" --to "${toWallet}" --amount "${amountXdr}"`);
}