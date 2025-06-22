# Smart Water Card: Decentralized Water Project Funding Platform

This project is a web platform that enables the decentralized, community-driven financing of eco-friendly and sustainable water projects. It combines an AI-powered evaluation process with a Stellar/Soroban-based smart contract infrastructure.

## 🚀 Core Features

- **AI-Powered Project Evaluation:** Projects submitted by users are automatically evaluated and scored by OpenAI (GPT-4o) based on criteria such as environmental impact, sustainability, and feasibility.
- **Mock Data Support:** Provides the option to work with mock data instead of the live OpenAI API to facilitate development and testing.
- **Decentralized Funding:** Approved projects raise funds from the community through a Soroban smart contract running on the Stellar network.
- **Community-Oriented Project Submission:** The platform allows entrepreneurs and innovators to present their eco-friendly projects and find support.
- **Interactive Tokenization Flow:** Users whose projects are approved are greeted with an interactive interface that simulates the process of tokenizing their project and preparing it for funding.
- **Real-Time and Secure Token Transactions:** All donation transactions are securely handled using a "burn-and-mint" logic.

## 🛠️ Technology Stack

- **Frontend:**
  - Next.js (React Framework)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui (UI Components)
- **Backend:**
  - Node.js / Express.js
  - MongoDB (Database)
  - OpenAI API
- **Blockchain:**
  - Stellar (Blockchain Network)
  - Soroban (Smart Contract Platform)
  - Rust (Smart Contract Language)

## 🏗️ Project Architecture

The project consists of three main parts:

- **`frontend/`**: The Next.js project containing the user interface. All interactions such as wallet connection, project submission, and donations happen here.
- **`backend/`**: The API server built with Express.js. It manages database operations, OpenAI integration, and interaction with the Soroban smart contract.
- **`stellar-contract/`**: The Soroban smart contract written in Rust, which implements a standard token interface (including burn, mint, transfer, etc.).

## ⚙️ Setup and Launch

Follow these steps to run the project on your local machine.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [Rust](https://www.rust-lang.org/tools/install)
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup)

### 2. Deploying the Smart Contract

1.  Navigate to the contract directory:
    ```bash
    cd stellar-contract
    ```
2.  Build the contract:
    ```bash
    soroban contract build
    ```
3.  Deploy the contract to the test network and save the returned **Contract ID**.
    ```bash
    soroban contract deploy --wasm target/wasm32-unknown-unknown/release/stellar_contract.wasm
    ```

### 3. Setting Up the Backend

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install the required packages:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` folder and add the following variables:
    ```env
    # MongoDB Connection String
    MONGO_URI=mongodb://localhost:27017/su-hakki
    
    # Your OpenAI API Key
    OPENAI_API_KEY=sk...
    
    # Use Mock OpenAI for development (true/false)
    USE_MOCK_OPENAI=true
    
    # Soroban Smart Contract Information
    CONTRACT_ID=Cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ADMIN_PUBLIC_KEY=Gxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ADMIN_SECRET_KEY=Sxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ```
4.  Start the server:
    ```bash
    npm start
    ```

### 4. Setting Up the Frontend

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install the required packages:
    ```bash
    npm install
    ```
3.  Start the application in development mode:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:3000` in your browser.

## 💡 How It Works

1.  **Wallet Connection:** The user connects to the platform using their Stellar wallet.
2.  **Project Submission:** The user submits the details of their eco-friendly project on the `/proje-basvuru` page.
3.  **AI Evaluation:** The backend sends the project to the OpenAI API (or mock service) for scoring.
4.  **Approval and Tokenization:** If the project scores above 70, it is approved. The user is then shown a "Tokenize Project" screen with mock data.
5.  **Preparation for Funding:** After the user completes the tokenization flow, the project is saved to the database and listed on the `/bagis` page.
6.  **Making a Donation:** Other users can donate tokens to approved projects. This action is reflected on the smart contract via the backend using a `burn-and-mint` logic (tokens are burned from the user and minted to the admin wallet).



Team:
Ahmet Buğra Kurnaz 


