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