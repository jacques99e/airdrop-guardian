import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import type { TokenData, TokenPair, DexScreenerResponse, JupiterPriceResponse } from '@/types/token';
import Env from '@/envConfig';

export let connection: Connection;

// Initialize connection with proper CORS headers
const createConnection = (rpcUrl: string): Connection => {
  return new Connection(rpcUrl, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 30000,
    disableRetryOnRateLimit: true,
    wsEndpoint: undefined // Disable WebSocket to avoid connection issues
  });
};

// Initialize connection with RPC URL from environment
console.log('🔗 Initializing Solana connection with RPC:', Env.SOLANA_RPC_URL);
connection = createConnection(Env.SOLANA_RPC_URL);

// Helper function to execute RPC calls with fallback
const executeWithFallback = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3
): Promise<T> => {
  let lastError: Error | null = null;
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const result = await operation();
      if (attempts > 0) {
        console.log(`✅ ${operationName} succeeded after ${attempts + 1} attempts`);
      }
      return result;
    } catch (error) {
      lastError = error as Error;
      attempts++;
      
      // Check for network/CORS/RPC errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isNetworkError = 
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('TypeError: Failed to fetch') ||
        errorMessage.includes('403') || 
        errorMessage.includes('429') || 
        errorMessage.includes('Access forbidden') ||
        errorMessage.includes('Rate limit') ||
        errorMessage.includes('CORS') ||
        errorMessage.includes('Network Error');
      
      if (isNetworkError && attempts < maxRetries) {
        console.warn(`⚠️ ${operationName} failed (attempt ${attempts}/${maxRetries}):`, errorMessage);
        
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }
  
  throw lastError || new Error(`${operationName} failed after ${attempts} attempts`);
};

export const fetchTokenList = async (): Promise<TokenData[]> => {
  try {
    console.log('Fetching token list from Jupiter...');
    
    // Try Jupiter API with CORS support
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch('https://token.jup.ag/strict', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      mode: 'cors' // Explicitly enable CORS
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`Jupiter API returned ${response.status}, using fallback`);
      return getFallbackTokenList();
    }
    
    const tokens = await response.json();
    if (!Array.isArray(tokens)) {
      console.warn('Invalid token list format, using fallback');
      return getFallbackTokenList();
    }
    
    console.log('✅ Token list fetched successfully:', tokens.length, 'tokens');
    return tokens;
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('Token list fetch timed out, using fallback');
      } else {
        console.warn('Token list fetch failed:', error.message, 'using fallback');
      }
    }
    return getFallbackTokenList();
  }
};

// Enhanced fallback token list with more essential Solana tokens
const getFallbackTokenList = (): TokenData[] => {
  console.log('Using enhanced fallback token list with essential tokens');
  return [
    {
      address: 'So11111111111111111111111111111111111111112',
      name: 'Wrapped SOL',
      symbol: 'SOL',
      decimals: 9,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      tags: ['wrapped-sol'],
      daily_volume: 0,
      usdPrice: 0,
      created_at: '',
      freeze_authority: null,
      mint_authority: null,
      permanent_delegate: null,
      minted_at: null,
    },
    {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      tags: ['stablecoin'],
      daily_volume: 0,
      usdPrice: 1.0,
      created_at: '',
      freeze_authority: null,
      mint_authority: null,
      permanent_delegate: null,
      minted_at: null,
    },
    {
      address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
      tags: ['stablecoin'],
      daily_volume: 0,
      usdPrice: 1.0,
      created_at: '',
      freeze_authority: null,
      mint_authority: null,
      permanent_delegate: null,
      minted_at: null,
    },
    {
      address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      name: 'Raydium',
      symbol: 'RAY',
      decimals: 6,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
      tags: ['defi'],
      daily_volume: 0,
      usdPrice: 0,
      created_at: '',
      freeze_authority: null,
      mint_authority: null,
      permanent_delegate: null,
      minted_at: null,
    }
  ];
};

export const getSolBalance = async (publicKey: string): Promise<number> => {
  try {
    if (!publicKey) {
      console.warn('No public key provided for SOL balance fetch');
      return 0;
    }
    
    console.log('🔍 Fetching SOL balance for:', publicKey);
    const pubKey = new PublicKey(publicKey);
    
    const balance = await executeWithFallback(
      () => connection.getBalance(pubKey, 'confirmed'),
      'SOL balance fetch'
    );
    
    const solBalance = balance / LAMPORTS_PER_SOL;
    console.log('✅ SOL balance fetched:', solBalance, 'SOL');
    return solBalance;
  } catch (error) {
    console.error('💥 Error fetching SOL balance:', error);
    return 0;
  }
};

