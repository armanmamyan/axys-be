## Quick Setup (Production)

```bash
bash ./setup.sh
```

## Installation (Development)

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
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

   - Create, update, retrieve, and delete KYC profiles.
   - Store user identification and address details with validation using `class-validator`.

2. **Third-Party Integration**

   - Supports Sumsub for KYC processing, including:
     - Webhooks for applicant review (`GREEN` or `RED` status).
     - Webhook verification using HMAC-based signatures.
   - Automatically updates KYC statuses based on Sumsub reviews (e.g., `APPROVED`, `PENDING`, or `REJECTED`).

3. **Basic and Additional POA Levels**

   - Differentiates between basic and additional KYC levels.
   - Ensures basic KYC approval before additional KYC requests.

4. **Batch Processing**

   - Request additional KYC for multiple users in batch mode.
   - Tracks successful and failed operations with detailed error reporting.

5. **Delivery Address Update**

   - Automatically updates card delivery addresses across all orders when the KYC address is modified.

6. **Database Integration**

   - Uses TypeORM to manage KYC records and relationships with the `User` entity.
   - Stores details in a JSONB format for flexible data handling.

7. **Error Handling**

   - Comprehensive error and exception management for missing records or invalid operations.

8. **API Endpoints**
   - `POST /kyc/profile`: Create a new KYC profile.
   - `PATCH /kyc/profile/:id`: Update an existing profile.
   - `GET /kyc/:id`: Retrieve a specific KYC record.
   - `PUT /kyc/request-additional/:userId`: Request additional KYC verification.
   - `PUT /kyc/request-additional/batch`: Batch request for additional KYC.

## Third-Party Webhook Example

### Sumsub Webhook Payload

The module handles events such as:

- **`applicantReviewed`**: Updates KYC statuses based on Sumsub's review results.
- **`applicantPending`**: Updates KYC details while keeping the status as `PENDING`.

### Webhook Verification

Webhook signatures are validated using:

- A shared secret key (`SUMSUB_WEBHOOK_SECRET`).
- Supported hash algorithms (`sha1`, `sha256`, `sha512`).

## Delivery Address Update Example

When the KYC address is updated, the module automatically updates delivery addresses for all associated card orders.

## Database Schema

The `KYC` entity uses the following structure:

- `id`: Primary Key.
- `userId`: Associated user ID.
- `firstName`, `lastName`, `middleName`: User name details.
- `address`: JSONB format for storing address information.
- `basicPoaKycLevel` and `additionalPoaKycLevel`: Boolean flags for KYC levels.
- `basicPoaDetails` and `additionalPoaDetails`: JSONB format for additional data.
- `date`: Timestamp for the latest update.

## Error Handling

The KYC module includes robust error management for:

- Missing KYC profiles.
- Unauthorized webhook calls.
- Invalid operations such as requesting additional KYC without basic KYC approval.

This module is essential for maintaining compliance with KYC regulations and provides an extensible framework for customer verification.


## How to upload/update keys to server environments

- Compress the folder into a .tar.gz archive:
```bash
tar -czvf key.tar.gz key
```

- Upload the folder to temporary server 
```bash
curl -F "file=@key.tar.gz" https://file.io
```

- Copy the link from response object
- Go to Heroku Environments

```bash
heroku run bash --app axys-app-be-stg
```
- Download the file 
```bash
curl -O https://file.io/UNIQUE_ID
```

- Rename the file for clarity
```bash
mv UNIQUE_ID key.tar.gz
```

- Extract the File
```bash
tar -xzvf key.tar.gz -C
```

- Remove compressed file
```bash
rm key.tar.gz
```