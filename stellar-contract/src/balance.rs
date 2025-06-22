use crate::storage_types::{DataKey, INSTANCE_BUMP_AMOUNT, INSTANCE_LIFETIME_THRESHOLD};
use soroban_sdk::{Address, Env};

pub fn read_balance(e: &Env, addr: Address) -> i128 {
    let key = DataKey::Balance(addr);
    if let Some(balance) = e.storage().persistent().get::<_, i128>(&key) {
        e.storage()
            .persistent()
            .extend_ttl(&key, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        balance
    } else {
        0
    }
}

fn write_balance(e: &Env, addr: Address, amount: i128) {
    let key = DataKey::Balance(addr);
    e.storage().persistent().set(&key, &amount);
    e.storage()
        .persistent()
        .extend_ttl(&key, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

pub fn receive_balance(e: &Env, addr: Address, amount: i128) {
    let balance = read_balance(e, addr.clone());
    let new_balance = balance.checked_add(amount).expect("Integer overflow");
    write_balance(e, addr, new_balance);
}

pub fn spend_balance(e: &Env, addr: Address, amount: i128) {
    let balance = read_balance(e, addr.clone());
    if balance < amount {
        panic!("insufficient balance");
    }
    write_balance(e, addr, balance - amount);
} 