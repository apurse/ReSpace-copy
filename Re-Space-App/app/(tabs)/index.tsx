import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';

// Icons
const StatusIcon = () => <Text>🔋</Text>;
const ThumbsUpIcon = () => <Text>👍</Text>;
const StarIcon = () => <Text>⭐</Text>;

// Battery level
const currentBatteryPerc = 96;

// Greeting based on time
const getGreeting = () => {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return "Good morning!";
  } else if (currentHour < 17) {
    return "Good afternoon!";
  } else {
    return "Good evening!";
  }
};

// Monitoring status card based on percentage/battery level
const batteryLevel = () => {

  const issuesFound = false;

  if (issuesFound) {
    return "Issues found!";
  }

  if (currentBatteryPerc > 74) {
    return "Ready to go!";
  } else if (currentBatteryPerc < 75 && currentBatteryPerc > 35) {
    return "Good to go";
  } else if (currentBatteryPerc < 35 && currentBatteryPerc > 15) {
    return "Battery low";
  } else {
    return "Needs charging!";
  }
};

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Greeting */}
      <Text style={styles.greeting}>{getGreeting()}</Text>

      {/* ReSpace Monitoring Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>ReSpace Monitoring</Text>
        <View style={styles.statusIcons}>
          <StatusIcon />
          <ThumbsUpIcon />
        </View>
        <Text style={styles.statusText}>{batteryLevel()}</Text>
        <Text style={styles.statusText}>{currentBatteryPerc}%</Text>
      </View>

      {/* Recent Layouts Section */}
      <Text style={styles.sectionTitle}>Recent Layouts</Text>
      <View style={styles.layoutContainer}>
        {/* Layout Card 1 */}
        <View style={styles.layoutCard}>
          <View style={styles.layoutHeader}>
            <StarIcon />
            <Text style={styles.layoutTitle}>Open space</Text>
          </View>
          <Image source={{uri: 'https://via.placeholder.com/100'}} style={styles.layoutImage} />
        </View>

        {/* Layout Card 2 */}
        <View style={styles.layoutCard}>
          <View style={styles.layoutHeader}>
            <StarIcon />
            <Text style={styles.layoutTitle}>Rows of 8</Text>
          </View>
          <Image source={{uri: 'https://via.placeholder.com/100'}} style={styles.layoutImage} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    paddingTop: 40, 
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#28d000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  layoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  layoutCard: {
    width: '45%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  layoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  layoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  layoutImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
});
