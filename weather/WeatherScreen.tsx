import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";

// ✅ Replace with your actual hosted API URL
const API_URL = "https://adithyakithmina-greenweather.hf.space"; 

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    if (!city.trim()) {
      Toast.show({ type: "error", text1: "Error", text2: "City name cannot be empty." });
      return;
    }

    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const response = await axios.get(`${API_URL}?city=${encodeURIComponent(city.trim())}`);
      console.log("API Response:", response.data);
      setWeatherData(response.data);
    } catch (err) {
      console.error("Error fetching data:", err.response?.data || err.message);
      setError("Could not fetch weather data.");
      Toast.show({ type: "error", text1: "Error", text2: "Could not fetch weather data." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather Forecast</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter city name"
        value={city}
        onChangeText={setCity}
        editable={!loading}
      />
      <TouchableOpacity style={styles.button} onPress={fetchWeather} disabled={loading || !city.trim()}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Get Weather"}</Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
      {weatherData && (
        <View style={styles.dataCard}>
          <Text style={styles.dataText}>City: {weatherData.city}</Text>
          <Text style={styles.dataText}>Temperature: {weatherData.current_temp}°C</Text>
          <Text style={styles.dataText}>Humidity: {weatherData.humidity}%</Text>
          <Text style={styles.dataText}>Wind: {weatherData.WindGustSpeed} m/s</Text>
          <Text style={styles.dataText}>Rain Probability: {weatherData.rain_probability}%</Text>
          <Text style={styles.dataText}>Will it rain? {weatherData.will_rain}</Text>
        </View>
      )}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#6200ea" },
  title: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 20 },
  input: { width: "80%", padding: 10, borderRadius: 5, backgroundColor: "white", marginBottom: 10 },
  button: { backgroundColor: "#03dac6", padding: 10, borderRadius: 5 },
  buttonText: { color: "white", fontSize: 16 },
  error: { color: "red", marginTop: 10 },
  dataCard: { marginTop: 20, padding: 20, backgroundColor: "white", borderRadius: 5 },
  dataText: { fontSize: 16, color: "black" },
});

export default WeatherApp;
