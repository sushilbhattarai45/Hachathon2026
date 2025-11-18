import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import * as SecureStorage from "expo-secure-store";
import { router } from "expo-router";
import axios from "axios";



// ---------------------- NEW EVENTS DATA SCHEMA ----------------------
type EventAction = {
  type: string;
  action_payload: Record<string, any>;
  missing_fields: string[];
};

type EventEntity = {
  sender: string;
  emails: string[];
  date: string;
  time: string;
  people: string[];
  links: string[];
  phone_numbers: string[];
  company: string;
};

type EventItem = {
  message_id: string;
  today_date: string;
  title: string;
  email_type: "event" | "task" | "note" | "form";
  description: string;
  show: boolean;
  actions: EventAction[];
  entities: EventEntity;
  icon: string;
};

const eventsData: Record<string, EventItem[]> = {
  "2025-11-16": [
    {
      message_id: "1",
      today_date: "2025-11-16",
      title: "Biology Lecture",
      email_type: "event",
      description: "Chapter 5: Photosynthesis. Bring lab notebook",
      show: true,
      actions: [
        { type: "remind", action_payload: {}, missing_fields: [] },
        { type: "details", action_payload: {}, missing_fields: [] },
      ],
      entities: {
        sender: "Prof. Smith",
        emails: ["prof.smith@uni.edu"],
        date: "2025-11-16",
        time: "09:00 AM",
        people: [],
        links: [],
        phone_numbers: [],
        company: "University",
      },
      icon: "🔬",
    },
    {
      message_id: "2",
      today_date: "2025-11-16",
      title: "Maths Assignment",
      email_type: "task",
      description: "Algebra problems 1-20. Due tomorrow",
      show: true,
      actions: [
        { type: "submit", action_payload: {}, missing_fields: [] },
        { type: "remind", action_payload: {}, missing_fields: [] },
      ],
      entities: { sender: "Prof. Jones", emails: [], date: "2025-11-16", time: "02:30 PM", people: [], links: [], phone_numbers: [], company: "University" },
      icon: "📐",
    },
    {
      message_id: "3",
      today_date: "2025-11-16",
      title: "Email from Prof. Smith",
      email_type: "note",
      description: "Your midterm exam is scheduled for Nov 23. Good luck!",
      show: true,
      actions: [
        { type: "reply", action_payload: {}, missing_fields: [] },
        { type: "archive", action_payload: {}, missing_fields: [] },
      ],
      entities: { sender: "Prof. Smith", emails: ["prof.smith@uni.edu"], date: "2025-11-16", time: "10:45 AM", people: [], links: [], phone_numbers: [], company: "University" },
      icon: "📧",
    },
    {
      message_id: "4",
      today_date: "2025-11-16",
      title: "Attendance Form",
      email_type: "form",
      description: "Mark your attendance for this week's sessions",
      show: true,
      actions: [
        { type: "view", action_payload: {}, missing_fields: [] },
        { type: "submit", action_payload: {}, missing_fields: [] },
      ],
      entities: { sender: "Admin", emails: [], date: "2025-11-16", time: "11:00 AM", people: [], links: [], phone_numbers: [], company: "University" },
      icon: "📋",
    },
  ],
};


export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const scrollViewRef = useRef<ScrollView>(null);
  const [dates, setDates] = useState<Date[]>([]);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const ITEM_WIDTH = 52;
  const SCREEN_WIDTH = Dimensions.get("window").width;

  const [emailActionsData, setEmailActionsData] = useState<Record<string,EventItem[]>>(eventsData);


  let getEmailandConnect = async () => {
    let mail = await SecureStorage.getItemAsync("userEmail");
    let token = await SecureStorage.getItemAsync("accessToken");
    setToken(token);
    setUserEmail(mail);
    console.log("user email", mail);
  };

  let api_url = process.env.EXPO_PUBLIC_API_URL ?? "";
  const ws = new WebSocket(api_url);

  const fetchTasks = async () => {
    let mail = await SecureStorage.getItemAsync("userEmail")
    console.log(mail?.split('@')[0]+'@outlook.com');
    mail = mail?.split('@')[1] == 'gmail.com'? mail?.split('@')[0]+'@outlook.com' : mail

    if(mail == 'lamsalsskr@outlook.com') mail = 'lamsalsanskar@outlook.com'

    let response = await axios.post(process.env.EXPO_PUBLIC_API_URL+"/mail/tasks/getTasksForUser",{
      user_email: mail
    })
    console.log(JSON.stringify(response.data, null, 2));

    for(let i=0;i<response.data.tasks.length;i++)
    {
      let task = response.data.tasks[i]
      addEmailActionsData(task)
    }

  }

