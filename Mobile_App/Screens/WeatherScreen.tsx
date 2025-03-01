import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";

const API_URL = "https://adithyakithmina-greenweather.hf.space";

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async () => {
    if (!city.trim()) {
      Toast.show({ type: "error", text1: "Error", text2: "City name cannot be empty." });
      return;
    }

    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const response = await axios.get(`${API_URL}?city=${encodeURIComponent(city.trim())}`);
      setWeatherData(response.data);
    } catch (err) {
      setError("Could not fetch weather data.");
      Toast.show({ type: "error", text1: "Error", text2: "Could not fetch weather data." });
    } finally {
      setLoading(false);
    }
  }, [city]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.innerContainer}>
          <Text style={styles.title}>GreenGuard</Text>
          <Text style={styles.title1}>Weather Forecast</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city name"
            value={city}
            onChangeText={setCity}
            editable={!loading}
            placeholderTextColor="#888"
          />
          <TouchableOpacity 
            style={[styles.button, !city.trim() && styles.buttonDisabled]} 
            onPress={fetchWeather} 
            disabled={loading || !city.trim()}
          >
          <Text style={styles.buttonText}>{loading ? "Loading..." : "Get Weather"}</Text>
          </TouchableOpacity>
          {error && <Text style={styles.error}>{error}</Text>}

          {weatherData && (
            <View style={styles.dataCard}>
              <Text style={styles.dataTitle}>{weatherData.city}</Text>
              <Text style={styles.bigTemperature}>{weatherData.current_temp}°C</Text>
              <View style={styles.tempRow}>
                <Text style={styles.minMaxTemp}>Min🔻{weatherData.temp_min}°C</Text>
                <Text style={styles.minMaxTemp}>Max🔺{weatherData.temp_max}°C</Text>
              </View>
              <Text style={styles.dataText}>🥶 Feels Like: {weatherData.feels_like}°C</Text>
              <Text style={styles.dataText}>🌦️ {weatherData.description}</Text>
              <Text style={styles.dataText}>💧 Humidity: {weatherData.humidity}%</Text>
              <Text style={styles.dataText}>💨 Wind Speed: {weatherData.WindGustSpeed} ms⁻¹</Text>
              <Text style={styles.dataText}>🧭 {weatherData.wind_direction}°</Text>
              <Text style={styles.dataText}>🔽 Pressure: {weatherData.pressure} hPa</Text>
              <Text style={styles.dataText1}>Tomorrow Rain forecast</Text>
              <Text style={styles.dataText}>🌧️ Rain Probability: {weatherData.rain_probability}%</Text>
              <Text style={styles.dataText}>☔ Will it rain? {weatherData.will_rain}</Text>

              {weatherData.future_forecast?.times?.length ? (
                <>
                  <Text style={styles.forecastTitle}>🌤️ Hourly Forecast</Text>
                  <View>
                    {weatherData.future_forecast.times.map((time, index) => (
                      <View key={index} style={styles.forecastItem}>
                        <Text style={styles.forecastTime}>🕒 {time}</Text>
                        <View style={styles.forecastBottomRow}>
                          <Text style={styles.forecastLeftText}>🌡️ {weatherData.future_forecast.temperature[index]}°C</Text>
                          <Text style={styles.forecastRightText}>💧 {weatherData.future_forecast.humidity[index]}%</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={styles.noForecast}>No hourly forecast available.</Text>
              )}
            </View>
          )}
          <Toast />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scrollContainer: { flexGrow: 1, paddingVertical: 20 },
  innerContainer: { alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "black", marginBottom: 20 },
  title1: { fontSize: 20, fontWeight: "bold", color: "black", marginBottom: 15 },
  input: { width: "90%", padding: 12, borderRadius: 20, backgroundColor: "rgba(191, 252, 191, 0.9)", fontSize: 16, marginBottom: 12, color: "#333", textAlign: "center" },
  button: { backgroundColor: "rgba(15, 192, 15, 0.74)", padding: 14, borderRadius: 20, width: "90%", alignItems: "center" },
  buttonDisabled: { backgroundColor: "rgba(191, 252, 191, 0.35)" },
  buttonText: { color: "black", fontSize: 18, fontWeight: "bold" },
  error: { color: "red", marginTop: 10, fontSize: 16 },
  dataCard: { marginTop: 20, padding: 20, backgroundColor: "rgba(17, 213, 86, 0.28)", borderRadius: 20, width: "90%" },
  dataTitle: { fontSize: 22, fontWeight: "bold", color: "black", textAlign: "center" },
  bigTemperature: { fontSize: 50, fontWeight: "bold", color: "black", textAlign: "center" },
  tempRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 10 },
  minMaxTemp: { fontSize: 18, color: "black", marginHorizontal: 10 },
  dataText: { fontSize: 18, color: "black", marginVertical: 4 },
  dataText1: { fontSize: 18, color: "black", marginVertical: 10, textAlign: "center", fontWeight:"bold" },
  forecastItem: { padding: 12, backgroundColor: "rgba(255, 255, 255, 0.51)", marginVertical: 10, borderRadius: 20 },
  noForecast: { textAlign: "center", fontSize: 16, color: "#eee", marginTop: 10 },
  forecastTitle: { fontSize: 20, fontWeight: "bold", color: "black", marginTop: 15, textAlign: "center" },
  forecastBottomRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 5 },
  forecastLeftText: { fontSize: 16, fontWeight: "bold", color: "black" },
  forecastRightText: { fontSize: 16, fontWeight: "bold", color: "black" },
  forecastTime: { fontSize: 16, fontWeight: "bold", color: "black", textAlign:"center" },

});

export default WeatherApp;