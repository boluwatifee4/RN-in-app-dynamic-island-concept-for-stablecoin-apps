# Stable-Island

**Stable-Island** is a React Native architectural showcase that pushes the boundary of what the Dynamic Island can do, moving past simple static UI indicators into interactive, ambient workflows for Web3 and Fintech.

Designed specifically for the Stablecoin and Digital Dollar ecosystem, it demonstrates how complex, asynchronous on-chain states—such as cross-chain bridging, gasless paymasters, yield compounding, and remittance locking—can be handled fluidly without interrupting the user's primary application flow.

---

## Architectural Principles

This codebase is engineered to reflect senior-level React Native patterns, stepping away from monolithic UI files and mock data, into a strictly separated, production-ready environment.

### Feature-Driven Architecture
The codebase is structured by domain boundaries (`src/features/`), ensuring that state, UI, and side-effects remain encapsulated per business function.

### Deterministic Motion & Physics
All animations are driven by Reanimated 4.x using a unified `useIslandPhysics` custom hook. By centralizing physics configuration (stiffness, damping, mass) into a design token system (`motion.ts`), the interaction model remains cohesive and strictly decoupled from the presentation components.

### Performance & Re-rendering Defenses
- View components are strictly presentational.
- Business logic, timer intervals, and animation interpolation math are isolated in custom hooks.
- Component boundaries are hardened using `React.memo` and referentially stable callbacks (`useCallback`), preventing render cascades during high-frequency updates like the 60fps yield ticker.
- Animations utilize native Reanimated Shared Values, keeping all layout interpolations strictly on the UI thread.

### Clean Code & Iconography
The UI strictly relies on standard `@expo/vector-icons` (Ionicons) and vector graphics, ensuring resolution independence and avoiding unprofessional emoji-based pseudo-icons.

---

## Core Capabilities

### Multi-Chain CCTP Relay
An interactive, ambient bridge interface supporting Base, Solana, Arbitrum, Polygon, and Ethereum. It features a toggleable ERC-4337 gasless paymaster and live visual finality meters for the Burn/Attest/Mint pipeline.

### Remittance & FX Engine
A 3D perspective-flipping card mechanism (`rotateY` with `perspective`) that smoothly transitions a user from a digital dollar holding to a fiat payout destination (e.g., local banks), complete with real-time rate lock countdowns.

### On-Chain Inspector
A diagnostic lens connected directly to public RPC endpoints (e.g., Base Mainnet) providing real block confirmations and gas metrics. It includes a calldata inspector that toggles between decoded human-readable methods and raw EVM bytecode.

### 60 FPS Yield Streamer
A precision micro-yield accrual engine calculating and streaming yield smoothly via UI-thread intervals. Includes interactive compounding projections across 1M, 6M, 1Y, and 5Y horizons.

### Multi-Recipient Batch Payout
A horizontally swipable deck designed for payroll and bulk transfers, integrated with 1-click batch settlement features.

---

## Getting Started

### Requirements
- Node.js >= 18
- Expo SDK 57 / React Native 0.86+

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/stable-island.git
   cd stable-island
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```
   Press `i` to launch the iOS Simulator, `a` for the Android Emulator, or `w` for the Web version.

---

## License

MIT © 2026
