import axios from 'axios';

const API_BASE_URL = '/api/v1';

export const api = {
  getAssets: async () => {
    const res = await axios.get(`${API_BASE_URL}/assets/list`);
    return res.data;
  },

  getAssetHistory: async (symbol, startDate, endDate) => {
    const res = await axios.get(`${API_BASE_URL}/assets/history`, {
      params: { symbol, start_date: startDate, end_date: endDate }
    });
    return res.data;
  },

  calculateIndicators: async (symbol, smaPeriods = [20, 50], emaPeriods = [12, 26], startDate, endDate) => {
    const res = await axios.post(`${API_BASE_URL}/indicators/calculate`, {
      symbol,
      sma_periods: smaPeriods,
      ema_periods: emaPeriods,
      start_date: startDate,
      end_date: endDate
    });
    return res.data;
  },

  analyzeMetrics: async (symbol, startDate, endDate) => {
    const res = await axios.post(`${API_BASE_URL}/metrics/analyze`, {
      symbol,
      start_date: startDate,
      end_date: endDate
    });
    return res.data;
  },

  getCorrelationMatrix: async (symbols = ['GC=F', 'BTC-USD', 'NVDA', 'SPY'], startDate, endDate) => {
    const res = await axios.post(`${API_BASE_URL}/correlation/matrix`, {
      symbols,
      start_date: startDate,
      end_date: endDate
    });
    return res.data;
  },

  detectRegime: async (symbol, startDate, endDate) => {
    const res = await axios.post(`${API_BASE_URL}/regime/detect`, {
      symbol,
      start_date: startDate,
      end_date: endDate
    });
    return res.data;
  },

  runBacktest: async (payload) => {
    const res = await axios.post(`${API_BASE_URL}/backtest/run`, payload);
    return res.data;
  }
};
