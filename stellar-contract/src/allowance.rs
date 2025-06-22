use crate::storage_types::{AllowanceDataKey, AllowanceValue, INSTANCE_BUMP_AMOUNT, INSTANCE_LIFETIME_THRESHOLD, DataKey};
use soroban_sdk::{Address, Env};

pub fn read_allowance(e: &Env, from: Address, spender: Address) -> AllowanceValue {
    let key = DataKey::Allowance(AllowanceDataKey { from, spender });
    if let Some(allowance) = e.storage().temporary().get::<_, AllowanceValue>(&key) {
        if allowance.expiration_ledger < e.ledger().sequence() {
            AllowanceValue {
                amount: 0,
                expiration_ledger: allowance.expiration_ledger,
            }
        } else {
            allowance
        }
    } else {
        AllowanceValue {
            amount: 0,
            expiration_ledger: 0,
        }
    }
}

pub fn write_allowance(
    e: &Env,
    from: Address,
    spender: Address,
    amount: i128,
    expiration_ledger: u32,
) {
    let allowance = AllowanceValue {
        amount,
        expiration_ledger,
    };
    let key = DataKey::Allowance(AllowanceDataKey { from, spender });
    e.storage().temporary().set(&key, &allowance);

    // Set the TTL to be the minimum of the normal TTL and the maximum of the allowance TTL
    let max_ttl = e.storage().max_ttl();
    let min_ttl = expiration_ledger.saturating_sub(e.ledger().sequence());
    e.storage()
        .temporary()
        .extend_ttl(&key, core::cmp::min(max_ttl, min_ttl));
}

pub fn spend_allowance(e: &Env, from: Address, spender: Address, amount: i128) {
    let allowance = read_allowance(e, from.clone(), spender.clone());
    if allowance.amount < amount {
        panic!("insufficient allowance");
    }
    write_allowance(
        e,
        from,
        spender,
        allowance.amount - amount,
        allowance.expiration_ledger,
    );
} 