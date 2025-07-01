import { useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import Button from "./ui/Button";
import Card from "./ui/Card";
import CardContent from "./ui/CardContent";
import Input from "./ui/Input";
import PropertyService from "../services/PropertyService";

export default function RealEstateApp() {
    const [properties, setProperties] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [purchaseAmount, setPurchaseAmount] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userPrincipal, setUserPrincipal] = useState(null);
    const [propertyService, setPropertyService] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize ICP authentication and canister actor
    useEffect(() => {
        async function initAuth() {
            try {
                setIsLoading(true);
                const authClient = await AuthClient.create();
                
                if (await authClient.isAuthenticated()) {
                    const identity = await authClient.getIdentity();
                    const principal = identity.getPrincipal().toString();
                    setUserPrincipal(principal);
                    setIsAuthenticated(true);
                    
                    // Initialize agent and property service
                    const agent = new HttpAgent({ identity });
                    
                    // Fetch root key for local development
                    if (process.env.DFX_NETWORK !== "ic") {
                        await agent.fetchRootKey();
                    }
                    
                    const service = new PropertyService(identity);
                    await service.initialize(agent);
                    setPropertyService(service);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error("Authentication error:", err);
                setError("Failed to initialize authentication");
            } finally {
                setIsLoading(false);
            }
        }
        
        initAuth();
    }, []);

    // Load sample properties since getProperties doesn't exist in the backend
    useEffect(() => {
        if (propertyService) {
            // Sample data until backend implements get_properties
            setProperties([
                { id: "property1", name: "Luxury Apartment Complex", shares: 1000n },
                { id: "property2", name: "Commercial Office Building", shares: 5000n },
                { id: "property3", name: "Residential Housing Development", shares: 3000n }
            ]);
        }
    }, [propertyService]);

    const login = async () => {
        try {
            const authClient = await AuthClient.create();
            
            authClient.login({
                identityProvider: process.env.DFX_NETWORK === "ic" 
                    ? "https://identity.ic0.app" 
                    : `http://localhost:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`,
                onSuccess: async () => {
                    const identity = await authClient.getIdentity();
                    const principal = identity.getPrincipal().toString();
                    setUserPrincipal(principal);
                    setIsAuthenticated(true);
                    
                    // Initialize agent and property service
                    const agent = new HttpAgent({ identity });
                    
                    // Fetch root key for local development
                    if (process.env.DFX_NETWORK !== "ic") {
                        await agent.fetchRootKey();
                    }
                    
                    const service = new PropertyService(identity);
                    await service.initialize(agent);
                    setPropertyService(service);
                },
                onError: (error) => {
                    console.error("Login failed:", error);
                    setError("Login failed. Please try again.");
                }
            });
        } catch (err) {
            console.error("Login error:", err);
            setError("Failed to initialize login");
        }
    };

    // Purchase property shares
    const purchaseShares = async () => {
        if (!selectedProperty || !propertyService || purchaseAmount <= 0) return;
        
        try {
            setIsLoading(true);
            await propertyService.purchaseShares(selectedProperty, purchaseAmount);
            alert("Purchase successful!");
            
            // Refresh properties (would need backend implementation)
            // For now, just update the local state
            setProperties(properties.map(prop => 
                prop.id === selectedProperty 
                    ? {...prop, shares: prop.shares + BigInt(purchaseAmount)} 
                    : prop
            ));
        } catch (error) {
            console.error("Error purchasing shares:", error);
            alert("Purchase failed: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Real Estate Tokenization Platform</h1>
            
            {isAuthenticated ? (
                <div>
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <p className="text-sm">Logged in as: <span className="font-mono">{userPrincipal}</span></p>
                    </div>
                    
                    <h2 className="text-2xl font-semibold mb-4">Available Properties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {properties.map((property) => (
                            <Card 
                                key={property.id} 
                                onClick={() => setSelectedProperty(property.id)}
                                className={selectedProperty === property.id ? "border-blue-500 border-2" : ""}
                            >
                                <CardContent>
                                    <h3 className="text-xl font-semibold">{property.name}</h3>
                                    <p className="mt-2">Available Shares: {property.shares.toString()}</p>
                                    <p className="text-sm text-gray-500 mt-1">ID: {property.id}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    
                    {selectedProperty && (
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4">
                                Purchase Shares for {properties.find(p => p.id === selectedProperty)?.name}
                            </h2>
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Amount of Shares</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={purchaseAmount}
                                        onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                                <Button onClick={purchaseShares} className="px-8">
                                    Buy Shares
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="mb-6">Please log in to interact with properties.</p>
                    <Button onClick={login} className="px-8 py-3">
                        Login with Internet Identity
                    </Button>
                </div>
            )}
        </div>
    );
}