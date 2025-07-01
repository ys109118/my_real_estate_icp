import { Actor } from "@dfinity/agent";
import { idlFactory, canisterId } from "../../../declarations/real_estate_icp_backend";

class PropertyService {
    constructor(identity) {
        this.identity = identity;
        this.actor = null;
    }

    async initialize(agent) {
        if (!agent) return false;
        
        try {
            this.actor = Actor.createActor(idlFactory, {
                agent,
                canisterId
            });
            return true;
        } catch (error) {
            console.error("Failed to initialize property service:", error);
            return false;
        }
    }

    async mintPropertyShares(propertyId, amount) {
        if (!this.actor) throw new Error("Service not initialized");
        
        try {
            await this.actor.mint_property_shares(propertyId, BigInt(amount));
            return true;
        } catch (error) {
            console.error("Error minting property shares:", error);
            throw error;
        }
    }

    async purchaseShares(propertyId, amount) {
        if (!this.actor) throw new Error("Service not initialized");
        
        try {
            await this.actor.purchase_shares_with_ckbtc(propertyId, BigInt(amount));
            return true;
        } catch (error) {
            console.error("Error purchasing shares:", error);
            throw error;
        }
    }

    async distributeRent(propertyId, amount) {
        if (!this.actor) throw new Error("Service not initialized");
        
        try {
            await this.actor.distribute_rent(propertyId, BigInt(amount));
            return true;
        } catch (error) {
            console.error("Error distributing rent:", error);
            throw error;
        }
    }

    async transferShares(recipient, amount) {
        if (!this.actor) throw new Error("Service not initialized");
        
        try {
            const result = await this.actor.transfer_shares(recipient, BigInt(amount));
            return result;
        } catch (error) {
            console.error("Error transferring shares:", error);
            throw error;
        }
    }

    async voteOnDecision(decisionId, vote) {
        if (!this.actor) throw new Error("Service not initialized");
        
        try {
            await this.actor.vote_on_decision(decisionId, vote);
            return true;
        } catch (error) {
            console.error("Error voting on decision:", error);
            throw error;
        }
    }

    async getVotingResult(decisionId) {
        if (!this.actor) throw new Error("Service not initialized");
        
        try {
            return await this.actor.get_voting_result(decisionId);
        } catch (error) {
            console.error("Error getting voting result:", error);
            throw error;
        }
    }
}

export default PropertyService;