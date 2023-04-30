const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.PORT || 3000;

app.use(express.json());

app.listen(PORT,() => {
    console.log(`🌟Server listening on port ${PORT}`);
});

app.get('/ganancia/:cripto/:cantidad/:anios', async (req, res) => {
    const { cripto, cantidad, anios } = req.params;
    const API_URL = `https://data.messari.io/api/v1/assets/${cripto}/metrics/market-data`;
  
    try {
      const response = await axios.get(API_URL);
      const price = response.data.data.market_data.price_usd;
      const inversion = cantidad / price;
      const retornosMensuales = {
        BTC: 0.05,
        ETH: 0.042,
        ADA: 0.01,
      };      
      const retornoMensual = retornosMensuales[cripto.toLowerCase()];
      const ganancia = inversion * (1 + retornoMensual) ** (anios * 12);
      const gananciaTotal = ganancia * price - cantidad;
  
      res.send(`${gananciaTotal.toFixed(2)}`);
    } catch (error) {
      console.error(error);
      res.send(`Hubo un error al obtener el valor de ${cripto}.`);
    }
  });

  