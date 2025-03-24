import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CustomCalendar = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [eventText, setEventText] = useState('');
  const [events, setEvents] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Load events from AsyncStorage on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const savedEvents = await AsyncStorage.getItem('calendarEvents');
        if (savedEvents) {
          setEvents(JSON.parse(savedEvents));
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    };
    loadEvents();
  }, []);

  // Save events to AsyncStorage whenever events change
  useEffect(() => {
    const saveEvents = async () => {
      try {
        await AsyncStorage.setItem('calendarEvents', JSON.stringify(events));
      } catch (error) {
        console.error('Failed to save events:', error);
      }
    };
    saveEvents();
  }, [events]);

  // Add or update an event
  const addEvent = () => {
    if (selectedDate && eventText) {
      const newEvents = { ...events, [selectedDate]: eventText };
      setEvents(newEvents);
      setEventText('');
      setSelectedDate('');
    }
  };

  // Delete an event
  const deleteEvent = () => {
    if (selectedDate) {
      const newEvents = { ...events };
      delete newEvents[selectedDate];
      setEvents(newEvents);
      setEventText('');
      setSelectedDate('');
    }
  };

  // Get the number of days in a month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Handle month navigation
  const changeMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // Render the calendar grid
  const renderCalendar = () => {
    const days = [];
    const totalDays = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // Add empty placeholders for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.day} />);
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = `${currentYear}-${currentMonth + 1}-${day}`;
      const hasEvent = events[date];
      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.day, hasEvent && styles.dayWithEvent]}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={styles.dayText}>{day}</Text>
          {hasEvent && <Text style={styles.eventIndicator}>•</Text>}
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Farming Calendar</Text>

      {/* Month and Year Navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={() => changeMonth('prev')}>
          <Text style={styles.navigationText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthYearText}>
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
        </Text>
        <TouchableOpacity onPress={() => changeMonth('next')}>
          <Text style={styles.navigationText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendar}>
        <View style={styles.weekDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.daysContainer}>{renderCalendar()}</View>
      </View>

      {/* Event Input */}
      {selectedDate && (
        <View style={styles.eventInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add an event (e.g., Harvesting)"
            value={eventText}
            onChangeText={setEventText}
          />
          <View style={styles.buttonContainer}>
            <Button title="Add Event" onPress={addEvent} />
            {events[selectedDate] && (
              <Button title="Delete Event" onPress={deleteEvent} color="red" />
            )}
          </View>
        </View>
      )}

      {/* Display Event */}
      {selectedDate && events[selectedDate] && (
        <Text style={styles.eventText}>
          Event on {selectedDate}: {events[selectedDate]}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    margin: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navigationText: {
    fontSize: 24,
    color: '#4CAF50',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  calendar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDayText: {
    width: '14%',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#666',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    margin: 2,
  },
  dayWithEvent: {
    backgroundColor: '#e3f2fd',
  },
  dayText: {
    fontSize: 16,
  },
  eventIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    color: '#4CAF50',
  },
  eventInputContainer: {
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default CustomCalendar;