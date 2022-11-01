# Hardhat Testing Demo

This project demonstrates writing Hardhat unit tests for basic smart contract in Solidity.

## Project Setup

[Install](https://github.com/nvm-sh/nvm#install--update-script) `nvm` if you don't have it already:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
```

Install and switch to `node` version specified in `.nvmrc` file:

```bash
nvm install
```

Install all needed dependencies:

```bash
npm install
```

## Running the tests

Run the following to have the tests run once:

```bash
npx hardhat test
```

Run the following to have the tests in "watch" mode, where any changes to the contracts and test files will trigger compilation of the contracts (if necessary) and another run of the tests:

```bash
npm run test
```
