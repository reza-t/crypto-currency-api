# AWS PowerTools Crypto

This project demonstrates how to leverage AWS PowerTools to optimize and adhere to best practices for monitoring and tracing Lambda Functions.

## Features

The demos showcase the following features from using [Powertools](https://docs.powertools.aws.dev/lambda/typescript/latest/):

- Tracer
- Logger
- Metrics
- Parameters

## Requirements

This project requires the following tools:

- Terraform
- AWS CLI
- Node version > 20
- [Ninja API Token](https://api-ninjas.com/)
- Set the token in the AWS parameters as a secret under the name `/lambda/crypto-currency/api-key`

## Run Project

### Install Package

```bash
yarn install
```

### Create a Zip file for Lambda Layer

```bash
yarn layer:build
```

### Deploy Lambda to AWS

```bash
yarn deploy
```
