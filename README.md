## Quick Setup (Production)

```bash
bash ./setup.sh
```

## Installation (Development)

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm start:local
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Generate SSL certificates

1.  Generate an RSA private key, of size 2048, and output it to a file named key.pem:

```bash
openssl genrsa -out private_key.pem 2048
```

```bash
# It needs be copied&pasted from terminal manually
awk 'NF {sub(/\r/, ""); printf"%s\\n",$0;}' private_key.pem
```

2.  Extract the public key from the key pair, which can be used in a certificate:

```bash
openssl rsa -in private_key.pem -outform PEM -pubout -out public_key.pem
```

```bash
# It needs be copied&pasted from terminal manually
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' public_key.pem
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for more information.

<!-- ## 🌸 Built with template -->

---

# Generate PRIVATE AND PUBLIC Keys

Generate the Private Key and Output It to the Terminal

```bash
# It needs be copied&pasted from terminal manually
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -outform PEM
```

Explanation:

openssl genpkey: Generates a private key.
-algorithm RSA: Specifies the RSA algorithm.
-pkeyopt rsa_keygen_bits:2048: Sets the key size to 2048 bits.
-outform PEM: Outputs the key in PEM format to the terminal.

```bash
# You can generate the public key by piping the private key directly into the openssl rsa command:
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -outform PEM | openssl rsa -pubout -outform PEM
```

# Generate Migration

pnpm run migration:generate -- src/migrations/name_of_migration -d src/config/typeorm.config-migrations.ts

# Run migration

pnpm migration:run

## To read data from a table in your Heroku PostgreSQL database, you can connect to the database using the Heroku CLI and run SQL queries to retrieve the data

```bash
# Log in to heroku cli
heroku login
```

```bash
# Select database
heroku pg:psql -a axys-app-be
```

```bash
# List Tables (Optional): If you're unsure of the table names in your database, you can list all tables by running:
\dt
```

```bash
# Read Data from a Table
SELECT * FROM "table_name";
```

## To clear all tables' data, follow these steps using the Heroku CLI and SQL commands.

```bash
# Read Data from a Table
TRUNCATE TABLE "table1", "table2", "table3" CASCADE;
```

# OR

```bash
# Clear All Tables Automatically
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE;';
  END LOOP;
