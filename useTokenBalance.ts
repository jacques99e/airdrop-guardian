import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { getTokenAccounts, getSolBalance, connection, getTokenDataByAddress } from '@/lib/tokenService';
import { useTokenList } from './useTokenList';
import type { TokenData, JupiterPriceResponse } from '@/types/token';

export interface UserTokenBalance {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    balance: number;
    balanceInUsd: number;
    logoURI: string;
    price: number;
}

export const useTokenBalance = () => {
    const { publicKey, connected } = useWallet();
    // Use our configured connection instead of wallet adapter connection
    const { tokenList, loading: tokenListLoading } = useTokenList();
    const [userTokenBalances, setUserTokenBalances] = useState<UserTokenBalance[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBalances = useCallback(async () => {
        if (!connected || !publicKey || !tokenList.length) {
            if (!connected) console.log('❌ Wallet not connected');
            if (!publicKey) console.log('❌ No public key');
            if (!tokenList.length) console.log('❌ Token list not loaded');
            
            // Still try to set empty balances instead of returning early
            if (!connected || !publicKey) {
                setUserTokenBalances([]);
            }
            
            setUserTokenBalances([]);
            return;
        }

        setLoading(true);
        setError(null);

        console.log('🚀 Fetching balances for wallet:', publicKey.toString());
        console.log('📋 Token list status:', tokenList.length > 0 ? `${tokenList.length} tokens loaded` : 'Using fallback tokens');
        console.log('📋 Token list loaded with', tokenList.length, 'tokens');

        try {
            // Test connection first
            const slot = await connection.getSlot();
            console.log('✅ Connected to Solana mainnet, current slot:', slot);
            
            // Fetch SOL balance and token accounts in parallel
            const [solBalance, tokenAccounts] = await Promise.all([
                getSolBalance(publicKey.toString()),
                getTokenAccounts(publicKey.toString())
            ]);
            
            console.log('💰 SOL Balance:', solBalance);
            console.log('🪙 Token Accounts found:', tokenAccounts.length);
            
            // Create a map for faster token lookup
            const tokenMap = new Map(tokenList.map((t: TokenData) => [t.address, t]));
            
            // Collect unknown token addresses for batch lookup
            const unknownTokenAddresses: string[] = [];
            const allBalances: UserTokenBalance[] = [];
            
            // Add SOL balance if > 0
            if (solBalance > 0) {
                allBalances.push({
                    address: 'So11111111111111111111111111111111111111112',
                    symbol: 'SOL',
                    name: 'Solana',
                    decimals: 9,
                    balance: solBalance,
                    balanceInUsd: solBalance * 200, // SOL price hardcoded to $200
                    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
                    price: 200, // SOL price set to $200
                });
            }

            for (const acc of tokenAccounts) {
                try {
                    const info = acc?.account?.data?.parsed?.info;
                    const tokenAmount = info?.tokenAmount;
                    const mint = info?.mint;
                    
                    console.log(`  Processing token:`, { mint, balance: tokenAmount?.uiAmount, decimals: tokenAmount?.decimals });
                    
                    if (!info || !tokenAmount) continue;
                    
                    // Get the actual balance with proper decimal conversion
            const rawBalance = tokenAmount.amount || '0';
            const decimals = tokenAmount.decimals || 0;
            const balance = parseFloat(rawBalance) / Math.pow(10, decimals);
            
            console.log(`  Token ${mint}: Raw=${rawBalance}, Decimals=${decimals}, Balance=${balance}`);
                    // Include tokens with any positive balance, even very small amounts
                    if (balance <= 0) {
                        console.log(`  ⏭️ Skipping token ${mint} with zero balance`);
                        continue;
                    }
                    
                    const tokenMetadata = tokenMap.get(mint);
                            
                    if (tokenMetadata) {
                        // Known token from our token list
                        allBalances.push({
                            address: mint,
                            symbol: tokenMetadata.symbol,
                            name: tokenMetadata.name,
                            decimals: decimals,
                            balance: balance,
                            balanceInUsd: balance * (tokenMetadata.usdPrice || 0),
                            logoURI: tokenMetadata.logoURI || '',
                            price: tokenMetadata.usdPrice || 0,
                        });
                        console.log(`  ✅ Added known token: ${tokenMetadata.symbol} (${balance})`);
                    } else {
                        // Collect unknown token for batch lookup
                        console.log(`  ❓ Unknown token ${mint}: ${balance} - will fetch metadata`);
                        unknownTokenAddresses.push(mint);
                    }
                } catch (tokenError) {
                    console.warn('Error processing token account:', tokenError);
                }
            }

            // Batch fetch metadata for unknown tokens
            if (unknownTokenAddresses.length > 0) {
                console.log(`🔍 Fetching metadata for ${unknownTokenAddresses.length} unknown tokens`);
                try {
                    const unknownTokensData = await getTokenDataByAddress(unknownTokenAddresses.join(','));
                    const unknownTokenMap = new Map(unknownTokensData.map(t => [t.address, t]));
                    
                    // Now process unknown tokens with their metadata
                    for (const acc of tokenAccounts) {
                        try {
                            const info = acc?.account?.data?.parsed?.info;
                            const tokenAmount = info?.tokenAmount;
                            const mint = info?.mint;
                            
                            if (!info || !tokenAmount || !mint) continue;
                            
                            const rawBalance = tokenAmount.amount || '0';
                            const decimals = tokenAmount.decimals || 0;
                            const balance = parseFloat(rawBalance) / Math.pow(10, decimals);
                            
                            if (balance <= 0) continue;
                            
                            // Skip if already processed as known token
                            if (tokenMap.has(mint)) continue;
                            
                            const fetchedTokenData = unknownTokenMap.get(mint);
                            if (fetchedTokenData) {
                                allBalances.push({
                                    address: mint,
                                    symbol: fetchedTokenData.symbol,
                                    name: fetchedTokenData.name,
                                    decimals: fetchedTokenData.decimals,
                                    balance: balance,
                                    balanceInUsd: balance * (fetchedTokenData.usdPrice || 0),
                                    logoURI: fetchedTokenData.logoURI || '',
                                    price: fetchedTokenData.usdPrice || 0,
                                });
                                console.log(`  ✅ Added fetched token: ${fetchedTokenData.symbol} (${balance})`);
                            } else {
                                // Still unknown after API call - add with basic info
                                allBalances.push({
                                    address: mint,
                                    symbol: `${mint.slice(0, 4)}...${mint.slice(-4)}`,
                                    name: 'Unknown Token',
                                    decimals: decimals,
                                    balance: balance,
                                    balanceInUsd: 0, // No price data available
                                    logoURI: '',
                                    price: 0, // No price data available
                                });
                                console.log(`  ⚠️ Added unknown token: ${mint.slice(0, 8)}... (${balance})`);
                            }
                        } catch (tokenError) {
                            console.warn('Error processing unknown token:', tokenError);
                        }
                    }
                } catch (metadataError) {
                    console.warn('Error fetching token metadata:', metadataError);
                    
                    // Fallback: add unknown tokens with basic info
                    for (const acc of tokenAccounts) {
                        try {
                            const info = acc?.account?.data?.parsed?.info;
                            const tokenAmount = info?.tokenAmount;
                            const mint = info?.mint;
                            
                            if (!info || !tokenAmount || !mint) continue;
                            if (tokenMap.has(mint)) continue; // Skip known tokens
                            
                            const rawBalance = tokenAmount.amount || '0';
                        const decimals = tokenAmount.decimals || 0;
                        const balance = parseFloat(rawBalance) / Math.pow(10, decimals);
                        
                            if (balance <= 0) continue;
                            
                            allBalances.push({
                                address: mint,
                                symbol: `${mint.slice(0, 4)}...${mint.slice(-4)}`,
                                name: 'Unknown Token',
                                decimals: decimals,
                                balance: balance,
                                balanceInUsd: 0, // No price data available
                                logoURI: '',
                                price: 0, // No price data available
                            });
                        } catch (fallbackError) {
                            console.warn('Error in fallback token processing:', fallbackError);
                        }
                    }
                }
            }

            console.log('📊 All balances before pricing:', allBalances.length);

            // Handle SOL price separately - hardcoded to $200
            const solToken = allBalances.find(token => token.symbol === 'SOL');
            if (solToken) {
                // SOL price hardcoded to $200
                solToken.price = 200;
                solToken.balanceInUsd = solToken.balance * 200;
                console.log('📊 SOL token found, price set to $200');
            }

            console.log('🎉 Final balances loaded:', allBalances.length);
            allBalances.forEach(token => {
                console.log(`  💰 ${token.symbol}: Balance=${token.balance.toLocaleString()}, Price=$${token.price?.toFixed(8)}, Value=$${token.balanceInUsd.toFixed(2)}`);
            });

            setUserTokenBalances(allBalances);
            
        } catch (err) {
            console.error('💥 Error in fetchBalances:', err);
            setError('Failed to fetch token balances');
        } finally {
            setLoading(false);
        }
    }, [connected, publicKey, tokenList]);

    useEffect(() => {
        fetchBalances();
    }, [fetchBalances]);

    const getTotalValue = useCallback(() => {
        if (!userTokenBalances.length) {
            return '0.00';
        }
        return userTokenBalances.reduce((total: number, token:UserTokenBalance) => total + token.balanceInUsd, 0).toFixed(2);
    }, [userTokenBalances]);

    return {
        userTokenBalances,
        tokenList,
        loading: loading || tokenListLoading,
        error,
        connected,
        fetchBalances,
        getTotalValue,
    };
}; 