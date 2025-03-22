import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const CreatePostScreen = () => {
  const navigation = useNavigation();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [userName, setUserName] = useState('');

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
    };

    Alert.alert(
      'Select Photo',
      '',
      [
        {
          text: 'Take Photo',
          onPress: () => launchCamera(options, (response) => {
            if (response.assets?.[0]?.uri) {
              setImage(response.assets[0].uri);
            }
          })
        },
        {
          text: 'Choose from Gallery',
          onPress: () => launchImageLibrary(options, (response) => {
            if (response.assets?.[0]?.uri) {
              setImage(response.assets[0].uri);
            }
          })
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const savePostToStorage = async (newPost: any) => {
    try {
      const existingPosts = await AsyncStorage.getItem('communityPosts');
      const posts = existingPosts ? JSON.parse(existingPosts) : [];
      const updatedPosts = [newPost, ...posts];
      await AsyncStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handlePost = async () => {
    if (!userName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!image) {
      Alert.alert('Error', 'Please select a photo');
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      userId: 'currentUser',
      user: userName,
      content: caption,
      image,
      likes: 0,
      comments: [],
      avatar: 'https://picsum.photos/200',
    };

    await savePostToStorage(newPost);
    navigation.navigate('Community', { newPost });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Create New Post</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePicker}>
        {image ? (
          <Image source={{ uri: image }} style={styles.selectedImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="camera-plus" size={40} color="#666" />
            <Text style={styles.uploadText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Your Name"
        value={userName}
        onChangeText={setUserName}
      />

      <TextInput
        style={[styles.input, styles.captionInput]}
        placeholder="Add a caption..."
        value={caption}
        onChangeText={setCaption}
        multiline
      />

      <TouchableOpacity
        style={styles.postButton}
        onPress={handlePost}
      >
        <Text style={styles.postButtonText}>Post to Community</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  imagePicker: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 20,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  uploadText: {
    marginTop: 10,
    color: '#666',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  captionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreatePostScreen;