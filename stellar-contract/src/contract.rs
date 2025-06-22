//src/contract.rs
use soroban_sdk::symbol_short;
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol};
use soroban_token_sdk::{metadata::TokenMetadata, TokenUtils};

const ADMIN_KEY: Symbol = symbol_short!("admin");
const META_KEY: Symbol = symbol_short!("meta");
const WATER_CARD_KEY: Symbol = symbol_short!("wtrcard");

#[contract]
pub struct WaterToken;

#[contractimpl]
impl WaterToken {
    pub fn initialize(e: Env, admin: Address, decimal: u32, name: String, symbol: String) {
        e.storage().instance().set(&ADMIN_KEY, &admin);
        e.storage().instance().set(
            &META_KEY,
            &TokenMetadata {
                decimal,
                name,
                symbol,
            },
        );
    }

    // Su kartını kullanıcı hesabına kaydet
    pub fn register_water_card(e: Env, user: Address, card_id: String) {
        let admin: Address = e.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();
        e.storage().instance().set(&card_id, &user);
    }

    // Kullanıcıya su hakkı tokenlerini mint et
    pub fn mint(e: Env, to: Address, amount: i128) {
        let admin: Address = e.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();
        let mut balance: i128 = e.storage().instance().get(&to).unwrap_or(0);
        balance += amount;
        e.storage().instance().set(&to, &balance);
        TokenUtils::new(&e).events().mint(admin, to, amount);
    }

    // Su tasarrufu ödülünü mint et
    pub fn mint_conservation_reward(e: Env, to: Address, amount: i128) {
        let admin: Address = e.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();
        let mut balance: i128 = e.storage().instance().get(&to).unwrap_or(0);
        balance += amount;
        e.storage().instance().set(&to, &balance);
        TokenUtils::new(&e).events().mint(admin, to, amount);
    }

    // Kullanıcılar arasında token transferi
    pub fn transfer(e: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let mut from_balance: i128 = e.storage().instance().get(&from).unwrap_or(0);
        let mut to_balance: i128 = e.storage().instance().get(&to).unwrap_or(0);
        if from_balance < amount {
            panic!("Yetersiz su hakkı bakiyesi");
        }
        from_balance -= amount;
        to_balance += amount;
        e.storage().instance().set(&from, &from_balance);
        e.storage().instance().set(&to, &to_balance);
        TokenUtils::new(&e).events().transfer(from, to, amount);
    }

    // Topluluk su fonuna bağış yap
    pub fn donate_to_fund(e: Env, from: Address, amount: i128) {
        from.require_auth();
        let fund_address: Address = e.storage().instance().get(&symbol_short!("fund")).unwrap();
        let mut from_balance: i128 = e.storage().instance().get(&from).unwrap_or(0);
        let mut fund_balance: i128 = e.storage().instance().get(&fund_address).unwrap_or(0);
        if from_balance < amount {
            panic!("Yetersiz su hakkı bakiyesi");
        }
        from_balance -= amount;
        fund_balance += amount;
        e.storage().instance().set(&from, &from_balance);
        e.storage().instance().set(&fund_address, &fund_balance);
        TokenUtils::new(&e)
            .events()
            .transfer(from, fund_address, amount);
    }

    pub fn balance(e: Env, id: Address) -> i128 {
        e.storage().instance().get(&id).unwrap_or(0)
    }
}
