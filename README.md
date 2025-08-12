# 🏠 Imot.bg Real Estate Crawler

A comprehensive real estate listing crawler for [imot.bg](https://www.imot.bg) with both automated scraping capabilities and a modern web interface.

## 📋 Project Overview

This project consists of two main components:
- **Server**: A Node.js/TypeScript backend using Playwright for web scraping
- **UI**: An Angular frontend for managing search criteria and viewing results

The system automatically crawls imot.bg daily to fetch new real estate listings based on predefined search criteria, making it easy to stay updated with the latest property offerings.

## 🚀 Features

- **Automated Web Scraping**: Uses Playwright to navigate and extract data from imot.bg
- **Daily Listing Fetcher**: Automatically retrieves only listings posted today
- **Modern Web Interface**: Angular-based UI for easy interaction
- **Flexible Search Criteria**: Configurable filters for city, price, property type, etc.
- **Multiple Output Formats**: Supports JSON and CSV export
- **RESTful API**: Express.js server with CORS support
- **TypeScript**: Full type safety across the entire stack

## 🏗️ Project Structure

```
imot-bg-crawler/
├── server/                 # Backend Node.js application
│   ├── src/               # TypeScript source files
│   ├── package.json       # Server dependencies
│   ├── playwright.config.js
│   └── .env              # Environment variables
├── crawer-ui/            # Angular frontend application
│   ├── src/              # Angular source files
│   ├── package.json      # UI dependencies
│   └── angular.json      # Angular configuration
├── PRD.md               # Product Requirements Document
└── README.md           # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone <repository-url>
cd imot-bg-crawler
```

### 2. Server Setup

```bash
cd server
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env  # If example exists, or create manually
```

Add the following environment variables to your `.env` file:

```env
# Server Configuration
TARGET_URL=https://www.imot.bg/search/prodazhbi/grad-sofiya
PORT=3000

# Add any other required environment variables
```

### 4. Install Playwright Browsers

```bash
cd server
npm run prepare
```

### 5. UI Setup

```bash
cd ../crawer-ui
npm install
```

## 🚀 Running the Application

### Start the Server

```bash
cd server
npm run server
```

The server will start on `http://localhost:3000`

### Start the UI (Development)

```bash
cd crawer-ui
npm start
```

The Angular development server will start on `http://localhost:4200`

### Run Crawler Manually

```bash
cd server
npm run crawl
```

## 📝 Available Scripts

### Server Scripts

- `npm run server` - Start the Express server
- `npm run crawl` - Run the crawler manually
- `npm test` - Run Playwright tests
- `npm run test-debug` - Run tests with UI debugger

### UI Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run watch` - Build and watch for changes

## 🔧 Configuration

### Regions and Fields

- `server/imot-bg-regions.json` - Available regions
- `server/imot-bg-fields.json` - Available search fields

## 📊 Output

Crawled listings are saved to:
- `recent_ads.json` - Latest crawling results in JSON format
- Server API endpoints provide programmatic access to data

## 🔍 API Endpoints

The server provides RESTful endpoints for:
- `POST /api/crawl` - Trigger manual crawl

## ⚠️ Disclaimer

This tool is intended for personal use only. Please be respectful of the target website's resources and follow their terms of service. Consider implementing appropriate delays between requests and avoid overloading their servers.
