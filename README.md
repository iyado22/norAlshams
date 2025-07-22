# Grid Trading System - Advanced Trading Dashboard

A comprehensive, feature-rich grid trading system with live price feeds, automated grid averaging logic, trade engine simulation, and modern UI/UX enhancements.

🌐 **Live Demo**: [https://xbebsnbc.manussite.space](https://xbebsnbc.manussite.space)

## 🚀 Features

### Core Trading Features
- **Live Price Feed**: Real-time price updates with support for multiple currency pairs (EUR/USD, GBP/USD, USD/JPY, AUD/USD)
- **Grid Trading Engine**: Automated grid averaging logic with configurable parameters
- **Trade Management**: Automatic buy/sell order placement at grid levels
- **Profit/Loss Calculation**: Real-time P&L tracking with floating and realized profits
- **Take Profit System**: Automatic position closure when profit targets are reached

### Advanced Simulation
- **Simulation Controls**: Start, Pause, Step, Reset functionality
- **Speed Control**: Adjustable simulation speed (0.5x to 10x)
- **Real-time Monitoring**: Live statistics and performance metrics
- **Price History**: Comprehensive price data collection and analysis

### Modern UI/UX
- **Dark Mode Support**: Toggle between light and dark themes
- **Responsive Design**: Mobile and desktop compatible
- **Professional Dashboard**: Clean, modern trading interface
- **Color-coded Indicators**: Visual profit/loss and status indicators
- **Interactive Charts**: Real-time price visualization

### Configuration & Risk Management
- **Grid Settings**: Configurable grid size, max trades, lot size, and profit targets
- **Risk Management**: Max drawdown limits, stop loss, and trailing stop options
- **Strategy Presets**: Conservative, Aggressive, and Balanced trading strategies
- **Real-time Alerts**: Warning system for risk conditions and trading status

### Export & Reporting
- **Comprehensive Reports**: Detailed performance analysis (TXT format)
- **Trade History Export**: Complete trade data with entry/exit details (CSV)
- **Price Data Export**: Historical price movements and OHLCV data (CSV)
- **Automated Naming**: Files automatically named with symbol and date

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Icons**: Lucide React
- **Charts**: Recharts (ready for integration)
- **Backend**: Python with yfinance for real price data
- **Deployment**: Manus deployment platform

## 📋 Getting Started

### Prerequisites
- Node.js 20.18.0 or higher
- Python 3.11+ with pip
- pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd grid-trading-system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   pip3 install yfinance
   ```

3. **Start development server**
   ```bash
   pnpm run dev
   ```

4. **Build for production**
   ```bash
   pnpm run build
   ```

## 🎯 Usage Guide

### Basic Trading Setup

1. **Select Currency Pair**: Choose from EUR/USD, GBP/USD, USD/JPY, or AUD/USD
2. **Configure Grid Settings**: 
   - Grid Size: Distance between grid levels (in pips)
   - Max Trades: Maximum concurrent positions
   - Lot Size: Volume per trade
   - Take Profit Target: Profit threshold for closing all positions

3. **Start Trading**: Click "Start Trading" to activate the grid system
4. **Monitor Performance**: Watch real-time statistics and P&L updates

### Advanced Configuration

#### Grid Settings Tab
- **Grid Size**: 0.001 (default) - Distance between buy/sell levels
- **Max Trades**: 10 (default) - Maximum concurrent positions
- **Lot Size**: 0.01 (default) - Volume per position
- **Take Profit Target**: $100 (default) - Profit threshold
- **Grid Levels**: 5 (default) - Number of buy/sell levels
- **Starting Price**: Auto-detected current price

#### Risk Management Tab
- **Max Drawdown**: $500 (default) - Maximum acceptable loss
- **Stop Loss**: Enable/disable stop loss protection
- **Trailing Stop**: Enable/disable trailing stop functionality

#### Strategy Presets
- **Conservative**: Low risk, steady gains (Grid: 0.0005, Max Trades: 5, TP: $50)
- **Aggressive**: Higher risk, faster profits (Grid: 0.002, Max Trades: 20, TP: $200)
- **Balanced**: Moderate risk and reward (Grid: 0.001, Max Trades: 10, TP: $100)

### Simulation Controls

- **Start/Stop**: Begin or end the trading simulation
- **Pause/Resume**: Temporarily halt price processing
- **Step**: Process one price tick at a time
- **Reset**: Clear all data and restart
- **Speed Control**: Adjust simulation speed from 0.5x to 10x

### Export & Reporting

1. **Trading Report (TXT)**: Complete performance analysis with:
   - Configuration summary
   - Performance metrics (win rate, total profit, max drawdown)
   - Financial summary
   - Risk management settings
   - Simulation statistics

2. **Trade History (CSV)**: Detailed trade data including:
   - Trade ID, Symbol, Type
   - Entry/Exit prices and times
   - Volume and profit/loss
   - Trade status

3. **Price Data (CSV)**: Historical price information with:
   - Timestamp and price data
   - OHLCV (Open, High, Low, Close, Volume)
   - Complete price history

## 🔧 Configuration Options

### Grid Trading Parameters

```javascript
const defaultConfig = {
  gridSize: 0.001,        // Distance between grid levels (pips)
  maxTrades: 10,          // Maximum concurrent trades
  lotSize: 0.01,          // Volume per trade
  takeProfitTarget: 100,  // Profit target in USD
  startingPrice: 1.2000,  // Center price for grid
  gridLevels: 5,          // Number of buy/sell levels
  riskManagement: {
    maxDrawdown: 500,     // Maximum acceptable loss
    stopLoss: false,      // Enable stop loss
    trailingStop: false   // Enable trailing stop
  }
};
```

### Price Feed Configuration

- **Update Interval**: 1000ms (1 second)
- **Data Source**: Simulated data with yfinance integration
- **Supported Pairs**: EUR/USD, GBP/USD, USD/JPY, AUD/USD
- **Price Precision**: 5 decimal places

## 🚨 Risk Warnings & Alerts

The system includes comprehensive risk monitoring:

- **Max Trades Warning**: Alert when approaching or exceeding maximum trades
- **Drawdown Alert**: Warning when losses approach maximum drawdown limit
- **Capital Utilization**: Monitor capital usage and available funds
- **Grid Spacing**: Alert for potentially problematic grid configurations
- **Risk Management**: Notifications about disabled risk features

## 📊 Performance Metrics

### Real-time Statistics
- **Total Trades**: Active and closed positions
- **Win Rate**: Percentage of profitable trades
- **Total Profit**: Realized profit/loss
- **Floating P&L**: Unrealized profit/loss from open positions
- **Max Drawdown**: Maximum loss from peak equity
- **Average Entry**: Average entry price of active positions

### Simulation Statistics
- **Runtime**: Total simulation duration
- **Price Ticks**: Number of price updates processed
- **Trades Per Minute**: Trading frequency
- **Simulation Speed**: Current speed multiplier

## 🔒 Security & Disclaimers

⚠️ **Important Notice**: This is a simulation system for educational purposes only.

- **Not Financial Advice**: This system is for learning and demonstration only
- **Simulated Data**: Uses generated price data, not real market conditions
- **No Real Trading**: No actual trades are executed
- **Risk Warning**: Real trading involves significant risk of loss
- **Educational Use**: Designed for understanding grid trading concepts

## 🤝 Contributing

This project was built as a comprehensive demonstration of modern web development and trading system design. Key areas for potential enhancement:

- Real-time chart integration with Recharts
- Advanced technical indicators
- Backtesting capabilities
- Multi-timeframe analysis
- Enhanced risk management features

## 📝 License

This project is for educational and demonstration purposes. Please ensure compliance with relevant financial regulations if adapting for real trading use.

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── PriceFeed.jsx      # Live price feed component
│   ├── GridTradingEngine.jsx # Core trading logic
│   ├── TradingConfiguration.jsx # Settings management
│   ├── SimulationControls.jsx # Simulation controls
│   ├── ExportReports.jsx  # Export functionality
│   └── TradingAlerts.jsx  # Alert system
├── hooks/
│   ├── usePriceFeed.js    # Price feed management
│   └── useGridTrading.js  # Trading logic hook
├── services/
│   ├── priceAPI.js        # Price data service
│   └── priceService.py    # Python price service
└── App.jsx                # Main application
```

### Data Flow
1. **Price Feed**: Generates/fetches real-time price data
2. **Grid Engine**: Processes prices and manages trades
3. **UI Updates**: Real-time display of trading status
4. **Export System**: Generates reports and data files
5. **Alert System**: Monitors risk conditions

## 🎨 Design System

- **Color Palette**: Professional trading theme with dark mode support
- **Typography**: Clean, readable fonts optimized for data display
- **Layout**: Responsive grid system with mobile-first approach
- **Icons**: Consistent Lucide React icon set
- **Components**: shadcn/ui component library for consistency

---

**Built with ❤️ using modern web technologies and best practices for trading system development.**

