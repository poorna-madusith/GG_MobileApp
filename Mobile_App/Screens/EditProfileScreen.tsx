import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import BackgroundPattern from '../components/BackgroundPattern';
import * as authService from '../services/authService';

const AVAILABLE_CROPS = [
  'Tea',
  'Rubber',
  'Coconut',
  'Cinnamon',
  'Rice',
  'Black Pepper'
];

const EditProfileScreen = ({ route, navigation }) => {
  const { userData } = route.params;
  const [formData, setFormData] = useState({
    fullName: userData.fullName || '',
    age: userData.age ? String(userData.age) : '',
    address: userData.address || '',
  });
  const [selectedCrops, setSelectedCrops] = useState(userData.selectedCrops || []);
  const [loading, setLoading] = useState(false);

  const toggleCropSelection = (crop) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter(item => item !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const handleUpdate = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        selectedCrops
      };

      const result = await authService.updateUserProfile(updateData);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Profile updated successfully',
          [{ 
            text: 'OK', 
            onPress: () => navigation.goBack()
          }]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackgroundPattern />
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Edit Profile</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) => setFormData({...formData, fullName: text})}
              placeholder="Enter your full name"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={formData.age}
              onChangeText={(text) => setFormData({...formData, age: text})}
              placeholder="Enter your age"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={formData.address}
              onChangeText={(text) => setFormData({...formData, address: text})}
              placeholder="Enter your address"
              placeholderTextColor="#666"
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Selected Crops</Text>
            <View style={styles.cropsContainer}>
              {AVAILABLE_CROPS.map((crop) => (
                <TouchableOpacity
                  key={crop}
                  style={[
                    styles.cropButton,
                    selectedCrops.includes(crop) && styles.cropButtonSelected
                  ]}
                  onPress={() => toggleCropSelection(crop)}
                >
                  <Text style={[
                    styles.cropButtonText,
                    selectedCrops.includes(crop) && styles.cropButtonTextSelected
                  ]}>
                    {crop}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#333',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cropButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#28a745',
    backgroundColor: 'transparent',
  },
  cropButtonSelected: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  cropButtonText: {
    color: '#28a745',
    fontSize: 14,
    fontWeight: '500',
  },
  cropButtonTextSelected: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen; 