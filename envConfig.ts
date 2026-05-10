/// <reference types="vite/client" />

const Env = {
  SOLANA_RPC_URL: import.meta.env.VITE_REACT_APP_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
};

export default Env;
