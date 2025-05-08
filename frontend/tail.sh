#!/bin/bash

# This script installs all required dependencies and sets up the frontend properly

# Make sure we're in the frontend directory
cd "$(dirname "$0")"

# Install dependencies with bun
echo "Installing dependencies..."
bun install

# Create missing Tailwind config file if it doesn't exist
if [ ! -f "./tailwind.config.js" ]; then
  echo "Creating Tailwind config..."
  cat > tailwind.config.js << EOF
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
EOF
fi

# Create postcss.config.js if it doesn't exist
if [ ! -f "./postcss.config.js" ]; then
  echo "Creating PostCSS config..."
  cat > postcss.config.js << EOF
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
fi

# Make sure index.css has the proper imports
echo "Updating index.css..."
cat > src/index.css << EOF
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  @apply bg-gray-50 text-gray-900;
}
EOF

echo "Setup complete! Run 'bun run dev' to start the development server."