import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import axios from "axios";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { Video } from "react-native-video";
import { useNavigation } from "@react-navigation/native";
import BackgroundPattern from '../components/BackgroundPattern';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';

const DetectionScreen = ({ route }: any) => {
  const { crop } = route.params;
  const navigation = useNavigation();

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [isVideoModalVisible, setVideoModalVisible] = useState(false);

  const URLS = {
    tea: "https://poorna95-tea-disease-classification.hf.space/predict",
    rice: "https://poorna95-rice-disease-classification.hf.space/predict",
    coconut: "https://poorna95-coconut-disease-classifier.hf.space/predict",
    cinnamon: "https://poorna95-cinnamon-disease-classification.hf.space/predict",
    pepper: "https://poorna95-blackpepper-disease-classification.hf.space/predict",
  };

  const PREDICTION_URL =
    crop === "tea"
      ? URLS.tea
      : crop === "coconut"
      ? URLS.coconut
      : crop === "cinnamon"
      ? URLS.cinnamon
      : crop === "pepper"
      ? URLS.pepper
      : URLS.rice;

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (isImageModalVisible) {
        setImageModalVisible(false);
        return true;
      }
      if (isVideoModalVisible) {
        setVideoModalVisible(false);
        return true;
      }
      // If no modals are open, handle normal back navigation
      handleBackPress();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [isImageModalVisible, isVideoModalVisible]);

  const requestPermissions = async () => {
    const cameraPermission = await request(
      PERMISSIONS.ANDROID.CAMERA
    );
    const storagePermission = await request(
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
    );

    if (
      cameraPermission !== RESULTS.GRANTED ||
      storagePermission !== RESULTS.GRANTED
    ) {
      Alert.alert(
        "Permissions Required",
        "Camera and storage permissions are required for the app to function properly."
      );
    }
  };

  const handleUpload = async (file: any) => {
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
      const response = await axios.post(PREDICTION_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;
      setPrediction(data.class);
      setConfidence(data.confidence);
    } catch (error) {
      console.error("Error predicting disease:", error);
      Alert.alert(
        "Prediction Error",
        "Failed to get predictions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (mediaType: "photo" | "video") => {
    const options = { mediaType };
    const result = await launchImageLibrary(options);
    if (result.assets && result.assets.length > 0) {
      setSelectedFile(result.assets[0]);
      setPrediction(null);
      setConfidence(null);
    }
  };

  const handleFileCapture = async (mediaType: "photo" | "video") => {
    const options = { mediaType };
    const result = await launchCamera(options);
    if (result.assets && result.assets.length > 0) {
      setSelectedFile(result.assets[0]);
      setPrediction(null);
      setConfidence(null);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPrediction(null);
    setConfidence(null);
    setSolution(null);
  };

  const handleBackPress = () => {
    setSelectedFile(null);
    setPrediction(null);
    setConfidence(null);
    setSolution(null);
    navigation.navigate("CropSelection");
  };

  const fetchSolution = async () => {
    try {
      const response = await axios.get(
        `https://greenguard-solutions-api-09584c4eab4d.herokuapp.com/api/diseases/${prediction}`
      );
      
      if (response.data && response.data.solution) {
        navigation.navigate('Solution', {
          diseaseName: prediction,
          solution: response.data.solution
        });
      } else {
        Alert.alert("No Solution Found", "No solution available for this disease.");
      }
    } catch (error) {
      console.error("Error fetching solution:", error);
      Alert.alert(
        "Solution Error", 
        error.message || "Failed to get solution. Please try again."
      );
    }
  };

  const renderModal = (isImage: boolean) => {
    return (
      <Modal
        isVisible={isImage ? isImageModalVisible : isVideoModalVisible}
        onBackdropPress={() => isImage ? setImageModalVisible(false) : setVideoModalVisible(false)}
        onBackButtonPress={() => isImage ? setImageModalVisible(false) : setVideoModalVisible(false)}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.modalOption}
            onPress={() => {
              isImage ? handleFileCapture("photo") : handleFileCapture("video");
              isImage ? setImageModalVisible(false) : setVideoModalVisible(false);
            }}
          >
            <Icon name="camera-alt" size={24} color="#000" />
            <Text style={styles.modalOptionText}>
              {isImage ? "Capture Image" : "Capture Video"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modalOption}
            onPress={() => {
              isImage ? handleFileSelect("photo") : handleFileSelect("video");
              isImage ? setImageModalVisible(false) : setVideoModalVisible(false);
            }}
          >
            <Icon name="upload-file" size={24} color="#000" />
            <Text style={styles.modalOptionText}>
              {isImage ? "Upload Image" : "Upload Video"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  // Rest of your component remains the same...
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <BackgroundPattern 
          numberOfElements={25}
          opacity={0.4}
        />
        
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {crop.charAt(0).toUpperCase() + crop.slice(1).toLowerCase()} Disease Detection
          </Text>
        </View>

        <View style={styles.selectionBox}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setImageModalVisible(true)}
          >
            <Icon name="camera-alt" size={32} color="#000" />
            <Text style={styles.iconButtonText}>Image</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setVideoModalVisible(true)}
          >
            <Icon name="videocam" size={32} color="#000" />
            <Text style={styles.iconButtonText}>Video</Text>
          </TouchableOpacity>
        </View>

        {renderModal(true)}
        {renderModal(false)}

        {selectedFile && (
          <View style={styles.preview}>
            {selectedFile.type.startsWith("image/") ? (
              <Image
                source={{ uri: selectedFile.uri }}
                style={styles.imagePreview}
              />
            ) : (
              <Video
                source={{ uri: selectedFile.uri }}
                style={styles.videoPreview}
                controls
                resizeMode="contain"
              />
            )}

            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleUpload(selectedFile)}
            >
              <Text style={styles.selectButtonText}>Predict Disease</Text>
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
            <TouchableOpacity
              style={styles.solutionButton}
              onPress={fetchSolution}
            >
              <Text style={styles.solutionButtonText}>Get Solution</Text>
            </TouchableOpacity>
          </View>
        )}

        {solution && (
          <View style={styles.solutionBox}>
            <Text style={styles.solutionText}>{solution}</Text>
          </View>
        )}

        {selectedFile && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearSelection}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

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
    top: -10,                   // Bring it a little bit up
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 35,              // Increased size
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 35,           // Match fontSize for vertical centering
    includeFontPadding: false, // Remove extra padding
    padding: 0,               // Remove padding
    margin: 0,                // Remove margin
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
  videoPreview: {
    width: 200,
    height: 200,
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
  },
  resultText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#38761D",
    fontFamily: "RobotoCondensed-Bold",
  },
  solutionButton: {
    padding: 10,
    backgroundColor: "#28a745",
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  solutionButtonText: {
    color: "#fff",
    fontFamily: "RobotoCondensed-Bold",
    fontWeight: "600",
    fontSize: 16,
  },
  solutionBox: {
    padding: 10,
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
    borderRadius: 5,
    marginBottom: 16,
    zIndex: 1,
  },
  solutionText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "RobotoCondensed-Regular",
  },
  clearButton: {
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#F8D7DA",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#721C24",
    fontFamily: "RobotoCondensed-Bold",
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    marginLeft: 15,
    fontSize: 16,
    fontFamily: "RobotoCondensed-Regular",
    color: "#000000",
  },
});

export default DetectionScreen;