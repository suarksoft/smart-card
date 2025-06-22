use soroban_sdk::{contracttype, Address, Env};

use crate::storage_types::{DataKey, INSTANCE_BUMP_AMOUNT, INSTANCE_LIFETIME_THRESHOLD};

#[derive(Clone)]
#[contracttype]
pub enum Admin {
    Admin(Address),
}

impl Admin {
    pub fn get(e: &Env) -> Option<Address> {
        let key = DataKey::Admin;
        e.storage().instance().get(&key)
    }
}


pub fn has_administrator(e: &Env) -> bool {
    let key = DataKey::Admin;
    e.storage().instance().has(&key)
}

pub fn read_administrator(e: &Env) -> Address {
    let key = DataKey::Admin;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_administrator(e: &Env, id: &Address) {
    let key = DataKey::Admin;
    e.storage().instance().set(&key, id);
    e.storage()
        .instance()
        .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
} 