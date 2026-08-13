const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
// Loading Page
app.get('/', (req, res) => {
  res.render('index', { coins: null, error: null });
});
app.get('/load', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets',
      {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CryptoPortfolioApp/1.0',
        },
      }
    );

    const coins = response.data;

    // Randomly select 3 coins from the list
    const shuffled = [...coins].sort(() => 0.5 - Math.random());
    const selectedCoins = shuffled.slice(0, 3).map((coin) => {
        const unitsFor1000 =
        coin.current_price > 0
          ? (1000 / coin.current_price).toFixed(6)
          : '0.000000';
          return {
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price,
        priceChange24h: coin.price_change_percentage_24h,
        unitsFor1000: unitsFor1000,
        image: coin.image,
      };
    });
    res.render('index', { coins: selectedCoins, error: null });
  } catch (error) {
    console.error('Error fetching data from CoinGecko:', error.message);

    let errorMessage = 'Failed to fetch cryptocurrency market data. Please try again.';
    if (error.response && error.response.status === 429) {
      errorMessage =
        'Rate limit exceeded (429 Too Many Requests). Please wait a minute and try again or use a CoinGecko API Key.';
    }

    res.render('index', { coins: null, error: errorMessage });
  }
});

//Run the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
