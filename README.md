# Real Estate Tokenization on Internet Computer

A decentralized application for tokenizing real estate assets on the Internet Computer blockchain platform.

## Features

- Tokenize real estate properties
- Purchase property shares
- Transfer shares between users
- Distribute rental income to shareholders
- Vote on property-related decisions

## Technology Stack

- **Backend**: Rust on Internet Computer Protocol (ICP)
- **Frontend**: React with Tailwind CSS
- **Authentication**: Internet Identity
- **Blockchain**: Internet Computer Protocol

## Prerequisites

- [DFINITY Canister SDK (dfx)](https://internetcomputer.org/docs/current/developer-docs/build/install-upgrade-remove)
- [Node.js](https://nodejs.org/) (v14 or later)
- [Rust](https://www.rust-lang.org/tools/install)

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/real_estate_icp.git
   cd real_estate_icp
```

2. Start the local Internet Computer replica:

```shellscript
dfx start --clean --background
```


3. Deploy the canisters:

```shellscript
dfx deploy
```


4. Open the application in your browser:

```shellscript
echo "Frontend URL: http://localhost:4943/?canisterId=$(dfx canister id real_estate_icp_frontend)"
```




### Development

- Backend code is in `src/real_estate_icp_backend/`
- Frontend code is in `src/real_estate_icp_frontend/`


## Project Structure

```plaintext
real_estate_icp/
├── dfx.json                 # Project configuration
├── src/
│   ├── real_estate_icp_backend/    # Rust backend
│   │   ├── Cargo.toml
│   │   ├── src/
│   │   │   └── lib.rs       # Main backend code
│   │   └── real_estate_icp_backend.did  # Candid interface
│   └── real_estate_icp_frontend/   # React frontend
│       ├── src/
│       │   ├── components/   # React components
│       │   ├── services/     # Services for backend interaction
│       │   ├── main.jsx      # Entry point
│       │   └── index.scss    # Styles
│       ├── index.html        # HTML template
│       └── vite.config.js    # Vite configuration
└── README.md                # This file
```

## Deployment to Internet Computer Mainnet

1. Get ICP tokens and convert them to cycles
2. Deploy to the mainnet:

```shellscript
dfx deploy --network ic
```
