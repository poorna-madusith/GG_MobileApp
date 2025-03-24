import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";

export default function PestDetection() {
  const navigation = useNavigation();
  const [mode, setMode] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);

  const handleMediaPick = (type) => {
    launchImageLibrary({ mediaType: type }, (response) => {
      if (response.didCancel) {
        Alert.alert("Cancelled", "Selection cancelled.");
      } else if (response.errorMessage) {
        Alert.alert("Error", response.errorMessage);
      } else {
        setFile(response.assets[0]);
      }
    });
  };

  const handleMediaCapture = (type) => {
    launchCamera({ mediaType: type }, (response) => {
      if (response.didCancel) {
        Alert.alert("Cancelled", "Capture cancelled.");
      } else if (response.errorMessage) {
        Alert.alert("Error", response.errorMessage);
      } else {
        setFile(response.assets[0]);
      }
    });
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert("Error", "No file selected or captured");
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.type,
      name: file.fileName,
    });

    try {
      setLoading(true);
      const response = await axios.post("https://adithyakithmina-pest.hf.space/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;
      setPrediction(data.class);
      setConfidence(data.confidence);
    } catch (error) {
      console.error("Error predicting pest:", error);

      if (error.code === "ECONNABORTED") {
        Alert.alert("Connection Timeout", "The request took too long to complete. Please check your internet connection and try again.");
      } else if (error.code === "ERR_NETWORK") {
        Alert.alert("Network Error", "Unable to connect to the prediction service. Please check your internet connection.");
      } else if (error.response) {
        switch (error.response.status) {
          case 400:
            Alert.alert("Invalid Image", "The selected image could not be processed. Please try with a different image.");
            break;
          case 413:
            Alert.alert("Image Too Large", "The selected image is too large. Please choose a smaller image.");
            break;
          case 500:
            Alert.alert("Server Error", "The prediction service is currently experiencing issues. Please try again later.");
            break;
          default:
            Alert.alert("Prediction Error", "An error occurred while processing your image. Please try again.");
        }
      } else {
        Alert.alert("Prediction Error", "Failed to get predictions. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Pest Detection</Text>
        </View>

        <View style={styles.selectionBox}>
          {!mode ? (
            <>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setMode("image")}
              >
                <Icon name="photo" size={32} color="#000" />
                <Text style={styles.iconButtonText}>Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setMode("video")}
              >
                <Icon name="videocam" size={32} color="#000" />
                <Text style={styles.iconButtonText}>Video</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleMediaPick(mode)}
              >
                <Icon name="folder" size={32} color="#000" />
                <Text style={styles.iconButtonText}>Select {mode}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleMediaCapture(mode)}
              >
                <Icon name="camera" size={32} color="#000" />
                <Text style={styles.iconButtonText}>Capture {mode}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {file && (
          <View style={styles.preview}>
            <Image source={{ uri: file.uri }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.selectButton}
              onPress={handleUpload}
              disabled={loading}
            >
              <Text style={styles.selectButtonText}>
                {loading ? "Detecting..." : "Detect Pest"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        
        {prediction && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>Prediction: {prediction}</Text>
            <Text style={styles.resultText}>
              Confidence: {confidence?.toFixed(2)}%
            </Text>
          </View>
        )}

        {file && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setFile(null);
              setPrediction(null);
              setConfidence(null);
            }}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingTop: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  topBar: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
    width: "90%",
    marginTop: 40,
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 35,
    includeFontPadding: false,
    padding: 0,
    margin: 0,
  },
  title: {
    fontSize: 25,
    color: "#000",
    fontFamily: "BebasNeue-Regular",
    marginTop: 40,
    fontWeight: "bold",
  },
  selectionBox: {
    backgroundColor: 'rgba(227, 227, 227, 0.9)',
    width: "90%",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    alignItems: 'center',
    padding: 15,
  },
  iconButtonText: {
    marginTop: 5,
    fontSize: 16,
    fontFamily: "RobotoCondensed-Bold",
    color: "#000000",
  },
  preview: {
    marginTop: 20,
    alignItems: "center",
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
  },
  selectButton: {
    backgroundColor: "#BFFCBF",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  selectButtonText: {
    fontSize: 16,
    color: "#000000",
    fontFamily: "RobotoCondensed-Bold",
    fontWeight: "600",
  },
  resultBox: {
    marginTop: 20,
    backgroundColor: 'rgba(223, 242, 236, 0.9)',
    padding: 15,
    borderRadius: 10,
    width: "90%",
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#38761D",
    fontFamily: "RobotoCondensed-Bold",
  },
  clearButton: {
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#F8D7DA",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#721C24",
    fontFamily: "RobotoCondensed-Bold",
  }
});