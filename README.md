<p align="center">
  <img src="https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana Devnet" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Anchor-0.30-blueviolet?style=for-the-badge" alt="Anchor" />
  <img src="https://img.shields.io/badge/ElevenLabs-Voice_AI-000000?style=for-the-badge" alt="ElevenLabs" />
  <img src="https://img.shields.io/badge/Gemini-Vision_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
</p>


# Smart Contract Address devnet(Devnet): 4k8UjX74M3hbkLugsJFypVrqMviKTQqt51Y715QLSghp
# Siyakhula — *We Are Growing*

**AI-verified crop funding on Solana. Empowering African farmers through milestone-based investment.**

Siyakhula (isiZulu: "We are growing") is a decentralized application that bridges the trust gap between small-scale African farmers and global investors. By combining on-chain transparency with AI-powered verification, we make agricultural funding accountable, accessible, and fair — from seed to harvest.

---

## The Problem

Small-scale farmers across sub-Saharan Africa produce over 70% of the continent's food supply, yet they remain largely excluded from formal capital markets. The core barriers are systemic:

- **No verifiable track record.** Farmers operate without credit histories, audited financials, or digital footprints that traditional lenders require.
- **Zero transparency for investors.** Funders have no reliable way to monitor how capital is deployed, whether crops are progressing, or when milestones are actually reached.
- **Exploitative intermediaries.** Existing microfinance and cooperative structures often extract disproportionate fees, leaving farmers with a fraction of the value they create.
- **No collateral framework.** Land rights are informal, equipment is unregistered, and future harvest value is unquantifiable — making risk assessment nearly impossible.

The result: billions in potential agricultural investment sit on the sidelines while fertile land goes unfunded.

---

## The Solution

Siyakhula replaces trust assumptions with cryptographic proof and AI verification. Every rand of funding is tracked on Solana, every crop photo is analyzed by Gemini Vision AI, and every farmer interaction happens through natural voice — not forms.

### How It Works

```
Farmer speaks into phone
        ↓
ElevenLabs transcribes & registers the farm
        ↓
Farmer uploads collateral documentation
        ↓
Gemini AI verifies collateral & crop images
        ↓
Smart contract escrows investor funds
        ↓
Milestones unlock funds progressively
        ↓
Harvest → Profit split → Everyone grows
```

**For Farmers:**
- Voice-first onboarding — no forms, no friction, no wallet setup required
- Milestone-based fund releases tied to verified crop progress
- Collateral pledging (land deeds, equipment liens, harvest guarantees) verified by AI
- Voice status updates transcribed and summarized for investors automatically

**For Investors:**
- Full on-chain transparency into every funded farm
- AI-verified collateral badges on every farm card
- Real-time milestone tracking from planting through harvest
- Automated profit distribution enforced by smart contract

---

## The 70/30 Model

Siyakhula enforces a fair economic split directly in the smart contract:

| Allocation | Percentage | Purpose |
|---|---|---|
| **Farmer Payout** | **70%** | Direct payment to the farmer for their labor, inputs, and expertise |
| **Investor Return + Insurance Pool** | **30%** | Investor profit share and a safety reserve for crop failure protection |

This ratio is not a suggestion — it is encoded on-chain. The smart contract will not execute a disbursement that violates the split. Farmers are guaranteed the majority of the value they create, while investors receive meaningful returns backed by a built-in insurance mechanism.

The insurance pool accumulates across seasons, creating a compounding safety net that de-risks future campaigns and enables lower-collateral funding for proven farmers.

---

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| **Blockchain** | Solana (Rust / Anchor 0.30) | Campaign escrow, milestone tracking, profit disbursement |
| **Frontend** | React 18 + TypeScript + Vite | Responsive DApp interface with mobile-first design |
| **Voice AI** | ElevenLabs (STT + TTS) | Farmer onboarding, status updates, conversational UX |
| **Vision AI** | Google Gemini | Collateral document verification, crop image analysis |
| **Styling** | Tailwind CSS + Framer Motion | Design system with South African-inspired earth tones |
| **Wallet** | Solana Wallet Adapter | Phantom, Solflare, and embedded wallet support |
| **Backend** | Supabase Edge Functions | Secure API proxy for AI services, data persistence |

---

## Live on Solana Devnet

The Siyakhula smart contract is deployed and operational on Solana Devnet.

```
Program ID: <YOUR_PROGRAM_ID_HERE>
```

