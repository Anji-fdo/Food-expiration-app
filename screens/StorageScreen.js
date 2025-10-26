// StorageScreen.js — Pro Mobile UI (Redesigned)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet
} from 'react-native';

import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function StorageScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [foodName, setFoodName] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [featureImpact, setFeatureImpact] = useState(null);
  const [overrideReason, setOverrideReason] = useState(null);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://172.20.10.4:5000/latest');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSensorHistory = async () => {
    try {
      const res = await axios.get('http://172.20.10.4:5000/sensor_history');
      setSensorHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch sensor history');
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://172.20.10.4:5000/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to fetch alerts');
    }
  };

  const checkSpoilage = async () => {
    if (!foodName) return Alert.alert('Enter a food name');
    try {
      const res = await axios.post('http://172.20.10.4:5000/check_spoilage', { food: foodName });
      setPrediction(res.data.prediction);
      setRecommendation(res.data.recommendation);
      setFeatureImpact(res.data.feature_importance);
      setOverrideReason(res.data.override_reason);
    } catch (err) {
      console.error('Prediction error:', err);
      if (err.response?.status === 400) {
        const suggestion = err.response?.data?.suggestion?.[0];
        Alert.alert('Unknown Food Item', suggestion ? `Did you mean: ${suggestion}?` : err.response.data.error);
      } else {
        Alert.alert('Prediction failed. Try again.');
      }
    }
  };

  useEffect(() => {
    fetchData();
    fetchSensorHistory();
    fetchAlerts();
    const interval = setInterval(() => {
      fetchData();
      fetchAlerts();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatChartData = (key) => {
    return {
      labels: sensorHistory.map((_, i) => i.toString()),
      datasets: [{ data: sensorHistory.map((d) => d[key]) }],
    };
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📦 Storage Dashboard</Text>

      {alerts.map((alert, index) => (
        <Text key={index} style={[styles.alert, styles[alert.priority]]}>
          {alert.message}
        </Text>
      ))}

      
      <View style={styles.cardBox}>
        <Text style={styles.sectionTitle}>📡 Live Sensor Readings</Text>
        {loading || !data ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : (
          <View>
            <Text style={styles.sensorLine}>🌡 Temperature: {data.temperature} °C</Text>
            <Text style={styles.sensorLine}>💧 Humidity: {data.humidity} %</Text>
            <Text style={styles.sensorLine}>🧪 Ethylene: {data.ethylene} ppm</Text>
            <Text style={styles.sensorLine}>🧠 Gas Type: {data.gas_type}</Text>
            <Text style={styles.sensorLine}>🔬 Risk: {data.ethylene_risk}</Text>
            <Text style={styles.timestamp}>Updated: {new Date(data.timestamp).toLocaleString()}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBox}>
        <Text style={styles.sectionTitle}>🍎 Check Food Spoilage</Text>
        <TextInput
          placeholder="Enter food (e.g., Apple)"
          value={foodName}
          onChangeText={setFoodName}
          style={styles.inputField}
        />
        <TouchableOpacity style={styles.button} onPress={checkSpoilage}>
          <Text style={styles.buttonText}>Check Spoilage</Text>
        </TouchableOpacity>

        {prediction && (
          <View style={[styles.resultBox, prediction === 'Safe' ? styles.safe : styles.warning]}>
            <Text style={styles.resultTitle}>{prediction === 'Safe' ? '✅' : '⚠️'} Prediction: {prediction}</Text>
            <Text style={styles.recommendation}>{recommendation}</Text>
            {overrideReason && <Text style={styles.overrideReason}>🔍 {overrideReason}</Text>}
            {featureImpact && <Text style={styles.impactText}>🧠 Feature Impact: {JSON.stringify(featureImpact)}</Text>}
          </View>
        )}
      </View>


      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>📈 Sensor History</Text>
        <Text>Temperature</Text>
        <LineChart
          data={formatChartData('temperature')}
          width={Dimensions.get('window').width - 40}
          height={180}
          chartConfig={chartStyle}
          style={styles.chart}
        />

        <Text>Humidity</Text>
        <LineChart
          data={formatChartData('humidity')}
          width={Dimensions.get('window').width - 40}
          height={180}
          chartConfig={chartStyle}
          style={styles.chart}
        />

        <Text>Ethylene Gas</Text>
        <LineChart
          data={formatChartData('gas')}
          width={Dimensions.get('window').width - 40}
          height={180}
          chartConfig={chartStyle}
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
}

const chartStyle = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
  labelColor: () => '#6b7280',
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f9fafb' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1f2937' },
  alert: { padding: 10, borderRadius: 6, textAlign: 'center', marginBottom: 8 },
  high: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  low: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  cardBox: { backgroundColor: '#ffffff', borderRadius: 12, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#111827' },
  inputField: { borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10 },
  button: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  resultBox: { borderRadius: 10, padding: 15, marginTop: 10 },
  safe: { backgroundColor: '#ecfdf5', borderColor: '#10b981', borderWidth: 1 },
  warning: { backgroundColor: '#fef2f2', borderColor: '#ef4444', borderWidth: 1 },
  resultTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  recommendation: { fontSize: 14 },
  overrideReason: { fontSize: 13, color: '#6b7280', marginTop: 6 },
  impactText: { fontSize: 13, color: '#6b7280', marginTop: 6 },
  sensorLine: { fontSize: 14, marginVertical: 2 },
  timestamp: { fontSize: 12, color: '#6b7280', marginTop: 10 },
  chartCard: { backgroundColor: '#ffffff', padding: 10, borderRadius: 12, marginTop: 10 },
  chart: { marginVertical: 8, borderRadius: 8 },
});
