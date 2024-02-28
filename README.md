# Puppeteer-WebScraping

This project is an Express.js application that performs web scraping using Puppeteer to extract information about homes from a popular website. It provides a simple API endpoint to fetch house data based on the city query parameter.

## Getting Started

### Prerequisites

- Node.js (version 12 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```

2. **Install dependencies:**

   ```
   npm install
   ```

3. **Start the server:**

   ```
   npm start
   ```

   The server will be running on http://localhost:3000 by default.

4. **Make a GET request to the API endpoint:**
   ```
   curl http://localhost:3000/api/homes?city=london
   ```
   Replace london with the desired city.

### API Endpoint

#### GET /api/homes

##### Parameters:

city (required): The city for which you want to fetch home data.

## End the Program

When you have finished testing, you can stop the npm start command by pressing `Ctrl + C` or closing the terminal window to end the program's execution.