> Replace the placeholder above with your deployed Program ID.

**Verify on Explorer:**
```
https://explorer.solana.com/address/<YOUR_PROGRAM_ID_HERE>?cluster=devnet
```

### On-Chain Capabilities

- `initialize_config` — Set platform fee and authority parameters
- `initialize_campaign` — Register a new farm campaign with funding goal, crop type, and profit split
- `initialize_milestones` — Create the 6-stage milestone structure (Land Prep → Harvest Complete)
- `fund_campaign` — Investor deposits into campaign escrow
- `verify_milestone` — AI-triggered milestone advancement with on-chain proof
- `disburse_funds` — Milestone-gated fund release to farmer wallet

---

## Key Features

### Voice-First Farmer Onboarding
Farmers register by speaking, not typing. A 4-step conversational flow captures name, location, land size, funding needs, water source, and experience — then reads everything back for confirmation in a warm South African English voice.

### AI Collateral Verification
Farmers pledge collateral (land rights deeds, equipment liens, or future harvest guarantees) and upload supporting documentation. Gemini Vision AI analyzes and verifies documents, surfacing a green "Collateral Verified" badge visible to all investors.

### Milestone-Based Fund Release
Funds are never released in a lump sum. The smart contract enforces a 6-stage milestone progression:

```
1. Land Preparation
2. Planting
3. Vegetative Growth
4. Flowering
5. Harvest Ready
6. Harvest Complete
```

Each stage requires AI-verified crop imagery before funds are unlocked.

### Investor Dashboard
Real-time portfolio tracking with collateral verification status, milestone progress, projected ROI, and farmer voice updates — all backed by on-chain data.

### Invisible Wallet Onboarding
Email-based magic link authentication abstracts away wallet complexity. Farmers and investors sign in with email — a secure wallet is provisioned automatically behind the scenes.

---

## Installation & Setup

### Prerequisites

- **Node.js** 18+ and **npm** (or Bun)
- **Git**
- A Solana wallet (Phantom recommended) with Devnet SOL

### Clone & Install

```bash
git clone https://github.com/your-username/siyakhula.git
cd siyakhula
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# ElevenLabs Voice AI (optional — app works in demo mode without these)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Supabase (required for backend edge functions)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

### Smart Contract Development

The Anchor program is located in `contracts/programs/workspace/src/lib.rs`.

```bash
cd contracts
anchor build
anchor deploy --provider.cluster devnet
```

---

## Project Structure

```
siyakhula/
├── contracts/                  # Solana program (Rust/Anchor)
│   ├── programs/workspace/src/
│   │   └── lib.rs              # Smart contract logic
│   ├── target/idl/             # Generated IDL
│   └── Anchor.toml             # Anchor configuration
├── src/
│   ├── components/             # React components
│   │   ├── VoiceRecorder.tsx   # MediaRecorder + ElevenLabs STT
│   │   ├── VoiceStatusUpdate.tsx # Dashboard voice updates with AI summary
│   │   ├── CollateralPledge.tsx  # Collateral type selector + upload + verification
│   │   ├── GetStartedModal.tsx   # Email magic link onboarding
│   │   ├── CampaignCard.tsx      # Farm card with collateral badge
│   │   └── MilestoneTracker.tsx  # Visual 6-stage progress tracker
│   ├── pages/
│   │   ├── FarmerRegister.tsx    # 4-step voice onboarding flow
│   │   ├── FarmerDashboard.tsx   # Farmer management dashboard
│   │   ├── InvestorDashboard.tsx # Portfolio + farm discovery
│   │   └── FarmCampaign.tsx      # Individual farm detail page
│   ├── lib/
│   │   ├── elevenlabs.ts         # ElevenLabs STT/TTS service + transcript parser
│   │   ├── siyakhula.ts          # Solana program SDK wrapper
│   │   └── constants.ts          # Mock data and configuration
│   └── hooks/
│       └── useProgram.ts         # Anchor program hook
├── supabase/functions/           # Edge functions for AI API proxy
│   ├── voice-transcribe/         # ElevenLabs STT proxy
│   └── voice-speak/              # ElevenLabs TTS proxy
└── package.json
```

---

## Contributing

Siyakhula is built for impact. Contributions that advance financial inclusion in African agriculture are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

<p align="center">
  <strong>Siyakhula</strong> — Because every farmer deserves a fair chance to grow.
  <br />
  <em>Sawubona. Siyabonga.</em>
</p>
