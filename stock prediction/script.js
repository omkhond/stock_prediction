const API_KEY = "PROG7BSU5J9XV3ZA";
let chart;

async function loadStock() {
  const symbol = document.getElementById("symbol").value.toUpperCase();
  if (!symbol) return alert("Enter stock symbol");

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  const series = data["Time Series (Daily)"];
  if (!series) {
    alert("Invalid symbol or API limit reached");
    return;
  }

  const dates = Object.keys(series).slice(0, 30).reverse();
  const prices = dates.map(d => parseFloat(series[d]["4. close"]));

  drawChart(dates, prices);
  predict(prices, symbol);
}

function drawChart(dates, prices) {
  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels: dates,
      datasets: [{
        label: "Closing Price",
        data: prices,
        borderColor: "cyan",
        tension: 0.3
      }]
    },
    options: {
      plugins: { legend: { labels: { color: "white" } } },
      scales: {
        x: { ticks: { color: "white" } },
        y: { ticks: { color: "white" } }
      }
    }
  });
}

// Linear Regression
function predict(prices, symbol) {
  const n = prices.length;
  const x = [...Array(n).keys()];
  const sumX = x.reduce((a,b)=>a+b,0);
  const sumY = prices.reduce((a,b)=>a+b,0);
  const sumXY = x.reduce((s,i)=>s+i*prices[i],0);
  const sumXX = x.reduce((s,i)=>s+i*i,0);

  const slope = (n*sumXY - sumX*sumY)/(n*sumXX - sumX*sumX);
  const intercept = (sumY - slope*sumX)/n;

  const predicted = slope*n + intercept;
  const current = prices[prices.length-1];

  let decision = "HOLD";
  let color = "orange";

  if (predicted > current * 1.01) {
    decision = "BUY";
    color = "green";
  } else if (predicted < current * 0.99) {
    decision = "SELL";
    color = "red";
  }

  document.getElementById("result").innerHTML =
    `Current Price: <b>$${current.toFixed(2)}</b><br>
     Predicted Price: <b>$${predicted.toFixed(2)}</b><br>
     Recommendation: <b style="color:${color}">${decision}</b>`;
}
