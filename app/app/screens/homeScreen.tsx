import React, { useState, useRef, useEffect } from 'react';
import { View, Text,Dimensions, StyleSheet, FlatList, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const scrollViewRef = useRef<ScrollView>(null);
  const [dates, setDates] = useState<Date[]>([]);
const ITEM_WIDTH = 52; 
const SCREEN_WIDTH = Dimensions.get("window").width;

  useEffect(() => {
    // Generate 60 days of dates (30 before, 30 after today)
    const today = new Date();
    const newDates = [];
    for (let i = -30; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      newDates.push(d);
    }
    setDates(newDates);

    // Scroll to today initially
    setTimeout(() => scrollToDate(today), 300);
  }, []);

 const scrollToDate = (date: Date) => {
  const index = dates.findIndex(
    (d) => d.toDateString() === date.toDateString()
  );

  if (index === -1 || !scrollViewRef.current) return;

  const xOffset = index * ITEM_WIDTH - (SCREEN_WIDTH / 6 - ITEM_WIDTH / 6);

  scrollViewRef.current.scrollTo({
    x: xOffset,
    animated: true,
  });
};

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();

  // Mock items for demo - Diverse student content
  const mockItems = [
    { id: '1', type: 'event', title: 'Biology Lecture', time: '9:00 AM', notes: 'Chapter 5: Photosynthesis. Bring lab notebook', icon: '🔬' },
    { id: '2', type: 'task', title: 'Maths Assignment', time: '2:30 PM', notes: 'Algebra problems 1-20. Due tomorrow', icon: '📐' },
    { id: '3', type: 'note', title: 'Email from Prof. Smith', time: '10:45 AM', notes: 'Your midterm exam is scheduled for Nov 23. Good luck!', icon: '📧' },
    { id: '4', type: 'form', title: 'Attendance Form', time: '11:00 AM', notes: 'Mark your attendance for this week\'s sessions', icon: '📋' },
    { id: '5', type: 'task', title: 'English Essay', time: '3:30 PM', notes: '3 pages min. Topic: "Innovation in Technology"', icon: '📝' },
    { id: '6', type: 'event', title: 'Physics Lab', time: '4:00 PM', notes: 'Experiment on momentum. Partner: Alex', icon: '⚛️' },
    { id: '7', type: 'note', title: 'Message from Study Group', time: '5:15 PM', notes: 'Can we meet tomorrow at 2 PM? - Rahul', icon: '💬' },
    { id: '8', type: 'form', title: 'Internship Application', time: '7:00 PM', notes: 'Complete your profile for summer internship opportunity', icon: '🎯' },
    { id: '9', type: 'note', title: 'History Project Deadline', time: '11:59 PM', notes: 'Group presentation on World War II next week', icon: '📚' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hachathon</Text>
          <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navText}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Scroll */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.calendarScroll}
          contentContainerStyle={styles.calendarContent}
        >
          {dates.map((date, idx) => {
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
            const monthAbbr = date.toLocaleDateString('en-US', { month: 'short' });
            const isCurrentDate = isToday(date);
            const isCurrentSelected = isSelected(date);

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  setSelectedDate(date);
                  scrollToDate(date);
                }}
                style={[
                  styles.dateItem,
                  isCurrentSelected && styles.dateItemSelected,
                  isCurrentDate && !isCurrentSelected && styles.dateItemToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayOfWeekText,
                    isCurrentSelected && styles.dayOfWeekTextSelected,
                    isCurrentDate && !isCurrentSelected && styles.dayOfWeekTextToday,
                  ]}
                >
                  {dayOfWeek}
                </Text>
                <Text
                  style={[
                    styles.dateText,
                    isCurrentSelected && styles.dateTextSelected,
                    isCurrentDate && !isCurrentSelected && styles.dateTextToday,
                  ]}
                >
                  {date.getDate()}
                </Text>
                <Text
                  style={[
                    styles.monthText,
                    isCurrentSelected && styles.monthTextSelected,
                    isCurrentDate && !isCurrentSelected && styles.monthTextToday,
                  ]}
                >
                  {monthAbbr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Events Header */}
        <View style={styles.eventsHeaderContainer}>
          <Text style={styles.eventsHeaderText}>Events for the Day</Text>
        </View>

        {/* Events List or No Events */}
        {mockItems.length === 0 ? (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsIcon}>📭</Text>
            <Text style={styles.noEventsText}>No events for today</Text>
            <Text style={styles.noEventsSubtext}>Your schedule is clear. Enjoy!</Text>
          </View>
        ) : (
          <FlatList
            data={mockItems}
            renderItem={({ item }) => (
              <View style={styles.eventItemContainer}>
                <View style={styles.eventIconContainer}>
                  <Text style={styles.eventIcon}>{item.icon}</Text>
                </View>
                <View style={styles.eventContentContainer}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventTime}>{item.time}</Text>
                  <Text style={styles.eventNotes}>{item.notes}</Text>
                </View>
                <View style={styles.eventActionsRow}>
                  {item.type === 'event' ? (
                    <>
                      <TouchableOpacity style={styles.eventActionButtonSmall}>
                        <Text style={styles.eventActionTextSmall}>Remind</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.eventActionButtonSmall}>
                        <Text style={styles.eventActionTextSmall}>Details</Text>
                      </TouchableOpacity>
                    </>
                  ) : item.type === 'form' ? (
                    <>
                      <TouchableOpacity style={styles.eventActionButtonSmall}>
                        <Text style={styles.eventActionTextSmall}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.eventActionButtonSmall, styles.eventActionButtonSmallActive]}>
                        <Text style={[styles.eventActionTextSmall, styles.eventActionTextSmallActive]}>Submit</Text>
                      </TouchableOpacity>
                    </>
                  ) : item.type === 'note' ? (
                    <>
                      <TouchableOpacity style={styles.eventActionButtonSmall}>
                        <Text style={styles.eventActionTextSmall}>Reply</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.eventActionButtonSmall}>
                        <Text style={styles.eventActionTextSmall}>Archive</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity style={styles.eventActionButtonSmall}>
                        <Text style={styles.eventActionTextSmall}>Later</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.eventActionButtonSmall, styles.eventActionButtonSmallActive]}>
                        <Text style={[styles.eventActionTextSmall, styles.eventActionTextSmallActive]}>Done</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.eventsListContent}
            scrollEnabled={true}
            nestedScrollEnabled={true}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  navButton: { padding: 8 },
  navText: { fontSize: 18, color: '#0f172a' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#0f172a' },
  calendarScroll: { backgroundColor: 'white', paddingVertical: 6 },
  calendarContent: { paddingHorizontal: 8 },
 dateItem: {
  width: 52,
  alignItems: 'center',
  paddingVertical: 6,
  paddingHorizontal: 6,
  marginHorizontal: 2,
  marginBottom: 16,
  justifyContent: 'center',
  borderRadius: 8,
  height: 64,
  backgroundColor: '#fafafa',
},

  dateItemSelected: {
    backgroundColor: '#0078D4',
  },
  dateItemToday: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0078D4',
  },
  dayOfWeekText: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  dayOfWeekTextSelected: { color: '#fff' },
  dayOfWeekTextToday: { color: '#0078D4', fontWeight: '600' },
  dateText: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginTop: 1 },
  dateTextSelected: { color: '#fff' },
  dateTextToday: { color: '#0078D4' },
  monthText: { fontSize: 9, color: '#94a3b8', fontWeight: '500', marginTop: 1 },
  monthTextSelected: { color: '#fff' },
  monthTextToday: { color: '#0078D4', fontWeight: '600' },
  selectedDateSection: { paddingHorizontal: 16, paddingVertical: 8 },
  selectedDateText: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#e0f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskIcon: { backgroundColor: '#e0f7e0' },
  itemIconText: { fontSize: 16 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  itemTime: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  itemActions: { flexDirection: 'row', gap: 8 },
  actionButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  actionButtonActive: { backgroundColor: '#0078D4', borderColor: '#0078D4' },
  actionText: { fontSize: 12, fontWeight: '500', color: '#64748b' },
  actionTextActive: { color: '#fff' },
  // Events Section Styles
  eventsHeaderContainer: { paddingHorizontal: 16,

    
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  eventsHeaderText: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  eventsListContent: { paddingHorizontal: 16, paddingBottom: 20 },
  eventItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f0f4f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  eventIcon: { fontSize: 22 },
  eventContentContainer: { flex: 1 },
  eventTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 3 },
  eventTime: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  eventNotes: { fontSize: 13, color: '#64748b', lineHeight: 18, fontStyle: 'italic' },
  eventActionsRow: { flexDirection: 'row', gap: 6, marginLeft: 8, marginTop: 4 },
  eventActionButtonSmall: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 5, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8f9fa' },
  eventActionButtonSmallActive: { backgroundColor: '#0078D4', borderColor: '#0078D4' },
  eventActionTextSmall: { fontSize: 11, fontWeight: '600', color: '#64748b' },
  eventActionTextSmallActive: { color: '#fff' },
  noEventsContainer: {
    paddingVertical: 60,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noEventsIcon: { fontSize: 56, marginBottom: 12 },
  noEventsText: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 6, textAlign: 'center' },
  noEventsSubtext: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
});
