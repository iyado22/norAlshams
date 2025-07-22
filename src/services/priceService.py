#!/usr/bin/env python3
"""
Price Service for fetching real-time financial data
Supports both dummy data generation and real data from yfinance
"""

import json
import time
import random
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional

try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False
    print("Warning: yfinance not available. Using dummy data only.", file=sys.stderr)

class PriceService:
    def __init__(self):
        self.symbol_mapping = {
            'EUR/USD': 'EURUSD=X',
            'GBP/USD': 'GBPUSD=X', 
            'USD/JPY': 'USDJPY=X',
            'AUD/USD': 'AUDUSD=X',
            'USD/CHF': 'USDCHF=X',
            'EUR/GBP': 'EURGBP=X',
            'EUR/JPY': 'EURJPY=X',
            'GBP/JPY': 'GBPJPY=X'
        }
        
        self.last_prices = {}
        self.price_history = {}
    
    def get_real_price(self, symbol: str) -> Optional[Dict]:
        """Fetch real price data from yfinance"""
        if not YFINANCE_AVAILABLE:
            return None
            
        yahoo_symbol = self.symbol_mapping.get(symbol)
        if not yahoo_symbol:
            return None
            
        try:
            ticker = yf.Ticker(yahoo_symbol)
            
            # Get current price
            info = ticker.info
            current_price = info.get('regularMarketPrice') or info.get('bid') or info.get('ask')
            
            if current_price is None:
                # Fallback to historical data
                hist = ticker.history(period='1d', interval='1m')
                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
            
            if current_price is None:
                return None
                
            # Get some basic market data
            bid = info.get('bid', current_price)
            ask = info.get('ask', current_price)
            volume = info.get('volume', 0)
            
            return {
                'symbol': symbol,
                'price': float(current_price),
                'bid': float(bid) if bid else float(current_price),
                'ask': float(ask) if ask else float(current_price),
                'volume': int(volume) if volume else 0,
                'timestamp': datetime.now().isoformat(),
                'source': 'yfinance'
            }
            
        except Exception as e:
            print(f"Error fetching real data for {symbol}: {e}", file=sys.stderr)
            return None
    
    def generate_dummy_price(self, symbol: str, base_price: float = None) -> Dict:
        """Generate realistic dummy price data"""
        
        # Default base prices
        default_prices = {
            'EUR/USD': 1.2000,
            'GBP/USD': 1.3000,
            'USD/JPY': 110.00,
            'AUD/USD': 0.7500,
            'USD/CHF': 0.9200,
            'EUR/GBP': 0.8500,
            'EUR/JPY': 132.00,
            'GBP/JPY': 143.00
        }
        
        if base_price is None:
            base_price = default_prices.get(symbol, 1.0000)
        
        # Get last price or use base price
        last_price = self.last_prices.get(symbol, base_price)
        
        # Generate realistic movement
        if 'JPY' in symbol:
            volatility = 0.01  # 1 pip for JPY pairs
            pip_size = 0.01
        else:
            volatility = 0.0001  # 1 pip for major pairs
            pip_size = 0.0001
        
        # Random walk with mean reversion
        trend = (base_price - last_price) * 0.001  # Mean reversion
        random_change = (random.random() - 0.5) * volatility * 2
        
        new_price = last_price + trend + random_change
        
        # Ensure price stays within reasonable bounds
        min_price = base_price * 0.95
        max_price = base_price * 1.05
        new_price = max(min_price, min(max_price, new_price))
        
        # Calculate bid/ask spread
        spread = pip_size * random.randint(1, 3)
        bid = new_price - spread / 2
        ask = new_price + spread / 2
        
        # Store last price
        self.last_prices[symbol] = new_price
        
        return {
            'symbol': symbol,
            'price': round(new_price, 5),
            'bid': round(bid, 5),
            'ask': round(ask, 5),
            'volume': random.randint(100, 1000),
            'timestamp': datetime.now().isoformat(),
            'source': 'dummy'
        }
    
    def get_price(self, symbol: str, use_real_data: bool = False, base_price: float = None) -> Dict:
        """Get price data (real or dummy)"""
        
        if use_real_data:
            real_data = self.get_real_price(symbol)
            if real_data:
                return real_data
        
        # Fallback to dummy data
        return self.generate_dummy_price(symbol, base_price)
    
    def get_historical_data(self, symbol: str, period: str = '1d', interval: str = '1m') -> List[Dict]:
        """Get historical price data"""
        
        if not YFINANCE_AVAILABLE:
            return self._generate_dummy_historical(symbol, period, interval)
        
        yahoo_symbol = self.symbol_mapping.get(symbol)
        if not yahoo_symbol:
            return self._generate_dummy_historical(symbol, period, interval)
        
        try:
            ticker = yf.Ticker(yahoo_symbol)
            hist = ticker.history(period=period, interval=interval)
            
            if hist.empty:
                return self._generate_dummy_historical(symbol, period, interval)
            
            historical_data = []
            for timestamp, row in hist.iterrows():
                historical_data.append({
                    'timestamp': timestamp.isoformat(),
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'close': float(row['Close']),
                    'volume': int(row['Volume']) if not pd.isna(row['Volume']) else 0
                })
            
            return historical_data
            
        except Exception as e:
            print(f"Error fetching historical data for {symbol}: {e}", file=sys.stderr)
            return self._generate_dummy_historical(symbol, period, interval)
    
    def _generate_dummy_historical(self, symbol: str, period: str, interval: str) -> List[Dict]:
        """Generate dummy historical data"""
        
        # Parse period and interval
        period_hours = {'1d': 24, '5d': 120, '1mo': 720}
        interval_minutes = {'1m': 1, '5m': 5, '15m': 15, '1h': 60}
        
        hours = period_hours.get(period, 24)
        minutes = interval_minutes.get(interval, 1)
        
        # Generate data points
        data_points = int((hours * 60) / minutes)
        end_time = datetime.now()
        
        historical_data = []
        current_price = self.last_prices.get(symbol, 1.2000)
        
        for i in range(data_points):
            timestamp = end_time - timedelta(minutes=minutes * (data_points - i - 1))
            
            # Generate OHLC data
            open_price = current_price
            volatility = 0.0001 if 'JPY' not in symbol else 0.01
            
            high = open_price + random.random() * volatility
            low = open_price - random.random() * volatility
            close = low + random.random() * (high - low)
            
            historical_data.append({
                'timestamp': timestamp.isoformat(),
                'open': round(open_price, 5),
                'high': round(high, 5),
                'low': round(low, 5),
                'close': round(close, 5),
                'volume': random.randint(100, 1000)
            })
            
            current_price = close
        
        return historical_data

