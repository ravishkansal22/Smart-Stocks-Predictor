const stocks = [
    "AAPL - Apple Inc.",
    "MSFT - Microsoft",
    "GOOGL - Alphabet",
    "AMZN - Amazon",
    "NVDA - NVIDIA",
    "TSLA - Tesla",
    "META - Meta Platforms",
    "NFLX - Netflix",
    "RS - Reliance",
    "BLK - BlackRock"
];
const csvMap = {
    GOOGL: "GOOG.csv",
    GOOG: "GOOG.csv",
    AAPL: "AAPL.csv",
    MSFT: "MSFT.csv",
    AMZN: "AMZN.csv",
    NVDA: "NVDA.csv",
    TSLA: "TSLA.csv",
    META: "META.csv",
    NFLX: "NFLX.csv"
};

const ctx = document.getElementById("pricechart").getContext("2d");

window.priceChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Stock Price",
            data: [],
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6

        }]
    },
    options: {
        interaction:{
            mode:"index",
        intersect:false,
        },
        responsive: true,
        plugins: {
            tooltip:{enabled:true},
            legend: { display: true }
        },
        scales: {
            y: { beginAtZero: false }
        },
        hover: { mode: "index", intersect: false }
}
    }
);



const input = document.getElementById("stockname");
const suggestions = document.getElementById("suggestions");

input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    suggestions.innerHTML = "";

    if (!query) {
        suggestions.classList.add("hidden");
        return;
    }

    const matches = stocks.filter(stock =>
        stock.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
        suggestions.classList.add("hidden");
        return;
    }

    matches.forEach(stock => {
        const li = document.createElement("li");
        li.textContent = stock;

        li.addEventListener("click", () => {
            input.value = stock.split(" - ")[0];
            suggestions.classList.add("hidden");
        });

        suggestions.appendChild(li);
    });

    suggestions.classList.remove("hidden");
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".autocomplete")) {
        suggestions.classList.add("hidden");
    }
});

