import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
#hellow
interface Post {
  id: string;
  userId: string;
  user: string;
  content: string;
  likes: number;
  comments: number;
  avatar: string;
}

const CommunityScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (route.params?.newPost) {
      const updatedPosts = [route.params.newPost, ...posts];
      setPosts(updatedPosts);
      savePosts(updatedPosts);
      navigation.setParams({ newPost: null });
    }
  }, [route.params?.newPost]);

  const loadPosts = async () => {
    try {
      const storedPosts = await AsyncStorage.getItem('communityPosts');
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      }
    } catch (error) {
      console.error('Failed to load posts', error);
    }
  };

  const savePosts = async (posts: Post[]) => {
    try {
      await AsyncStorage.setItem('communityPosts', JSON.stringify(posts));
    } catch (error) {
      console.error('Failed to save posts', error);
    }
  };

  const handleViewProfile = (userId: string) => {
    navigation.navigate('Profile', { userId, isEditable: false });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="arrow-left" size={28} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Discussions</Text>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile', {
          viewOnly: true  // Add this flag to indicate view-only mode
        })}>
          <Icon name="account-circle" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <TouchableOpacity
              style={styles.postHeader}
              onPress={() => handleViewProfile(item.userId)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.username}>{item.user}</Text>
                <Text style={styles.userBadge}>Verified Farmer</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.postContent}>{item.content}</Text>
            <View style={styles.postFooter}>
              <TouchableOpacity style={styles.interactionButton}>
                <Icon name="thumb-up-outline" size={20} color="#666" />
                <Text style={styles.interactionText}>{item.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.interactionButton}>
                <Icon name="comment-outline" size={20} color="#666" />
                <Text style={styles.interactionText}>{item.comments}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.newPostButton}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 16,
  },
  postContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flexDirection: 'column',
  },
  username: {
    fontWeight: 'bold',
    color: '#333',
  },
  userBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  postContent: {
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  interactionText: {
    marginLeft: 8,
    color: '#666',
  },
  newPostButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});

export default CommunityScreen;