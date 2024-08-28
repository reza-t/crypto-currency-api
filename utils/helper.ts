export const getRandomCryptoSymbol= (): string =>{
  const symbols: string[] = [
    'BTCUSD',  // Bitcoin to US Dollar
    'ETHBTC',  // Ethereum to Bitcoin
    'LTCBTC',  // Litecoin to Bitcoin
    'BNBUSD',  // Binance Coin to US Dollar
    'ETHUSDT'  // Ethereum to Tether
  ];

  const randomIndex = Math.floor(Math.random() * symbols.length);
  return symbols[randomIndex];
}

export const SERVICE_NAME = "cryptoService";
export const NAMESPACE = "exchangeNamespace";