const randomEmojis = [
   "✉️", "📨", "📬",
  "📅", "🗓️", "⏰", "📌",
  "⚠️", "❗", "🚨",
 , "📝", "📋", "🔔",
  "🔔", "📣", "📢", 
  
];



  useEffect(() => {
    const today = new Date();
    const newDates = [];
    for (let i = -30; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      newDates.push(d);
    }
    setDates(newDates);
    getEmailandConnect();
    fetchTasks();
  }, []);

  let getTokens = async () => {
    let mail = await SecureStorage.getItemAsync("userEmail");
    let token = await SecureStorage.getItemAsync("accessToken");

    setUserEmail(mail);
    setToken(token);
  };


  const addEmailActionsData = (data:EventItem) => {
    setEmailActionsData((prev)=> {
      let temp = {...prev};
      let date_str = data?.today_date?.split('T')[0];
      temp[date_str] = prev[date_str] || [];
      temp[date_str].push(data);
       temp[date_str] = temp[date_str].reverse();
       return temp;
    })
  }

  useEffect(() => {
    getTokens();
  }, [token, userEmail]);

  useEffect(() => {
    WSConn();
  }, []);

  const WSConn = () => {
    ws.onerror = (error) => console.error(error);

    ws.onopen = async () => {
      let email = await SecureStorage.getItemAsync("userEmail");
      let tok = await SecureStorage.getItemAsync("accessToken");
      console.log("WebSocket connected");
      ws.send(
        JSON.stringify({
          userId: email || userEmail,
          token: tok || token,
        }),
      );
      console.log("WebSocket connection opened");
    };

    ws.onmessage = async (event) => {
      console.log("received: %s", event.data);
      let eventData = JSON.parse(event.data);


      if (eventData.userId) {
        let userId = eventData.userId;
        console.log("stored user id" + userId);

        await SecureStorage.setItemAsync("userId", userId);
      }
      // alert(JSON.stringify(event.data, null, 2));

        let data:EventItem = JSON.parse(event.data);
        if(data?.today_date) {
          addEmailActionsData(data);
        }
    };
  };

  // Separate effect to scroll after dates are set
  useEffect(() => {
    if (dates.length === 0) return;

    const today = new Date();
    const index = dates.findIndex(
      (d) => d.toDateString() === today.toDateString(),
    );

    if (index === -1 || !scrollViewRef.current) return;

    setTimeout(() => {
      // Center today's date in the middle of the screen
      const xOffset = index * ITEM_WIDTH - (SCREEN_WIDTH / 6 - ITEM_WIDTH / 6);
      scrollViewRef.current?.scrollTo({
        x: xOffset,
        animated: true,
      });
    }, 300);
  }, [dates]);

  const scrollToDate = (date: Date) => {
    const index = dates.findIndex(
      (d) => d.toDateString() === date.toDateString(),
    );

    if (index === -1 || !scrollViewRef.current) return;

    // Center the date in the middle of the screen
    const xOffset = index * ITEM_WIDTH - (SCREEN_WIDTH / 6 - ITEM_WIDTH / 6);

    scrollViewRef.current.scrollTo({
      x: xOffset,
      animated: true,
    });
  };


  const isToday = (date: Date) =>
    date.toDateString() === new Date().toDateString();
  const isSelected = (date: Date) =>
    date.toDateString() === selectedDate.toDateString();

  // Events data organized by date

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    const dateKey = date.toISOString().split("T")[0];
    return emailActionsData[dateKey] || [];
  };

  const mockItems = getEventsForDate(selectedDate);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Jotly</Text>
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
            const dayOfWeek = date.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const monthAbbr = date.toLocaleDateString("en-US", {
              month: "short",
            });
            const isCurrentDate = isToday(date);
            const isCurrentSelected = isSelected(date);

            return (
              <TouchableOpacity
                key={idx}
                onPress={async () => {
                  alert("logour");
                  await SecureStorage.deleteItemAsync("accessToken");
                  await SecureStorage.deleteItemAsync("refreshToken");
                  router.push("/");
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
                    isCurrentDate &&
                      !isCurrentSelected &&
                      styles.dayOfWeekTextToday,
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
                    isCurrentDate &&
                      !isCurrentSelected &&
                      styles.monthTextToday,
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
          <Text style={styles.eventsHeaderText}>Tasks for the Day</Text>
        </View>

        {/* Events List or No Events */}
{mockItems.length === 0 ? (
  <View style={styles.noEventsContainer}>
    <Text style={styles.noEventsIcon}>📭</Text>
    <Text style={styles.noEventsText}>No events for today</Text>
    <Text style={styles.noEventsSubtext}>
      Your schedule is clear. Enjoy!
    </Text>
  </View>
) : (
            {

              mockItems.map((item, idx) => (
                <View style={styles.eventItemContainer} key={idx}>
                  <View style={styles.eventIconContainer}>
                    <Text style={styles.eventIcon}>{randomEmojis[Math.floor(Math.random() * randomEmojis.length)]}</Text>
                    <Text style={styles.eventIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.eventContentContainer}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <Text style={styles.eventTime}>{item.entities.time}</Text>
                    <Text style={styles.eventNotes}>{item.description}</Text>
                  </View>
                  <View style={styles.eventActionsRow}>
                    {item.actions.map((action, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.eventActionButtonSmall,
                          styles.eventActionButtonSmallActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.eventActionTextSmall,
                            styles.eventActionTextSmallActive,
                          ]}
                        >
                          {action.type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))
            }


)}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,

    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  navButton: { padding: 8 },
  navText: { fontSize: 18, color: "#0f172a" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#0f172a" },
  calendarScroll: {
    paddingVertical: 6,
  },
  calendarContent: { paddingHorizontal: 8, height: 80 },
  dateItem: {
    width: 52,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    marginBottom: 16,

    justifyContent: "center",
    borderRadius: 8,
    height: 64,
    backgroundColor: "#fafafa",
  },

  dateItemSelected: {
    backgroundColor: "#0078D4",
  },
  dateItemToday: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#0078D4",
  },
  dayOfWeekText: { fontSize: 11, color: "#94a3b8", fontWeight: "500" },
  dayOfWeekTextSelected: { color: "#fff" },
  dayOfWeekTextToday: { color: "#0078D4", fontWeight: "600" },
  dateText: { fontSize: 13, fontWeight: "700", color: "#0f172a", marginTop: 1 },
  dateTextSelected: { color: "#fff" },
  dateTextToday: { color: "#0078D4" },
  monthText: { fontSize: 9, color: "#94a3b8", fontWeight: "500", marginTop: 1 },
  monthTextSelected: { color: "#fff" },
  monthTextToday: { color: "#0078D4", fontWeight: "600" },
  selectedDateSection: { paddingHorizontal: 16, paddingVertical: 8 },
  selectedDateText: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#e0f0ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  taskIcon: { backgroundColor: "#e0f7e0" },
  itemIconText: { fontSize: 16 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  itemTime: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  itemActions: { flexDirection: "row", gap: 8 },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionButtonActive: { backgroundColor: "#0078D4", borderColor: "#0078D4" },
  actionText: { fontSize: 12, fontWeight: "500", color: "#64748b" },
  actionTextActive: { color: "#fff" },
  // Events Section Styles
  eventsHeaderContainer: {
    paddingHorizontal: 16,

    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  eventsHeaderText: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  eventsListContent: { paddingHorizontal: 16, paddingBottom: 20 },
  eventItemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  eventIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#f0f4f8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  eventIcon: { fontSize: 22 },
  eventContentContainer: { flex: 1 },
  eventTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 3,
  },
  eventTime: { fontSize: 12, color: "#94a3b8", marginBottom: 4 },
  eventNotes: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    fontStyle: "italic",
  },
  eventActionsRow: {
    flexDirection: "row",
    gap: 6,
    marginLeft: 8,
    marginTop: 4,
  },
  eventActionButtonSmall: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8f9fa",
  },
  eventActionButtonSmallActive: {
    backgroundColor: "#0078D4",
    borderColor: "#0078D4",
  },
  eventActionTextSmall: { fontSize: 11, fontWeight: "600", color: "#64748b" },
  eventActionTextSmallActive: { color: "#fff" },
  noEventsContainer: {
    paddingVertical: 60,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  noEventsIcon: { fontSize: 56, marginBottom: 12 },
  noEventsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 6,
    textAlign: "center",
  },
  noEventsSubtext: { fontSize: 14, color: "#94a3b8", textAlign: "center" },
});
