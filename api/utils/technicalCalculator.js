/**
 * Technical Indicators Calculator
 * Client-side calculation of indicators from FMP price data
 */

/**
 * Calculate Simple Moving Average (SMA)
 * @param {Array} prices - Array of price objects with {date, close}
 * @param {Number} period - SMA period (e.g., 50, 200)
 * @returns {Number|null} - Latest SMA value
 */
function calculateSMA(prices, period) {
    if (!prices || prices.length < period) return null;

    const closePrices = prices.slice(0, period).map(p => p.close || p.adjClose);
    const sum = closePrices.reduce((a, b) => a + b, 0);
    return sum / period;
}

/**
 * Calculate RSI (Relative Strength Index)
 * @param {Array} prices - Array of price objects with {date, close}
 * @param {Number} period - RSI period (typically 14)
 * @returns {Number|null} - Latest RSI value
 */
function calculateRSI(prices, period = 14) {
    if (!prices || prices.length < period + 1) return null;

    const closePrices = prices.slice(0, period + 1).map(p => p.close || p.adjClose);

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain/loss
    for (let i = 1; i <= period; i++) {
        const change = closePrices[i - 1] - closePrices[i];
        if (change > 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return Math.round(rsi * 100) / 100;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param {Array} prices - Array of price objects
 * @returns {Object|null} - {macd, signal, histogram}
 */
function calculateMACD(prices) {
    if (!prices || prices.length < 26) return null;

    const closePrices = prices.map(p => p.close || p.adjClose);

    // Calculate EMAs
    const ema12 = calculateEMA(closePrices, 12);
    const ema26 = calculateEMA(closePrices, 26);

    if (!ema12 || !ema26) return null;

    const macd = ema12 - ema26;

    return {
        macd: Math.round(macd * 100) / 100,
        signal: null, // Would need more history for accurate signal line
        histogram: null
    };
}

/**
 * Calculate EMA (Exponential Moving Average)
 * @param {Array} values - Array of values
 * @param {Number} period - EMA period
 * @returns {Number|null}
 */
function calculateEMA(values, period) {
    if (!values || values.length < period) return null;

    const k = 2 / (period + 1);
    let ema = values[values.length - 1]; // Start with first value

    for (let i = values.length - 2; i >= 0; i--) {
        ema = (values[i] - ema) * k + ema;
    }

    return ema;
}

module.exports = {
    calculateSMA,
    calculateRSI,
    calculateMACD,
    calculateEMA
};
