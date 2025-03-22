import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  CropSelection: undefined;
  Detection: { crop: string };
};

type CropSelectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CropSelection"
>;

const CropSelectionScreen = () => {
  const navigation = useNavigation<CropSelectionScreenNavigationProp>();

  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  const handleCropSelect = (crop: string) => {
    setSelectedCrop(crop);
  };

  const handleSelectButton = () => {
    if (selectedCrop) {
      navigation.navigate("Detection", { crop: selectedCrop });
    }
  };

  return (
    <View style={styles.container}>
      {/* Remove BackgroundPattern component here */}

      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('DetectionPrompt')}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Title under back button */}
      <Text style={styles.title}>Disease Detection</Text>

      {/* Header */}
      <Text style={styles.headerTime}></Text>

      {/* Selection Box */}
      <View style={styles.selectionBox}>
        <Text style={styles.selectionTitle}>Select Your Export Crop</Text>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => handleCropSelect("pepper")}
        >
          <View
            style={
              selectedCrop === "pepper"
                ? styles.radioIndicatorSelected
                : styles.radioIndicatorUnselected
            }
          />
          <Text
            style={
              selectedCrop === "pepper"
                ? styles.radioTextSelected
                : styles.radioText
            }
          >
            Black Pepper
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => handleCropSelect("cinnamon")}
        >
          <View
            style={
              selectedCrop === "cinnamon"
                ? styles.radioIndicatorSelected
                : styles.radioIndicatorUnselected
            }
          />
          <Text
            style={
              selectedCrop === "cinnamon"
                ? styles.radioTextSelected
                : styles.radioText
            }
          >
            Cinnamon
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => handleCropSelect("tea")}
        >
          <View
            style={
              selectedCrop === "tea"
                ? styles.radioIndicatorSelected
                : styles.radioIndicatorUnselected
            }
          />
          <Text
            style={
              selectedCrop === "tea"
                ? styles.radioTextSelected
                : styles.radioText
            }
          >
            Tea
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => handleCropSelect("coconut")}
        >
          <View
            style={
              selectedCrop === "coconut"
                ? styles.radioIndicatorSelected
                : styles.radioIndicatorUnselected
            }
          />
          <Text
            style={
              selectedCrop === "coconut"
                ? styles.radioTextSelected
                : styles.radioText
            }
          >
            Coconut
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => handleCropSelect("rice")}
        >
          <View
            style={
              selectedCrop === "rice"
                ? styles.radioIndicatorSelected
                : styles.radioIndicatorUnselected
            }
          />
          <Text
            style={
              selectedCrop === "rice"
                ? styles.radioTextSelected
                : styles.radioText
            }
          >
            Rice
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => handleCropSelect("rubber")}
        >
          <View
            style={
              selectedCrop === "rubber"
                ? styles.radioIndicatorSelected
                : styles.radioIndicatorUnselected
            }
          />
          <Text
            style={
              selectedCrop === "rubber"
                ? styles.radioTextSelected
                : styles.radioText
            }
          >
            Rubber
          </Text>
        </TouchableOpacity>
      </View>

      {/* Select Button */}
      <TouchableOpacity style={styles.selectButton} onPress={handleSelectButton}>
        <Text style={styles.selectButtonText}>Select</Text>
      </TouchableOpacity>

      {/* Add half circle design */}
      <View style={styles.halfCircle} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  // Remove these background-related styles
backgroundPattern: {},
  treeIcon: {},
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  backButton: {
    marginRight: 15,
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
  headerTime: {
    position: "absolute",
    top: 40,
    right: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "#001A54",
    fontFamily: "RobotoCondensed-Bold",
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#000',
    fontFamily: 'RobotoCondensed-Regular',
    marginTop: 20,
    marginBottom: 10,
  },
  selectionBox: {
    backgroundColor: 'rgba(227, 227, 227, 0.9)',
    width: "90%",
    borderRadius: 10,
    marginTop: 20,
    padding: 20,
    zIndex: 1,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "RobotoCondensed-Bold",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  radioIndicatorSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#000000",
    marginRight: 10,
  },
  radioIndicatorUnselected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#B3B3B3",
    marginRight: 10,
  },
  radioText: {
    fontSize: 16,
    color: "#6A6A6A",
    fontFamily: "RobotoCondensed-Regular",
  },
  radioTextSelected: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "RobotoCondensed-Bold",
  },
  selectButton: {
    marginTop: 30,
    width: "90%",
    backgroundColor: 'rgba(191, 252, 191, 0.9)',
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 10,
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
  selectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "RobotoCondensed-Bold",
  },
  halfCircle: {
    position: 'absolute',
    bottom: -100,
    width: 400,
    height: 200,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    backgroundColor: 'rgba(76, 175, 80, 0.6)', // Darker green with more opacity
    transform: [{ scaleX: 1.5 }],
  },
});

export default CropSelectionScreen;