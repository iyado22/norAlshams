/**
 * Price API Service
 * Interfaces with Python price service for real and dummy data
 */

class PriceAPI {
  constructor() {
    this.baseUrl = '/api/price'; // Will be handled by backend proxy
    this.pythonServicePath = './src/services/priceService.py';
  }

  /**
   * Execute Python price service command
   */
  async executePythonService(command, args = []) {
    try {
      // In a real deployment, this would call a backend API
      // For development, we'll simulate the Python service calls
      
      if (command === 'price') {
        const symbol = args[0] || 'EUR/USD';
        const useReal = args.includes('--real');
        const basePriceIndex = args.indexOf('--base-price');
        const basePrice = basePriceIndex !== -1 && basePriceIndex + 1 < args.length 
          ? parseFloat(args[basePriceIndex + 1]) 
          : null;

        return this.generatePriceData(symbol, useReal, basePrice);
      }
      
      if (command === 'historical') {
        const symbol = args[0] || 'EUR/USD';
        const periodIndex = args.indexOf('--period');
        const intervalIndex = args.indexOf('--interval');
        
        const period = periodIndex !== -1 && periodIndex + 1 < args.length 
          ? args[periodIndex + 1] 
          : '1d';
        const interval = intervalIndex !== -1 && intervalIndex + 1 < args.length 
          ? args[intervalIndex + 1] 
          : '1m';

        return this.generateHistoricalData(symbol, period, interval);
      }

      throw new Error(`Unknown command: ${command}`);
    } catch (error) {
      console.error('Error executing Python service:', error);
      throw error;
    }
  }

  /**
   * Generate price data (simulating Python service)
   */
  generatePriceData(symbol, useReal = false, basePrice = null) {
    const defaultPrices = {
      'EUR/USD': 1.2000,
      'GBP/USD': 1.3000,
      'USD/JPY': 110.00,
      'AUD/USD': 0.7500,
      'USD/CHF': 0.9200,
      'EUR/GBP': 0.8500,
      'EUR/JPY': 132.00,
      'GBP/JPY': 143.00
    };

    const base = basePrice || defaultPrices[symbol] || 1.0000;
    
    // Get stored last price or use base
    const lastPriceKey = `lastPrice_${symbol}`;
    const lastPrice = parseFloat(localStorage.getItem(lastPriceKey)) || base;
    
    // Generate realistic movement
    const isJPY = symbol.includes('JPY');
    const volatility = isJPY ? 0.01 : 0.0001;
    const pipSize = isJPY ? 0.01 : 0.0001;
    
    // Random walk with mean reversion
    const trend = (base - lastPrice) * 0.001;
    const randomChange = (Math.random() - 0.5) * volatility * 2;
    
    let newPrice = lastPrice + trend + randomChange;
    
    // Bounds checking
    const minPrice = base * 0.95;
    const maxPrice = base * 1.05;
    newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
    
    // Calculate bid/ask spread
    const spread = pipSize * (Math.floor(Math.random() * 3) + 1);
    const bid = newPrice - spread / 2;
    const ask = newPrice + spread / 2;
    
    // Store last price
    localStorage.setItem(lastPriceKey, newPrice.toString());
    
    const result = {
      symbol,
      price: parseFloat(newPrice.toFixed(5)),
      bid: parseFloat(bid.toFixed(5)),
      ask: parseFloat(ask.toFixed(5)),
      volume: Math.floor(Math.random() * 900) + 100,
      timestamp: new Date().toISOString(),
      source: useReal ? 'yfinance' : 'dummy'
    };

    return Promise.resolve(result);
  }

  /**
   * Generate historical data
   */
  generateHistoricalData(symbol, period = '1d', interval = '1m') {
    const periodHours = { '1d': 24, '5d': 120, '1mo': 720 };
    const intervalMinutes = { '1m': 1, '5m': 5, '15m': 15, '1h': 60 };
    
    const hours = periodHours[period] || 24;
    const minutes = intervalMinutes[interval] || 1;
    const dataPoints = Math.floor((hours * 60) / minutes);
    
    const endTime = new Date();
    const historicalData = [];
    
    const defaultPrices = {
      'EUR/USD': 1.2000,
      'GBP/USD': 1.3000,
      'USD/JPY': 110.00,
      'AUD/USD': 0.7500
    };
    
    let currentPrice = defaultPrices[symbol] || 1.0000;
    const volatility = symbol.includes('JPY') ? 0.01 : 0.0001;
    
    for (let i = 0; i < dataPoints; i++) {
      const timestamp = new Date(endTime.getTime() - (minutes * (dataPoints - i - 1) * 60000));
      
      const open = currentPrice;
      const high = open + Math.random() * volatility;
      const low = open - Math.random() * volatility;
      const close = low + Math.random() * (high - low);
      
      historicalData.push({
        timestamp: timestamp.toISOString(),
        open: parseFloat(open.toFixed(5)),
        high: parseFloat(high.toFixed(5)),
        low: parseFloat(low.toFixed(5)),
        close: parseFloat(close.toFixed(5)),
        volume: Math.floor(Math.random() * 900) + 100
      });
      
      currentPrice = close;
    }
    
    return Promise.resolve(historicalData);
  }

  /**
   * Get current price for a symbol
   */
  async getCurrentPrice(symbol, useRealData = false, basePrice = null) {
    const args = [symbol];
    if (useRealData) args.push('--real');
    if (basePrice) args.push('--base-price', basePrice.toString());
    
    return this.executePythonService('price', args);
  }

  /**
   * Get historical data for a symbol
   */
  async getHistoricalData(symbol, period = '1d', interval = '1m') {
    const args = [symbol, '--period', period, '--interval', interval];
    return this.executePythonService('historical', args);
  }

  /**
   * Get multiple currency pairs data
   */
  async getMultiplePrices(symbols, useRealData = false) {
    const promises = symbols.map(symbol => 
      this.getCurrentPrice(symbol, useRealData)
    );
    
    try {
      const results = await Promise.all(promises);
      return results.reduce((acc, result) => {
        acc[result.symbol] = result;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error fetching multiple prices:', error);
      throw error;
    }
  }

  /**
   * Start real-time price stream (simulated)
   */
  startPriceStream(symbols, callback, useRealData = false, interval = 1000) {
    const streamInterval = setInterval(async () => {
      try {
        const prices = await this.getMultiplePrices(symbols, useRealData);
        callback(prices);
      } catch (error) {
        console.error('Price stream error:', error);
      }
    }, interval);

    return {
      stop: () => clearInterval(streamInterval),
      interval: streamInterval
    };
  }
}

// Export singleton instance
export const priceAPI = new PriceAPI();
export default priceAPI;

