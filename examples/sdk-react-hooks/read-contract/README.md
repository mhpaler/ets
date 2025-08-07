# Simple Read Contract using sdk-react-hooks

This example demonstrates how to read from ETS contracts using sdk-react-hooks package. The example includes environment selection to switch between ETS staging and production environments.

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. **Run the development server:**

   ```bash
   pnpm run dev
   ```

3. **Open the example in your browser:**
usually: [http://localhost:5174/](http://localhost:5174/)

## Features

- **Environment Selection**: Choose between staging and production ETS environments
- **Tag Lookup**: Check if specific tags exist in the selected environment
- **Direct Links**: Navigate to individual tag details in the ETS explorer
- **Real-time Results**: See immediately whether tags exist or not

## Usage

1. Select your preferred environment (staging for development, production for live data)
2. Enter a tag name (with or without the # prefix)
3. Click "Check Tag" to verify if the tag exists
4. View results and click links to explore tags further

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/ethereum-tag-service/ets/tree/main/examples/sdk-react-hooks/read-contract)