def main():
    """CLI interface for the price service"""
    if len(sys.argv) < 2:
        print("Usage: python priceService.py <command> [args]")
        print("Commands:")
        print("  price <symbol> [--real] [--base-price <price>]")
        print("  historical <symbol> [--period <period>] [--interval <interval>]")
        return
    
    service = PriceService()
    command = sys.argv[1]
    
    if command == 'price':
        if len(sys.argv) < 3:
            print("Error: Symbol required")
            return
        
        symbol = sys.argv[2]
        use_real = '--real' in sys.argv
        
        base_price = None
        if '--base-price' in sys.argv:
            idx = sys.argv.index('--base-price')
            if idx + 1 < len(sys.argv):
                base_price = float(sys.argv[idx + 1])
        
        result = service.get_price(symbol, use_real, base_price)
        print(json.dumps(result, indent=2))
    
    elif command == 'historical':
        if len(sys.argv) < 3:
            print("Error: Symbol required")
            return
        
        symbol = sys.argv[2]
        period = '1d'
        interval = '1m'
        
        if '--period' in sys.argv:
            idx = sys.argv.index('--period')
            if idx + 1 < len(sys.argv):
                period = sys.argv[idx + 1]
        
        if '--interval' in sys.argv:
            idx = sys.argv.index('--interval')
            if idx + 1 < len(sys.argv):
                interval = sys.argv[idx + 1]
        
        result = service.get_historical_data(symbol, period, interval)
        print(json.dumps(result, indent=2))
    
    else:
        print(f"Unknown command: {command}")

if __name__ == '__main__':
    main()

