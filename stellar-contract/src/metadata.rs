use soroban_sdk::{Env, String};
use soroban_token_sdk::metadata::{TokenMetadata, META_KEY};

pub fn write_metadata(e: &Env, metadata: TokenMetadata) {
    e.storage().instance().set(&META_KEY, &metadata);
}

pub fn read_metadata(e: &Env) -> TokenMetadata {
    e.storage().instance().get(&META_KEY).unwrap()
}

pub fn read_decimal(e: &Env) -> u32 {
    read_metadata(e).decimal
}

pub fn read_name(e: &Env) -> String {
    read_metadata(e).name
}

pub fn read_symbol(e: &Env) -> String {
    read_metadata(e).symbol
} 