import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as authService from '../services/authService';
import BackgroundPattern from '../components/BackgroundPattern';

const UserProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get profile data from API
      const profileResult = await authService.getUserProfile();
      
      if (profileResult.success) {
        console.log("Profile data from API:", profileResult.user);
        setUserData(profileResult.user);
      } else {
        console.log("Failed to get profile from API:", profileResult.message);
        
        // Fallback to local storage if API fails
        const storedUserData = await authService.getStoredUserData();
        if (storedUserData) {
          console.log("Falling back to stored user data:", storedUserData);
          setUserData(storedUserData);
        } else {
          setError("Couldn't load profile. Please login again.");
        }
      }
    } catch (err) {
      console.error("Profile loading error:", err);
      
      // Try local storage as a last resort
      try {
        const storedUserData = await authService.getStoredUserData();
        if (storedUserData) {
          console.log("Error recovery: using stored user data");
          setUserData(storedUserData);
        } else {
          setError("An error occurred while loading profile");
        }
      } catch (storageErr) {
        setError("An error occurred while loading profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused]);

  // Refresh data when returning from EditProfile screen
  useEffect(() => {
    if (route.params?.refresh) {
      console.log("Refreshing profile data after edit");
      fetchUserData();
    }
  }, [route.params?.refresh]);

  const goBack = () => {
    navigation.goBack();
  };

  // Navigate to Edit Profile screen
  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userData });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={60} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.returnButton} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.returnButtonText}>Return to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Default data if some fields are missing
  const userDisplayData = {
    fullName: userData?.fullName || "User",
    phoneNumber: userData?.phoneNumber || "Not provided",
    age: userData?.age?.toString() || "Not provided",
    address: userData?.address || "Not provided",
    selectedCrops: userData?.selectedCrops || ["No crops selected"]
  };

  console.log("Display data for profile:", userDisplayData);

  return (
    <LinearGradient
      colors={['#22c55e', '#16a34a']}
      style={styles.gradient}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.profileContainer}>
          <View style={styles.userInfoContainer}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userDisplayData.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.userName}>{userDisplayData.fullName}</Text>
              <Text style={styles.userPhone}>{userDisplayData.phoneNumber}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Age:</Text>
                <Text style={styles.infoValue}>{userDisplayData.age}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{userDisplayData.address}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Selected Crops</Text>
              {userDisplayData.selectedCrops.map((crop, index) => (
                <View key={index} style={styles.cropItem}>
                  <MaterialCommunityIcons
                    name="leaf"
                    size={16}
                    color="#22c55e"
                    style={styles.cropIcon}
                  />
                  <Text style={styles.cropText}>{crop}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  returnButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  returnButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileContainer: {
    padding: 20,
  },
  userInfoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 16,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  cropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  cropIcon: {
    marginRight: 10,
  },
  cropText: {
    fontSize: 16,
    color: '#166534',
  },
  editButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserProfileScreen;
