# 🛡️ Airdrop Guardian

**Scan. Detect. Protect.**

Protège ton wallet Solana des scams d'airdrops en un simple clic.

[![Solana](https://img.shields.io/badge/Solana-black?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

---

## 🎯 Le Problème

Chaque jour, des milliers d'utilisateurs Solana reçoivent des airdrops inconnus.  

**90% sont des arnaques.**

Les scammers utilisent des tokens piégés pour :
- Vider les wallets (drainers)
- Bloquer les fonds (honeypots)
- Voler les signatures d'approbation

**Aucun outil simple n'existe pour vérifier avant de signer.**  
Les utilisateurs perdent tout en un clic par manque de visibilité.

---

## 💡 La Solution

Airdrop Guardian est un **bouclier anti-scam** qui analyse ton wallet et simule les transactions avant que tu les signes.

### Deux super-pouvoirs en un clic :

| Fonction | Résultat |
|---|---|
| 🔍 **Scan du wallet** | Liste tous tes tokens avec un badge ✅ SÛR ou ⚠️ DANGER |
| 🧪 **Simulation de transaction** | Teste une interaction suspecte et détecte les tentatives de vol |

---

## ⚙️ Comment ça fonctionne
Utilisateur → Connexion Phantom → Scan du wallet → Tokens analysés → Verdict visuel
↓
Soumission d'un contrat suspect
↓
Simulation Tenderly → Analyse → Alerte si danger

### Stack technique

- **Frontend** : React 18 + Vite + Tailwind CSS
- **Wallet** : Solana Wallet Adapter (Phantom)
- **API Scan** : Solscan Public API (tokens SPL + métadonnées)
- **API Simulation** : Tenderly Transaction Simulation
- **Hebergement** : Vercel (Edge)
- **IA** : Noah AI (vibe coding, génération de code, débogage)

---

## 🚀 Installation rapide

```bash
# 1. Cloner le projet
git clone https://github.com/TON_USERNAME/airdrop-guardian.git
cd airdrop-guardian

# 2. Installer les dépendances
npm install

# 3. Créer un fichier .env à la racine
echo "VITE_TENDERLY_ACCESS_TOKEN=ton_token_ici" > .env
echo "VITE_TENDERLY_ACCOUNT_ID=ton_account_id" > .env

# 4. Lancer en développement
npm run dev
