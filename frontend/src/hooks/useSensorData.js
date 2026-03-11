// useSensorData hook - subscribes to real-time sensor data via Socket.IO
import { useState, useEffect, useCallback } from 'react';
import socket, { connectSocket } from '../services/socket';
import api from '../services/api';

const useSensorData = (pumpId) => {
  const [latestData, setLatestData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial latest reading from API
  const fetchLatest = useCallback(async () => {
    if (!pumpId) return;
    try {
      const response = await api.get(`/sensors/data/${pumpId}/latest`);
      setLatestData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pumpId]);

  // Fetch historical data
  const fetchHistory = useCallback(async () => {
    if (!pumpId) return;
    try {
      const response = await api.get(`/sensors/data/${pumpId}`, { params: { limit: 50 } });
      setHistory(response.data.reverse());
    } catch (err) {
      console.error('Fetch history error:', err);
    }
  }, [pumpId]);

  useEffect(() => {
    fetchLatest();
    fetchHistory();
    connectSocket();

    // Subscribe to real-time sensor updates
    const handleSensorData = (data) => {
      if (data.pumpId === pumpId) {
        setLatestData(data);
        setHistory(prev => {
          const updated = [...prev, data];
          return updated.slice(-100); // keep last 100 readings
        });
      }
    };

    socket.on('sensor_data', handleSensorData);

    return () => {
      socket.off('sensor_data', handleSensorData);
    };
  }, [pumpId, fetchLatest, fetchHistory]);

  return { latestData, history, loading, error, refetch: fetchLatest };
};

export default useSensorData;
