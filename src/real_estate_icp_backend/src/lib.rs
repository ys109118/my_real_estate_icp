use candid::{CandidType, Deserialize, Principal};
use ic_cdk::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone)]
pub struct Property {
    pub id: String,
    pub name: String,
    pub shares: u64,
}

#[derive(CandidType, Deserialize, Clone, Default)]
pub struct UserShares {
    pub property_shares: HashMap<String, u64>, // property_id -> shares
}

#[derive(CandidType, Deserialize, Clone, Default)]
pub struct VotingDecision {
    pub votes_yes: u64,
    pub votes_no: u64,
    pub voters: Vec<Principal>,
}

// Simple HttpResponse struct for our custom implementation
#[derive(CandidType, Deserialize)]
pub struct HttpResponse {
    pub status: u16,
    pub body: Vec<u8>,
}

thread_local! {
    static PROPERTIES: RefCell<HashMap<String, Property>> = RefCell::new(HashMap::new());
    static USER_SHARES: RefCell<HashMap<Principal, UserShares>> = RefCell::new(HashMap::new());
    static VOTING_DECISIONS: RefCell<HashMap<String, VotingDecision>> = RefCell::new(HashMap::new());
}

#[update]
fn mint_property_shares(property_id: String, amount: u64) {
    PROPERTIES.with(|properties| {
        let mut properties_map = properties.borrow_mut();
        
        if let Some(property) = properties_map.get_mut(&property_id) {
            property.shares += amount;
        } else {
            // Create a new property if it doesn't exist
            let new_property = Property {
                id: property_id.clone(),
                name: format!("Property {}", property_id),
                shares: amount,
            };
            properties_map.insert(property_id, new_property);
        }
    });
}

#[update]
fn purchase_shares_with_ckbtc(property_id: String, amount: u64) {
    let caller = ic_cdk::caller();
    
    PROPERTIES.with(|properties| {
        let mut properties_map = properties.borrow_mut();
        
        if let Some(property) = properties_map.get_mut(&property_id) {
            if property.shares >= amount {
                property.shares -= amount;
                
                USER_SHARES.with(|user_shares| {
                    let mut user_shares_map = user_shares.borrow_mut();
                    let user_share = user_shares_map.entry(caller).or_default();
                    
                    *user_share.property_shares.entry(property_id).or_default() += amount;
                });
            }
        }
    });
}

#[update]
fn transfer_shares(recipient: Principal, amount: u64) -> bool {
    let caller = ic_cdk::caller();
    
    USER_SHARES.with(|user_shares| {
        let mut user_shares_map = user_shares.borrow_mut();
        let mut total_shares = 0;
        
        // First, calculate total shares the sender has
        if let Some(sender_shares) = user_shares_map.get(&caller) {
            for (_, &shares) in sender_shares.property_shares.iter() {
                total_shares += shares;
            }
            
            if total_shares >= amount {
                // Create a plan for transfers before modifying anything
                let mut transfer_plan = Vec::new();
                
                if let Some(sender_shares) = user_shares_map.get(&caller) {
                    for (property_id, &shares) in &sender_shares.property_shares {
                        let proportion = (shares as f64) / (total_shares as f64);
                        let shares_to_transfer = (amount as f64 * proportion).floor() as u64;
                        
                        if shares_to_transfer > 0 {
                            transfer_plan.push((property_id.clone(), shares_to_transfer));
                        }
                    }
                }
                
                // Now execute the transfers
                for (property_id, shares_to_transfer) in transfer_plan {
                    // Deduct from sender
                    if let Some(sender_shares) = user_shares_map.get_mut(&caller) {
                        if let Some(shares) = sender_shares.property_shares.get_mut(&property_id) {
                            *shares -= shares_to_transfer;
                        }
                    }
                    
                    // Add to recipient
                    let recipient_shares = user_shares_map.entry(recipient).or_default();
                    *recipient_shares.property_shares.entry(property_id).or_default() += shares_to_transfer;
                }
                
                return true;
            }
        }
        
        false
    })
}

#[update]
fn distribute_rent(property_id: String, amount: u64) {
    let mut total_shares = 0;
    let mut user_shares_map = HashMap::new();
    
    // Calculate total shares for this property
    USER_SHARES.with(|user_shares| {
        for (user, shares) in user_shares.borrow().iter() {
            if let Some(&user_property_shares) = shares.property_shares.get(&property_id) {
                total_shares += user_property_shares;
                user_shares_map.insert(*user, user_property_shares);
            }
        }
    });
    
    if total_shares > 0 {
        // Distribute rent proportionally
        for (user, shares) in user_shares_map {
            let rent_share = (amount as f64 * (shares as f64) / (total_shares as f64)).floor() as u64;
            
            // In a real implementation, you would transfer tokens to the user here
            ic_cdk::println!("User {} received {} tokens as rent", user.to_string(), rent_share);
        }
    }
}

#[update]
fn vote_on_decision(decision_id: String, vote: bool) {
    let caller = ic_cdk::caller();
    let mut user_total_shares = 0;
    
    // Calculate user's total shares
    USER_SHARES.with(|user_shares| {
        if let Some(shares) = user_shares.borrow().get(&caller) {
            for (_, &property_shares) in shares.property_shares.iter() {
                user_total_shares += property_shares;
            }
        }
    });
    
    if user_total_shares > 0 {
        VOTING_DECISIONS.with(|decisions| {
            let mut decisions_map = decisions.borrow_mut();
            let decision = decisions_map.entry(decision_id).or_default();
            
            // Check if user has already voted
            if !decision.voters.contains(&caller) {
                if vote {
                    decision.votes_yes += user_total_shares;
                } else {
                    decision.votes_no += user_total_shares;
                }
                decision.voters.push(caller);
            }
        });
    }
}

#[query]
fn get_voting_result(decision_id: String) -> Option<bool> {
    VOTING_DECISIONS.with(|decisions| {
        if let Some(decision) = decisions.borrow().get(&decision_id) {
            if decision.votes_yes > decision.votes_no {
                Some(true)
            } else if decision.votes_no > decision.votes_yes {
                Some(false)
            } else {
                None // Tie
            }
        } else {
            None // No decision found
        }
    })
}

#[query]
fn http_request_test() -> HttpResponse {
    HttpResponse {
        status: 200,
        body: "<html><body><h1>ICP Real Estate Backend Running!</h1></body></html>".as_bytes().to_vec(),
    }
}

// Generate Candid interface
ic_cdk::export_candid!();