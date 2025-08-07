# Real Estate Crawler

A Playwright-based web crawler for finding new real estate listings published today.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your target website in `.env` file:
```
TARGET_URL=https://your-target-website.com
```

3. Run the crawler:
```bash
npm run crawl
```

## Features

- Crawls real estate websites for new listings
- Filters listings published today
- Extracts key information about properties
- Uses Playwright for browser automation

## Requirements

- Node.js 16+
- npm
- Playwright

## License

MIT
