import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, TextInput
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import DhalImage from '../assets/images/dhall.jpg';
import MeatImage from '../assets/images/meat.jpg';
import { useRouter } from 'expo-router';


export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [markedDates, setMarkedDates] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchText, setSearchText] = useState('');
  const router = useRouter(); // Initialize router

  useEffect(() => {
    loadHistory();
    // Refresh every minute for live updates
    const interval = setInterval(loadHistory, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { applyFilter(); }, [history, selectedFilter, searchText]);

  const loadHistory = async () => {
    try {
      const response = await fetch('http://98.88.90.67:5000/history');
      if (!response.ok) throw new Error('Failed to fetch history');
      const all = await response.json();

      const processed = all.map(item => {
        console.log(`Item: ${item.fruit}, imageUri: ${item.imageUri}`); // Debug imageUri
        const now = new Date();
        const expires = item.expiresOn ? new Date(item.expiresOn) : null;
        const msLeft = expires ? expires - now : 0;
        const daysLeft = item.daysLeft !== undefined ? item.daysLeft : Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
        const hoursLeft = item.hoursRemaining !== undefined ? item.hoursRemaining : 0;
        const normalizedDaysLeft = hoursLeft > 0 ? hoursLeft / 24 : daysLeft;
        return { ...item, daysLeft, hoursLeft, normalizedDaysLeft };
      });

      processed.sort((a, b) => a.normalizedDaysLeft - b.normalizedDaysLeft);
      const current = processed.filter(item => item.daysLeft > 0 || item.hoursLeft > 0);
      const expired = processed.filter(item => item.daysLeft <= 0 && (!item.hoursLeft || item.hoursLeft <= 0));

      setHistory(current);
      setExpiredItems(expired);
      markCalendar(current);
    } catch (e) {
      console.error('Error loading history:', e);
      Alert.alert('Error', 'Failed to load history from server.');
    }
  };

  const markCalendar = (items) => {
    const marks = {};
    items.forEach(item => {
      if (item.expiresOn) {
        const date = item.expiresOn.split(' ')[0]; // Use date part for calendar
        console.log(`Marking ${item.fruit} on ${date} with emoji ${getEmoji(item.fruit)}`); // Debug calendar
        marks[date] = {
          backgroundColor: getColor(item.fruit),
          emoji: getEmoji(item.fruit),
          isExpired: false,
        };
      }
    });
    const today = new Date().toISOString().split('T')[0];
    marks[today] = {
      backgroundColor: '#eef5f1ff',
      emoji: null,
      isExpired: false,
    };
    setMarkedDates(marks);
  };

  const getColor = (fruit) => {
    switch (fruit) {
      case 'Apple': return '#df5c5cff';
      case 'Banana': return '#FFD93D';
      case 'Carrots': return '#FF9F1C';
      case 'Tomatoes': return '#FF6347';
      case 'Bitter': return '#6B7280';
      case 'Bell': return '#32CD32';
      case 'Dhal Curry': return '#A0522D';
      case 'Meat Curry': return '#54bd8cff';
      default: return '#999'; // For user-defined label scan names
    }
  };

  const getEmoji = (fruit) => {
    switch (fruit) {
      case 'Apple': return '🍎';
      case 'Banana': return '🍌';
      case 'Carrots': return '🥕';
      case 'Tomatoes': return '🍅';
      case 'Bitter': return '🥒';
      case 'Bell': return '🫑';
      case 'Dhal Curry': return '🍛';
      case 'Meat Curry': return '🍖';
      default: return '📦'; // Custom emoji for user-defined label scan names
    }
  };

  const applyFilter = () => {
    let result = history;
    
    if (selectedFilter !== 'All') {
      result = result.filter(item => item.fruit === selectedFilter);
    }
    
    if (searchText) {
      result = result.filter(item => 
        item.fruit.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.stage && item.stage.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    setFiltered(result);
  };

  const confirmDelete = (id) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) },
    ]);
  };

  const deleteItem = async (id) => {
    try {
      const response = await fetch(`http://172.20.10.2:5000/history/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      loadHistory();
    } catch (e) {
      console.error('Error deleting item:', e);
      Alert.alert('Error', 'Failed to delete item.');
    }
  };

  const clearAll = async () => {
    Alert.alert('Clear All', 'Delete all history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes', style: 'destructive', onPress: async () => {
          try {
            const response = await fetch('http://172.20.10.2:5000/history', { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to clear history');
            loadHistory();
          } catch (e) {
            console.error('Error clearing history:', e);
            Alert.alert('Error', 'Failed to clear history.');
          }
        }
      }
    ]);
  };

  const renderItem = (item) => {
    const isCurry = item.fruit === 'Dhal Curry' || item.fruit === 'Meat Curry';
    const isLabelScan = item.stage === 'Label Scan';
    
    let stageOrStatus = '';
    if (isCurry) {
      stageOrStatus = item.status === 'Safe' ? 'Safe to eat' : 'Not safe to eat';
    } else if (!isLabelScan) {
      stageOrStatus = `${item.stage || item.status}`;
    }
    
    const durationLabel = isCurry
      ? `${item.hoursLeft.toFixed(1)}h`
      : `${item.daysLeft}d`;
      
    const fixedImage = item.fruit === 'Dhal Curry'
      ? DhalImage : item.fruit === 'Meat Curry' ? MeatImage : null;

    const getStatusColor = () => {
      if (isCurry) {
        return item.status === 'Safe' ? '#4CAF50' : '#F44336';
      }
      if (item.daysLeft <= 1) return '#F44336';
      if (item.daysLeft <= 3) return '#FF9800';
      return '#4CAF50';
    };

    return (
      <View key={item.id} style={styles.foodCard}>
       {/*} <TouchableOpacity style={styles.favoriteButton}>
          <MaterialIcons name="favorite-border" size={20} color="#ccc" />
        </TouchableOpacity>*/}
        
        <View style={styles.imageContainer}>
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.foodImage} />
          ) : (
            fixedImage ? (
              <Image source={fixedImage} style={styles.foodImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.emojiPlaceholder}>{getEmoji(item.fruit)}</Text>
              </View>
            )
          )}
        </View>
        
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.fruit}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.timeText}>{durationLabel} left</Text>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {stageOrStatus || 'Fresh'}
            </Text>
          </View>
          <Text style={styles.expiryText}>Expires: {item.expiresOn}</Text>
          {item.cookedAt && <Text style={styles.cookedText}>Cooked: {item.cookedAt}</Text>}
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => confirmDelete(item.id)}
        >
          <MaterialIcons name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    );
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
     <View style={styles.header}>
  <View style={styles.locationRow}>
    <TouchableOpacity onPress={() => router.push('/Main')}>
      <MaterialIcons name="location-on" size={16} color="#666" />
    </TouchableOpacity>
    <Text style={styles.locationText}>Inventory</Text>
  </View>
  <TouchableOpacity>
    <MaterialIcons name="menu" size={24} color="#333" />
  </TouchableOpacity>
</View>


<ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
  {/* Title with Blurred Image Background */}
  <View style={styles.titleContainer}>
    <Image
      source={require('../assets/images/back.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    />
     
        <Text style={styles.mainTitle}>
          <Text style={styles.boldTitle}>Freshness</Text>
          {'\n'}is the heartbeat of
          {'\n'}
          <Text style={styles.boldTitle}>every meal</Text>
        </Text>
      
   
  </View>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your stored food"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="tune" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categorySection}>
         {/* <Text style={styles.categoryTitle}>Manage your INVENTORY</Text>*/}
          <View style={styles.categoryRow}>
            <TouchableOpacity 
              style={[
                styles.categoryButton, 
                selectedFilter === 'All' && styles.activeCategoryButton
              ]}
              onPress={() => setSelectedFilter('All')}
            >
              <Text style={[
                styles.categoryText,
                selectedFilter === 'All' && styles.activeCategoryText
              ]}>All Items</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                showCalendar && styles.activeCategoryButton
              ]}
              onPress={() => setShowCalendar(!showCalendar)}
            >
              <Text style={[
                styles.categoryText,
                showCalendar && styles.activeCategoryText
              ]}>Calendar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text style={styles.categoryText}>Filter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dropdown Menu */}
        {showDropdown && (
          <View style={styles.dropdownMenu}>
            {['All', ...new Set(history.map(item => item.fruit))].map(item => (
              <TouchableOpacity
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedFilter(item);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Calendar */}
        {showCalendar && (
          <BlurView intensity={50} tint="light" style={styles.calendarContainer}>
            <Calendar
              dayComponent={({ date }) => {
                const isToday = date.dateString === today;
                const mark = markedDates[date.dateString];
                return (
                  <View
                    style={[
                      styles.calendarDay,
                      {
                        backgroundColor: isToday
                          ? '#7CB342'
                          : mark?.backgroundColor || 'transparent',
                        borderWidth: isToday ? 2 : 0,
                        borderColor: isToday ? '#fff' : 'transparent',
                      }
                    ]}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      { 
                        fontWeight: isToday ? 'bold' : 'normal',
                        color: isToday ? '#fff' : '#333'
                      }
                    ]}>
                      {isToday ? date.day : (mark?.emoji || date.day)}
                    </Text>
                  </View>
                );
              }}
            />
          </BlurView>
        )}

        {/* Clear All Button */}
        {history.length > 0 && (
          <View style={styles.clearAllContainer}>
            <TouchableOpacity onPress={clearAll} style={styles.clearAllButton}>
              <MaterialIcons name="clear-all" size={16} color="#F44336" />
              <Text style={styles.clearAllText}>Clear All History</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Food Items */}
        <View style={styles.foodGrid}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No items found</Text>
              <Text style={styles.emptySubText}>Try adjusting your search or filter</Text>
            </View>
          ) : (
            filtered.map(renderItem)
          )}
        </View>

        {/* Expired Items */}
        {expiredItems.length > 0 && (
          <>
            <Text style={styles.expiredTitle}>🗑️ Spoiled Items</Text>
            <View style={styles.foodGrid}>
              {expiredItems.map(renderItem)}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7CB342',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  titleContainer: {
    position: 'relative',
    width: '100%',
    height: 200, // Reduced height to 120 for a more compact look
    marginBottom: 20,
    overflow: 'hidden', // Ensures the blur stays within bounds
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  blurView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10, // Reduced padding for better fit
  },
  mainTitle: {
    fontSize: 24,
    textAlign: 'center',
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background for visibility
    padding: 10,
    borderRadius: 8,
  },
  boldTitle: {
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categorySection: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  distanceText: {
    color: '#7CB342',
    fontSize: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  activeCategoryButton: {
    backgroundColor: '#117827ff',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#fff',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  calendarContainer: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  calendarDay: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  calendarDayText: {
    fontSize: 14,
  },
  clearAllContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  clearAllText: {
    marginLeft: 8,
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  foodGrid: {
    marginBottom: 20,
  },
  foodCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiPlaceholder: {
    fontSize: 32,
  },
  foodInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  expiryText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  cookedText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  expiredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 15,
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});