END $$;
```

## Generate migration file based on recent local changes

1. Go to src/config/typeorm.config-migrations.ts
2. Change url, host, port, username, password, database to Heroku DB addresses
3. run

```bash
pnmp run migration:generate
```

4. run

```bash
pnpm run migration:run
```

5. Push migration file to git

## Run ngrok to test 3rd party webhooks or https connections

1. Install ngrok
   https://ngrok.com/download

2. Run the following command

```bash
pnmp run ngrok
```

# KYC (Know Your Customer) Module

The KYC module manages customer verification processes, including basic and additional Proof of Address (POA) checks. It ensures seamless handling of KYC profiles, updates, and integration with third-party services like Sumsub for automated identity verification.

## Key Features

1. **KYC Profile Management**

   - Create, update, and retrieve KYC profiles.
   - Store user identification and address details with validation using `class-validator`.

2. **Third-Party Integration**

   - Supports Sumsub for KYC processing, including:
     - Webhooks for applicant review (`GREEN` or `RED` status).
     - Webhook verification using HMAC-based signatures.
   - Automatically updates KYC statuses based on Sumsub reviews (e.g., `APPROVED`, `PENDING`, or `REJECTED`).

3. **Delivery Address Update**

   - Automatically updates card delivery addresses across all orders when the KYC address is modified.

4. **Database Integration**

   - Uses TypeORM to manage KYC records and relationships with the `User` entity.
   - Stores details in a JSONB format for flexible data handling.

5. **Error Handling**

   - Comprehensive error and exception management for missing records or invalid operations.

6. **API Endpoints**
   - `POST /user/kyc/profile`: Create a new KYC profile.
   - `PATCH /user/kyc/:id`: Update an existing KYC.
   - `GET /user/kyc/:id`: Retrieve a specific KYC record.

# Axysbank Account KYC Process Flow

1. Initial KYC Verification

- kyc.basicPoaKycLevel: false
- user.kycStatus: Not Passed

2. KYC Approval (via webhook)

- Updates to:
  - kyc.basicPoaKycLevel: true
  - user.kycStatus: approved

3. KYC Rejection (via webhook)

- Updates to:
  - kyc.basicPoaKycLevel: false
  - user.kycStatus: rejected

## Third-Party Webhook Example

### Sumsub Webhook Payload

The module handles events such as:

- **`applicantReviewed`**: Updates KYC statuses based on Sumsub's review results.
- **`applicantPending`**: Updates KYC details while keeping the status as `PENDING`.

### Webhook Verification

Webhook signatures are validated using:

- A shared secret key (`SUMSUB_WEBHOOK_SECRET`).
- Supported hash algorithms (`sha1`, `sha256`, `sha512`).

## Database Schema

The `KYC` entity uses the following structure:

- `id`: Primary Key.
- `userId`: Associated user ID.
- `firstName`, `lastName`, `middleName`: User name details.
- `dob`: yyyy-mm-dd - Date of birth.
- `gender`: enum - Male: 0, Female: 1.
- `placeOfBirth`: alpha-2 code - Place Of Birth.
- `address`: JSONB format for storing address information.
- `contact`: JSONB format for storing contact information.
- `basicPoaKycLevel`: Boolean flags for KYC levels.
- `basicPoaDetails`: JSONB format for additional data.
- `date`: Timestamp for the latest update.

## Error Handling

The KYC module includes robust error management for:

- Missing KYC profiles.
- Unauthorized webhook calls.
- Invalid operations such as requesting additional KYC without basic KYC approval.

This module is essential for maintaining compliance with KYC regulations and provides an extensible framework for customer verification.




# Fireblocks Integration Guide

### Function Explanations

1.  **onModuleInit()**Initializes the Fireblocks service on module start. It calls processInstanceReading(), which reads your private keys from a secure source (e.g., an S3 bucket) and creates two Fireblocks SDK instances:
    
    *   **Signer** for creating vault accounts, initiating transfers, etc.
        
    *   **Viewer** for read-only operations.
        
2.  **processInstanceReading()**Downloads and extracts the private key files, then instantiates the Fireblocks Signer and Viewer SDKs. If something goes wrong (e.g., missing files), it logs an error.
    
3.  **createFireblocksAccountWithAssets(userId, userEmail)**Creates a Fireblocks Vault account named after the user, and then creates/activates a default list of supported assets in that account. Returns the newly created Vault account ID and the list of assets.
    
4.  **createVault(userId, userEmail)**Creates the underlying Fireblocks Vault account with a name (\_). This function is primarily used internally by createFireblocksAccountWithAssets().
    
5.  **getVaultAccountDetails(vaultAccountId)**Retrieves detailed information (balances, addresses, etc.) about a given Vault account by its ID.
    
6.  **getSupportedListOfAssets()**Fetches the list of assets supported by Fireblocks for the configured environment (testnet vs. mainnet). Useful for discovery or debugging.
    
7.  **activateVaultWallet(vaultAccountId, assetId)**Activates the wallet for a specific asset within a Vault account. Necessary for some blockchains (e.g., Stellar, Solana) that require an on-chain “activation” transaction.
    
8.  **createUserAssets(vaultAccountId, idempotencyKey?)**Creates and activates all assets in the configured “supported assets” list for a given vault. If idempotencyKey is provided, Fireblocks can ensure duplicate calls are handled safely.
    
9.  **getAccountBasedDepositAddress(vaultAccountId, assetId)**Retrieves deposit addresses for a specific asset in the user’s Vault account.Used when you want to display or store an address to receive deposits.
    
10.  **updateVaultAccountAssetBalance(vaultAccountId)**Forces an update of asset balances in the user’s Vault account. This can be used if Fireblocks’ auto-sync is slow or you want immediate confirmation of funds.
    
11.  **getTransactionFee(vaultAccountId, withdrawalDetails)**Estimates the total transaction fees for a specific withdrawal (including network fee plus an optional service fee). This helps in showing users the expected cost before they proceed.
    
12.  **processVaultAccountCardPayment(vaultAccountId, withdrawalDetails)**Initiates a transfer from a user’s Vault account to a specified address or another Vault account. Typically used when a user pays for an internal service (like a card purchase).
    
13.  **processExternalWithdrawTransaction(vaultAccountId, withdrawalDetails)**Handles a user withdrawal to an external (off-Fireblocks) address. It calculates and collects a service fee (sending it to a dedicated fee-collection account) before sending the remainder to the target address.
    
14.  **getTransactionById(transactionId)**Retrieves the status and details of a transaction by its Fireblocks ID. Helpful for polling or logging transaction outcomes.
    
15.  **getCustomerTransactions(vaultAccountId, limit, before?, after?)**Fetches transactions associated with a particular Vault account (both incoming and outgoing) in a paginated manner. This is used to generate a user’s transaction history.
    
16.  **triggerEmailNotification(body)**Listens for Fireblocks webhooks (or internally processed events), determines whether they’re deposits or withdrawals, and triggers relevant notifications or updates (e.g., deposit confirmations, withdrawal alerts, or order status updates).
    
17.  **manualUpdateVaultAccountAssetBalance(vaultAccountId, assetId, idempotencyKey)**Updates a single asset balance (instead of the entire vault), forcing Fireblocks to refresh the on-chain and off-chain data for that one asset.
    

### Omnibus Accounts vs. Vault Accounts

*   **Omnibus Account**:An omnibus account typically refers to a single address or wallet that holds multiple users’ assets in aggregate. Transactions are recorded off-chain in a separate ledger to track each user’s balance. This approach is used to minimize on-chain fees and optimize liquidity.
    
    *   **Transfers Between Omnibus Accounts**:
        
        *   Simply move funds within the same large wallet or address structure.
            
        *   Off-chain ledger entries are updated to reflect user balances.
            
        *   Actual on-chain transactions may only happen when adding or removing liquidity from the omnibus account.
            
*   **Vault Account** (as used in Fireblocks):A dedicated vault instance that’s provisioned for a single user or entity. Each user’s assets are held in an isolated Fireblocks vault, providing additional security, compliance, and clearer on-chain transparency.
    
    *   **Transfers Between Vault Accounts**:
        
        *   In the Fireblocks system, each vault has its own ID.
            
        *   Moving funds internally (vault-to-vault) still requires an on-chain or Fireblocks-level transaction.
            
        *   Fireblocks handles the signatures, fee estimation, and internal ledgering automatically.
            

### How to Transfer Between Accounts in Both Scenarios

1.  **Omnibus-to-Omnibus**
    
    *   If you maintain one omnibus account for inbound assets and another for outbound or fee collection, you’d typically do a single blockchain transaction to move funds from one omnibus address to the other when needed.
        
    *   In many cases, movement can be done off-chain if you maintain a single omnibus address with internal ledger entries.
        
2.  **Vault-to-Vault**
    
    *   Call processVaultAccountCardPayment() or a similar function that sets up a Fireblocks transaction from the source Vault ID to the destination Vault ID.
        
    *   Fireblocks ensures the transaction is signed, broadcasted, and tracked.
        
    *   The receiving vault will appear in Fireblocks with updated balances after the transaction confirms on-chain (or off-chain if it’s an internal Fireblocks movement that doesn’t require on-chain confirmation).
        

In general, **vault accounts** are recommended for end-user or high-security situations due to the transparency and security Fireblocks provides, whereas **omnibus accounts** can be more flexible for managing liquidity but require careful internal accounting and risk management.