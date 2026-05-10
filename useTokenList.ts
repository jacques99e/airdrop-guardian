import { useState, useEffect } from 'react';
import { fetchTokenList } from '@/lib/tokenService';
import type { TokenData } from '@/types/token';

export const useTokenList = () => {
    const [tokenList, setTokenList] = useState<TokenData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTokenList = async () => {
            try {
                setLoading(true);
                setError(null);
                const tokens = await fetchTokenList();
                setTokenList(tokens);
                console.log('Token list loaded in hook:', tokens.length, 'tokens');
            } catch (err) {
                console.error('Token list loading error:', err);
                setError('Failed to load token list, using fallback');
                // Don't set empty array on error, let the service return fallback tokens
            } finally {
                setLoading(false);
            }
        };

        loadTokenList();
    }, []);

    return { tokenList, loading, error };
};
