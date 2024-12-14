import express, { Request, Response } from 'express';
import cors from "cors";
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY; // Load the API key from .env

app.use(express.json());
app.use(cors());

// API route to fetch stock data from Finnhub for multiple companies
app.get('/api/stock-data', async (req: Request, res: Response) => {
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NFLX', 'PYPL', 'BABA', 'BAC', 'SHOP', 'INTC', 'NVDA'];

  try {
    // Make concurrent requests for each symbol
    const requests = symbols.map(symbol =>
      axios.get(`https://finnhub.io/api/v1/quote`, {
        params: {
          symbol,
          token: FINNHUB_API_KEY,
        },
      })
    );

    // Wait for all requests to complete
    const responses = await Promise.all(requests);

    // Map the responses to a simplified format
    const stockData = responses.map((response, index) => ({
      symbol: symbols[index],
      data: response.data,
    }));

    // Send HTML output for the browser
    res.send(`
      <html>
      <head><title>Stock Data</title></head>
      <body>
        <h1>Stock Data</h1>
        <ul>
          ${stockData
            .map(
              stock =>
                `<li>${stock.symbol}: Current Price - ${stock.data.c}</li>`
            )
            .join('')}
        </ul>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// For local development
if (process.env.VERCEL_ENV === undefined) {
  app.listen(PORT, () => {
    console.log(`Server is running locally on port ${PORT}`);
  });
}

// Export the app for Vercel
export default app;

// app.get('/api/data/:symbol', async (req, res) => {
//   const { symbol } = req.params; // Get the symbol from the URL parameters
//   console.log(symbol)
//   try {
//       const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
//           params: {
//               symbol: symbol,
//               token: FINNHUB_API_KEY,
//           },
//       });
//       res.json(response.data);
//   } catch (error) {
//       console.error('Error fetching data from Finnhub:', error);
//       res.status(500).json({ error: 'Failed to fetch data from Finnhub' });
//   }
// });


// Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
