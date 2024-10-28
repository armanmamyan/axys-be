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
2. Change  url, host, port, username, password, database to Heroku DB addresses
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