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
