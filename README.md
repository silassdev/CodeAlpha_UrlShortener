# URL Shortener

A simple URL shortener application built with Node.js, Express, and MongoDB.

## Features

- Shorten long URLs into compact codes
- Custom short codes (optional)
- URL expiration support
- Click tracking
- RESTful API
- Simple web interface
- Rate limiting and security headers

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- nanoid for code generation
- valid-url for URL validation
- Helmet for security
- express-rate-limit for rate limiting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/silassdev/cautious-eureka.git
   cd url-shortener
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/urlshortener
   BASE_URL=http://localhost:3000
   PORT=3000
   CODE_LENGTH=7
   ```

4. Start the server:
   ```
   npm start
   ```

   For development with auto-restart:
   ```
   npm run dev
   ```

## Usage

### Web Interface

Visit `http://localhost:3000` in your browser. Enter a URL to shorten and click "Shorten".

### API Endpoints

- `POST /api/shorten`: Shorten a URL
  - Body: `{ "originalUrl": "https://example.com", "customCode": "optional", "expiresInDays": 30 }`
  - Response: `{ "shortUrl": "http://localhost:3000/abc123", "code": "abc123" }`

- `GET /api/info/:code`: Get info about a short URL
  - Response: `{ "originalUrl": "...", "code": "...", "clicks": 0, "createdAt": "...", "expiresAt": "..." }`

- `GET /:code`: Redirect to the original URL

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `BASE_URL`: Base URL for short links (e.g., http://localhost:3000)
- `PORT`: Server port (default: 3000)
- `CODE_LENGTH`: Length of generated codes (default: 7)

## Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with nodemon
- `npm test`: Run tests (not implemented)

## License

ISC
