from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import tensorflow as tf
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler

app = FastAPI()
@app.get("/")
def home():
    return {"status": "AI Stock Predictor Running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
model = tf.keras.models.load_model("AlphaStocks AI.keras")
@app.get("/predict/{symbol}")
def predict(symbol: str):
    symbol = symbol.upper()
    data = yf.download(symbol, period="1y")
    if len(data) < 100:
        return {"error": "Not enough data to predict"}
    close_prices = data[['Close']].values
    scaler = MinMaxScaler(feature_range=(0,1))
    scaled = scaler.fit_transform(close_prices)
    X = scaled[-100:].reshape(1,100,1)
    pred_scaled = model.predict(X)
    pred = scaler.inverse_transform(pred_scaled)
    return {
        "symbol": symbol,
        "last_price": float(close_prices[-1][0]),
        "predicted_price": float(pred[0][0])
    }