export const getTokenAccounts = async (publicKey: string): Promise<any[]> => {
  try {
    if (!publicKey) {
      console.warn('No public key provided for token accounts fetch');
      return [];
    }
    
    console.log('🔍 Fetching token accounts for:', publicKey);
    const pubKey = new PublicKey(publicKey);
    
    const tokenAccounts = await executeWithFallback(
      () => connection.getParsedTokenAccountsByOwner(
        pubKey,
        { programId: TOKEN_PROGRAM_ID },
        'confirmed'
      ),
      'Token accounts fetch'
    );
    
    console.log('✅ Token accounts found:', tokenAccounts.value.length);
    
    // Log account details for debugging
    tokenAccounts.value.forEach((account, index) => {
      const info = account.account.data.parsed.info;
      const tokenAmount = info.tokenAmount;
      console.log(`  Token ${index + 1}:`, {
        mint: info.mint,
        balance: tokenAmount.uiAmount,
        decimals: tokenAmount.decimals
      });
    });
    
    return tokenAccounts.value;
  } catch (error) {
    console.error('💥 Error fetching token accounts:', error);
    return [];
  }
};

export const getTokenPrices = async (tokenAddresses: string[]): Promise<JupiterPriceResponse> => {
  try {
    if (!tokenAddresses.length) {
      console.log('No token addresses provided for price fetch');
      return { prices: {} };
    }
    
    const ids = tokenAddresses.join(',');
    console.log('💲 Fetching prices for tokens:', tokenAddresses.length);
    
    // Use Jupiter API v2 for prices with timeout and CORS
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`https://api.jup.ag/price/v2?ids=${ids}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      mode: 'cors'
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn('Price API response not ok:', response.status, response.statusText);
      return { prices: {} };
    }
    
    const priceData: JupiterPriceResponse = await response.json();
    
    // Log price data for debugging
    const priceCount = Object.keys(priceData.prices || {}).length;
    console.log('✅ Prices fetched for', priceCount, 'tokens');
    
    return priceData;
  } catch (error) {
    console.error('💥 Error fetching token prices:', error);
    return { prices: {} };
  }
};

/**
 * @param tokenAddresses - comma separated token addresses
 */
export async function getTokenDataByAddress(tokenAddresses: string): Promise<TokenData[]> {
  try {
    if (!tokenAddresses) {
      return [];
    }

    console.log('Fetching token data for addresses:', tokenAddresses);
    const response = await fetch(`https://datapi.jup.ag/v1/assets/search?query=${tokenAddresses}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn('Token data not found for addresses:', tokenAddresses);
      return [];
    }

    const tokens = await response.json();
    if (!Array.isArray(tokens)) {
      console.warn('Invalid response format from Jupiter API');
      return [];
    }
    
    console.log('Token data fetched for', tokens.length, 'tokens');
    return tokens.map((token: any) => ({
      address: token.id || token.address,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      logoURI: token.icon || token.logoURI || '',
      tags: token.tags || [],
      usdPrice: token.usdPrice || 0,
      daily_volume: 0,
      created_at: token.firstPool?.createdAt || '',
      freeze_authority: token.audit?.freezeAuthorityDisabled ? null : 'enabled',
      mint_authority: token.audit?.mintAuthorityDisabled ? null : 'enabled',
      permanent_delegate: null,
      minted_at: null,
    }));
  } catch (error) {
    console.error('Error fetching token data:', error);
    return [];
  }
}

export async function getTokenAddressFromTicker(ticker: string): Promise<string | null> {
  try {
    console.log('Searching for token address:', ticker);
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${ticker}`,
      { mode: 'cors' }
    );
    const data: DexScreenerResponse = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      console.warn('No pairs found for ticker:', ticker);
      return null;
    }

    let solanaPairs = data.pairs
      .filter((pair: TokenPair) => pair.chainId === "solana")
      .sort((a: TokenPair, b: TokenPair) => (b.fdv || 0) - (a.fdv || 0));

    solanaPairs = solanaPairs.filter(
      (pair: TokenPair) =>
        pair.baseToken.symbol.toLowerCase() === ticker.toLowerCase(),
    );
    
    const address = solanaPairs[0]?.baseToken.address || null;
    console.log('Token address found:', address, 'for ticker:', ticker);
    return address;
  } catch (error) {
    console.error('Error getting token address from ticker:', error);
    return null;
  }
}

export const getTokenBalance = async (walletAddress: string, tokenMintAddress: string): Promise<number> => {
  try {
    if (!walletAddress || !tokenMintAddress) return 0;
    
    console.log('Fetching token balance for:', tokenMintAddress);
    const walletPublicKey = new PublicKey(walletAddress);
    const tokenMintPublicKey = new PublicKey(tokenMintAddress);
    
    const tokenAccount = await getAssociatedTokenAddress(
      tokenMintPublicKey,
      walletPublicKey
    );
    
    const accountInfo = await executeWithFallback(
      () => getAccount(connection, tokenAccount),
      'Token balance fetch'
    );
    
    const balance = Number(accountInfo.amount);
    console.log('Token balance:', balance, 'for mint:', tokenMintAddress);
    return balance;
  } catch (error) {
    // This is expected for tokens the user doesn't hold
    console.log('Token account not found for mint:', tokenMintAddress);
    return 0;
  }
};
