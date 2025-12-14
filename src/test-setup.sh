#!/bin/bash

# 🧪 Test Setup Script - English Complex
# Chạy script này để test từng bước

echo "================================================"
echo "  🧪 TESTING ENGLISH COMPLEX SETUP"
echo "================================================"
echo ""

# Step 1: Check Node & npm
echo "📋 Step 1: Checking Node & npm versions..."
echo "Node version:"
node -v
echo "npm version:"
npm -v
echo ""

# Step 2: Check files
echo "📋 Step 2: Checking required files..."

check_file() {
  if [ -f "$1" ]; then
    echo "✅ $1 exists"
  else
    echo "❌ $1 MISSING!"
    return 1
  fi
}

check_file "index.html"
check_file "package.json"
check_file "vite.config.ts"
check_file "src/main.tsx"
check_file "src/App.tsx"
check_file "styles/globals.css"

echo ""

# Step 3: Check node_modules
echo "📋 Step 3: Checking dependencies..."
if [ -d "node_modules" ]; then
  echo "✅ node_modules exists"
  
  if [ -d "node_modules/react" ]; then
    echo "✅ React installed"
  else
    echo "❌ React NOT installed"
  fi
  
  if [ -d "node_modules/vite" ]; then
    echo "✅ Vite installed"
  else
    echo "❌ Vite NOT installed"
  fi
else
  echo "❌ node_modules NOT found - Need to run: npm install"
fi

echo ""

# Step 4: Offer to install
if [ ! -d "node_modules" ]; then
  echo "🤔 Do you want to install dependencies now? (y/n)"
  read -r response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "📦 Installing dependencies..."
    npm install
  fi
fi

echo ""

# Step 5: Test simple version?
echo "================================================"
echo "🧪 OPTIONAL: Test with simple App version?"
echo "================================================"
echo ""
echo "If npm run dev still shows blank page, you can test"
echo "with a simple version of App.tsx"
echo ""
echo "Do you want to switch to simple test version? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo "🔄 Backing up current App.tsx..."
  mv src/App.tsx src/App.backup.tsx
  
  echo "📝 Using simple test version..."
  mv src/App.simple.tsx src/App.tsx
  
  echo "✅ Done! Now run: npm run dev"
  echo "   If you see 'IT WORKS!' then Vite is working"
  echo "   To restore: mv src/App.backup.tsx src/App.tsx"
fi

echo ""
echo "================================================"
echo "  ✅ SETUP CHECK COMPLETE"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3000"
echo "3. Check browser console (F12) if blank page"
echo ""
echo "For detailed debugging: see DEBUG_STEPS.md"
echo "================================================"
