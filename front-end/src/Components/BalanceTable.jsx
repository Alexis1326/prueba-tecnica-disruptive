import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { FaBitcoin, FaEthereum, FaRegBookmark } from 'react-icons/fa';


const socket = io("wss://realtime.messari.io/cable", {
  transports: ["websocket"],
});

function BalanceTable() {
  const [balances, setBalances] = useState([]);
  
  const fetchBalances = (updatedAsset) => {
    const assetIds = balances.map((asset) => asset.id);
    const ids = updatedAsset ? [...assetIds, updatedAsset.id].join(",") : assetIds.join(",");

    axios
      .get("https://data.messari.io/api/v2/assets", {
        params: {
          fields: "id,name,symbol,metrics/market_data/price_usd",
          ids: ids,
        },
      })
      .then((response) => {
        setBalances(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  useEffect(() => {
    socket.emit("subscribe", {
      channel: "assets:global-updates",
      message_type: "price_data",
    });

    socket.on("message", (message) => {
      const data = JSON.parse(message);
      if (data.type === "update" && data.topic.includes("price_data")) {
        const asset = data.payload;
        fetchBalances(asset);
      }
      setBalances(prevBalances => [...prevBalances]); // <- Actualizar el estado de la tabla
    });

    return () => {
      socket.emit("unsubscribe", {
        channel: "assets:global-updates",
        message_type: "price_data",
      });
      socket.off("message");
    };
  }, []);

  const filteredBalances = balances.filter(
    (asset) => asset.symbol === "BTC" || asset.symbol === "ETH" || asset.symbol === "ADA"
  ).slice(0, 3);
  
  // Función para convertir la data en formato JSON
  const handleExportJSON = () => {
    const data = JSON.stringify(filteredBalances);
    const file = new Blob([data], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = 'balances.json';
    a.click();
  }

  // Función para convertir la data en formato CSV
  const handleExportCSV = () => {
    const rows = filteredBalances.map(asset => {
      return `${asset.symbol},${asset.name},TODO: Fetch balance from API,$${asset.metrics.market_data.price_usd.toFixed(2)}\r\n`;
    })
    const csv = `Symbol,Name,Balance,Value (USD)\r\n${rows.join('')}`;
    const file = new Blob([csv], {type: 'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = 'balances.csv';
    a.click();
  }

  return(
    <div className="flex justify-center" style={{backgroundImage: `url('https://s10.s3c.es/imag/_v0/770x420/9/8/b/cripto-dogecoin-bitcoin.jpg')`}}>
      <div className="table-responsive">
        <table className="w-full bg-gray-900 border-collapse border-2 border-blue-900 rounded-xl overflow-hidden text-white">
          <thead className="text-gray-200">
            <tr>
              <th className="p-4 font-medium text-lg border-b-2 border-gray-400">Symbol</th>
              <th className="p-4 font-medium text-lg border-b-2 border-gray-400">Name</th>
              <th className="p-4 font-medium text-lg border-b-2 border-gray-400">Balance</th>
              <th className="p-4 font-medium text-lg border-b-2 border-gray-400">Value (USD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredBalances.map((asset) => (
              <tr key={asset.id} className="border-b border-gray-800">
                <td className="p-4 font-medium">
                  {asset.symbol === 'BTC' && <FaBitcoin className="inline-block mr-2 bg-yellow-500 rounded-full p-1" />}
                  {asset.symbol === 'ETH' && <FaEthereum className="inline-block mr-2 bg-blue-500 rounded-full p-1" />}
                  {asset.symbol === 'ADA' && <FaRegBookmark className="inline-block mr-2 bg-green-500 rounded-full p-1" />}
  
                  {asset.symbol}
                </td>
                <td className="p-4 font-medium">{asset.name}</td>
                <td className="p-4">TODO: Fetch balance from API</td>
                <td className="p-4 font-medium">${asset.metrics.market_data.price_usd.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <button onClick={handleExportJSON} className="mr-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Export JSON
          </button>
          <button onClick={handleExportCSV} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );  
}


export default BalanceTable;
