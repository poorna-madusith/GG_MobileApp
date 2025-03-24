import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Linking, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Calendar from '../components/Calendar';
import LinearGradient from 'react-native-linear-gradient';
import articles from '../articles';

const DashboardScreen = () => {
  const [showVideos, setShowVideos] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showModernTech, setShowModernTech] = useState(false);
  const [showArticles, setShowArticles] = useState(false); 

  //Data for tutorial videos
  const tutorialVideos = [
    { id: 'G9kpiZa72WI', title: 'Pest Control Techniques' },
    { id: '7HnLVYhvars', title: 'Identifying Crop Diseases' },
    { id: 'l36uoyUke-s', title: 'Modern Farming Technologies' }, 
  ];

  // Data for modern technology videos
  const modernTechVideos = [
    { id: 'l36uoyUke-s', title: 'Advanced Farming Techniques' },
  ];

  // Data for news
  const newsItems = [
    {
      id: 1,
      title: 'New Pest Outbreak in Midwest',
      description: 'Farmers report a new pest affecting corn crops. Experts recommend immediate action.',
    },
    {
      id: 2,
      title: 'Tomato Blight Spreading Rapidly',
      description: 'Tomato crops in the region are under threat from a fast-spreading blight.',
    },
    {
      id: 3,
      title: 'Government Issues Advisory for Wheat Farmers',
      description: 'A new advisory has been issued to combat rust disease in wheat crops.',
    },
  ];

  // To open YouTube video
  const openYouTubeVideo = (videoId) => {
    const url = 'https://www.youtube.com/watch?v=${videoId}';
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };


  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFFFFF']} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <LinearGradient
          colors={['#4CAF50', '#81C784']}
          style={styles.header}
        >
          <Text style={styles.headerText}>Dashboard</Text>
        </LinearGradient>

        {/*Farming Calendar Button*/}
        <TouchableOpacity
          style={styles.modernButton}
          onPress={() => setShowCalendar(!showCalendar)}
        >
          <LinearGradient
            colors={['#4CAF50', '#81C784']}
            style={styles.gradientButton}
          >
            <Icon name="event" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.modernButtonText}>
              {showCalendar ? 'Hide Farming Calendar' : 'Show Farming Calendar'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Custom Calendar */}
        {showCalendar && (
          <View style={styles.calendarContainer}>
            <Calendar />
          </View>
        )}

        {/* Tutorial Videos */}
        <TouchableOpacity
          style={styles.modernButton}
          onPress={() => setShowVideos(!showVideos)}
        >
          <LinearGradient
            colors={['#4CAF50', '#81C784']}
            style={styles.gradientButton}
          >
            <Icon name="ondemand-video" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.modernButtonText}>
              {showVideos ? 'Hide Tutorial Videos' : 'Show Tutorial Videos'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Tutorial Videos Section */}
        {showVideos && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tutorial Videos</Text>
            {tutorialVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={styles.videoItem}
                onPress={() => openYouTubeVideo(video.id)}
              >
                <Text style={styles.videoTitle}>{video.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Modern Technologies*/}
        <TouchableOpacity
          style={styles.modernButton}
          onPress={() => setShowModernTech(!showModernTech)}
        >
          <LinearGradient
            colors={['#4CAF50', '#81C784']}
            style={styles.gradientButton}
          >
            <Icon name="precision-manufacturing" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.modernButtonText}>
              {showModernTech ? 'Hide Modern Technologies' : 'Show Modern Technologies'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Modern Technologies Section */}
        {showModernTech && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Modern Technologies</Text>
            {modernTechVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={styles.videoItem}
                onPress={() => openYouTubeVideo(video.id)}
              >
                <Text style={styles.videoTitle}>{video.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Latest News*/}
        <TouchableOpacity
          style={styles.modernButton}
          onPress={() => setShowNews(!showNews)}
        >
          <LinearGradient
            colors={['#4CAF50', '#81C784']}
            style={styles.gradientButton}
          >
            <Icon name="article" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.modernButtonText}>
              {showNews ? 'Hide Latest News' : 'Show Latest News'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* News Section */}
        {showNews && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latest News</Text>
            {newsItems.map((news) => (
              <View key={news.id} style={styles.newsItem}>
                <Text style={styles.newsTitle}>{news.title}</Text>
                <Text style={styles.newsDescription}>{news.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Articles */}
        <TouchableOpacity
          style={styles.modernButton}
          onPress={() => setShowArticles(!showArticles)}
        >
          <LinearGradient
            colors={['#4CAF50', '#81C784']}
            style={styles.gradientButton}
          >
            <Icon name="library-books" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.modernButtonText}>
              {showArticles ? 'Hide Articles' : 'Show Articles'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Articles Section */}
        {showArticles && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Articles</Text>
            {articles.map((article) => (
              <View key={article.id} style={styles.article}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleText}>{article.content}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  modernButton: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  gradientButton: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  calendarContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    padding: 15,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  videoItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  videoTitle: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Roboto',
  },
  newsItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Roboto', 
  },
  newsDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  article: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  articleText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default DashboardScreen;