async function predict() {
  let sym = document.getElementById("stockname").value.trim().toUpperCase().split(" - ")[0];
  document.getElementById("symbolname").innerText = sym;
  await loadStockCSV(sym);
  loadNews();

  fetch(`http://127.0.0.1:8000/predict/${sym}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        document.getElementById("result").innerText = data.error;
        document.getElementById("predictionText").innerText = "";
      } else {
        document.getElementById("predictionText").innerText = "Result";

        document.getElementById("result").innerText =
          "Last Price: $" + data.last_price.toFixed(3) +
          " | Predicted: $" + data.predicted_price.toFixed(3);

        document.getElementById("ma100Value").innerText = data.ma100.toFixed(3);
        document.getElementById("rsiValue").innerText = data.rsi.toFixed(2);
        document.getElementById("volumeValue").innerText = data.volume.toLocaleString();
        document.getElementById("volatilityValue").innerText =
          (data.volatility * 100).toFixed(2) + "%";
      }
    })
    .catch(() => {
      document.getElementById("result").innerText = "Server not running";
    });
}


const popularButtons = document.getElementsByClassName("popbut");
const stockInput = document.getElementById("stockname");

Array.from(popularButtons).forEach(button => {
    button.addEventListener("click", () => {
        stockInput.value = button.innerText;
        suggestions.classList.add("hidden");
    });
});

async function loadStockCSV(sym) {
    try {
        const file = csvMap[sym];
        if (!file) throw new Error("CSV not mapped");

        const response = await fetch(file);
        if (!response.ok) throw new Error("CSV not found");

        const csv = await response.text();
        const rows = csv.trim().split(/\r?\n/);
        const headers = rows[0].split(",").map(h => h.trim());

        const dateIdx = headers.indexOf("Date");
        const closeIdx =
  headers.indexOf("Close Price") !== -1
    ? headers.indexOf("Close Price")
    : headers.indexOf("Close");


        if (dateIdx === -1 || closeIdx === -1) {
            throw new Error("CSV must contain Date and Close columns");
        }

        const labels = [];
        const prices = [];

        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(",");
            labels.push(cols[dateIdx]);
            prices.push(parseFloat(cols[closeIdx]));
        }

        updateChart(sym, labels, prices);

    } catch (err) {
        console.error(err);
        document.getElementById("result").innerText =
            "Loading...";
    }
}

function updateChart(sym, labels, prices) {
    if (!window.priceChart) {
        console.error("priceChart is not initialized");
        return;
    }

    priceChart.data.labels = labels.slice(-30);
    priceChart.data.datasets[0].label = `${sym} Close Price`;
    priceChart.data.datasets[0].data = prices.slice(-30);
    priceChart.update();
};


function display(){
    let chart=document.getElementById("dash")
    chart.style.display="block"
}

const btn = document.getElementById("predictbutton");

btn.addEventListener("click", () => {
  btn.classList.add("loading");
  btn.disabled = true;

  setTimeout(() => {
    btn.classList.remove("loading");
    btn.disabled = false;
  }, 3000);
});




const apiKey = "d5kv4bpr01qt47mfnse0d5kv4bpr01qt47mfnseg";

const companyMap = {
  google: "GOOGL",
  GOOG: "GOOGL",
  GOOGL: "GOOGL",
  AAPL: "AAPL",
  TSLA: "TSLA",
  MSFT: "MSFT",
  NVDA: "NVDA",
  AMZN: "AMZN",
  BLK:"BLK",
  RS:"RS",

};

function loadNews() {
    document.getElementById("newsbox").style.display = "block";
  const input = document.getElementById("stockname").value.toUpperCase();
  const symbol = companyMap[input];

  const newsDiv = document.getElementById("news");
  newsDiv.innerHTML = " ";

  if (!symbol) {
    newsDiv.innerHTML = "<p>Company not supported</p>";
    return;
  }

  const from = "2025-01-01";
  const to = "2026-12-31";

  fetch(
    `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${apiKey}`
  )
    .then(res => res.json())
    .then(data => {
      data.slice(0, 5).forEach(n => {
        const div = document.createElement("div");
        div.className = "news-item";
        div.innerHTML = `<ul>
          <li><a href="${n.url}" target="_blank">${n.headline}</a></li>
          </ul>
        `;
        newsDiv.appendChild(div);
      });
    })
    .catch(() => {
      newsDiv.innerHTML = "<p>News service unavailable</p>";
    });
}

// async function loadLiveOnce(sym) {
//   try {
//     const res = await fetch(
//       `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${apiKey}`
//     );
//     const data = await res.json();

//     const livePrice = data.c;
//     if (!livePrice) throw new Error("No live price");

//     // add live point to existing history
//     const now = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

//     window.priceChart.data.labels.push(now);
//     window.priceChart.data.datasets[0].data.push(livePrice);

//     // keep last 30 points
//     if (window.priceChart.data.labels.length > 30) {
//       window.priceChart.data.labels.shift();
//       window.priceChart.data.datasets[0].data.shift();
//     }

//     window.priceChart.update();
//   } catch (err) {
//     console.log(err);
//   }
// }


const chatToggle = document.getElementById("chatToggle");
const chatWindow = document.getElementById("chatWindow");
const chatClose = document.getElementById("chatClose");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");

function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatToggle.addEventListener("click", () => {
  chatWindow.classList.toggle("chat-hidden");
});

chatClose.addEventListener("click", () => {
  chatWindow.classList.add("chat-hidden");
});

async function sendToBot(message) {
  const res = await fetch("http://127.0.0.1:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Chat server error");
  }

  return data.reply;
}

async function handleSend() {
  const msg = chatInput.value.trim();
  if (!msg) return;

  chatInput.value = "";
  addMsg(msg, "user");

  const typing = document.createElement("div");
  typing.className = "msg bot";
  typing.textContent = "Typing...";
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const reply = await sendToBot(msg);
    typing.remove();
    addMsg(reply, "bot");
  } catch (e) {
    typing.remove();
    addMsg("Bot is unavailable right now.", "bot");
    console.error(e);
  }
}

chatSend.addEventListener("click", handleSend);

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSend();
});