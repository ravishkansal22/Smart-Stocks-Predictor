const stocks = [
    "AAPL - Apple Inc.",
    "MSFT - Microsoft",
    "GOOGL - Alphabet",
    "AMZN - Amazon",
    "NVDA - NVIDIA",
    "TSLA - Tesla",
    "META - Meta Platforms",
    "NFLX - Netflix"
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
            pointRadius: 0
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

function predict() {
   let sym = document.getElementById("stockname").value
    .trim()
    .toUpperCase();

    loadStockCSV(sym);
    fetch(`http://127.0.0.1:8000/predict/${sym}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById("result").innerText = data.error;
                document.getElementById("predictionText").innerText=""
                
            } else {
                document.getElementById("result").innerText =
                    "Last Price: $" + data.last_price.toFixed(3) +
                    " | Predicted: $" + data.predicted_price.toFixed(3);
                document.getElementById("predictionText").innerText="Result"
                document.getElementById("predictionText").style="font-size: 1.2em;"
                document.getElementById("result").innerText =
                "Last Price: $" + data.last_price.toFixed(3) +
                " | Predicted: $" + data.predicted_price.toFixed(3);

                document.getElementById("ma100Value").innerText =
                data.ma100.toFixed(3);

                document.getElementById("rsiValue").innerText =
                data.rsi.toFixed(2);

                document.getElementById("volumeValue").innerText =
                data.volume.toLocaleString();

                document.getElementById("volatilityValue").innerText =
                (data.volatility * 100).toFixed(2) + "%";


               
            }
        })
        .catch(err => {
            document.getElementById("result").innerText = "Server not running";
            
            document.getElementById("predictionText").innerText=""
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
        const closeIdx = headers.indexOf("Close Price");

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
            "Historical data not available";
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
