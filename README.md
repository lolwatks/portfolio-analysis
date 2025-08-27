# 📊 Mutual Fund Portfolio Analyzer

A web-based tool to parse and visualize your mutual fund portfolio using ECAS statements.

## ✨ Features

- 📈 Interactive portfolio growth charts
- 💼 Portfolio overview with returns and allocation
- 📊 Fund performance comparison
- 🎯 Asset allocation breakdown
- 💰 Investment flow analysis
- 📋 XIRR calculations

## 🚀 Quick Start with Docker

```bash
# Clone and run
git clone <your-repo-url>
cd pf
docker-compose up -d

# Access at http://localhost:3000
```

## 🛠 Manual Setup

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.7+ with casparser

### Installation
```bash
# Python setup
python3 -m venv .venv
source .venv/bin/activate
pip install casparser

# Node.js setup
pnpm install
pnpm build
pnpm start

# Visit http://localhost:3000
```

## 📖 Usage

1. Go to `http://localhost:3000`
2. Enter your ECAS statement password
3. Upload your ECAS PDF file
4. View your portfolio analysis

## 🔧 Development

```bash
source .venv/bin/activate
pnpm dev
```
