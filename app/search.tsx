import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  Dimensions,
  Vibration,
  StatusBar,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore'
import { db, auth } from './firebaseConfig'
import { useTheme } from './ThemeContext' 
import * as Location from 'expo-location'
import { Picker } from '@react-native-picker/picker'
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigation } from '@react-navigation/native'
import Ably from 'ably'

// Made by the Students of Delhi Public School Newtown: Aharshi Somadder and Samaroha Bhattacharyya
const { width, height } = Dimensions.get('window')

const PROFESSIONS = [
  'Cook', 'Chef', 'Baker', 'Catering Service', 'Food Delivery',
  'Driver', 'Taxi Driver', 'Uber Driver', 'Delivery Driver', 'Truck Driver',
  'Cleaner', 'House Cleaner', 'Office Cleaner', 'Deep Cleaning', 'Carpet Cleaner',
  'Painter', 'House Painter', 'Wall Painter', 'Interior Painter', 'Exterior Painter',
  'Plumber', 'Pipe Fitter', 'Drain Cleaner', 'Water Heater Repair', 'Bathroom Fitter',
  'Electrician', 'Electrical Technician', 'Wiring Specialist', 'Appliance Repair',
  'Carpenter', 'Furniture Maker', 'Cabinet Maker', 'Wood Worker', 'Joiner',
  'Mason', 'Bricklayer', 'Stone Mason', 'Tile Installer', 'Flooring Specialist',
  'Roofer', 'Roofing Contractor', 'Gutter Cleaner', 'Waterproofing Specialist',
  'HVAC Technician', 'Air Conditioner Repair', 'Heating Specialist', 'Ventilation Expert',
  'Hairdresser', 'Barber', 'Hair Stylist', 'Hair Colorist', 'Salon Owner',
  'Beautician', 'Makeup Artist', 'Nail Technician', 'Spa Therapist', 'Esthetician',
  'Massage Therapist', 'Physiotherapist', 'Yoga Instructor', 'Fitness Trainer', 'Gym Trainer',
  'Nutritionist', 'Dietitian', 'Health Coach', 'Personal Trainer', 'Pilates Instructor',
  'Nurse', 'Home Nurse', 'Elderly Care', 'Baby Sitter', 'Nanny',
  'Caregiver', 'Home Health Aide', 'Medical Assistant', 'Pharmacy Assistant',
  'Dental Assistant', 'Optician', 'Physical Therapist', 'Occupational Therapist',
  'Computer Repair', 'IT Support', 'Software Developer', 'Web Developer', 'App Developer',
  'Graphic Designer', 'UI/UX Designer', 'Digital Marketer', 'SEO Specialist', 'Content Writer',
  'Social Media Manager', 'Video Editor', 'Photographer', 'Videographer', 'Audio Engineer',
  'Data Entry Clerk', 'Virtual Assistant', 'Online Tutor', 'E-commerce Specialist',
  'Tutor', 'Private Teacher', 'Math Tutor', 'English Tutor', 'Science Tutor',
  'Music Teacher', 'Dance Instructor', 'Art Teacher', 'Language Instructor', 'Driving Instructor',
  'Skill Trainer', 'Corporate Trainer', 'Life Coach', 'Career Counselor', 'Academic Counselor',
  'Artist', 'Sculptor', 'Illustrator', 'Animator',
  'Musician', 'Singer', 'Instrumentalist', 'Music Producer', 'Sound Engineer',
  'Actor', 'Voice Artist', 'Comedian', 'Entertainer', 'Event Performer',
  'Writer', 'Copywriter', 'Journalist', 'Blogger', 'Content Creator',
  'Accountant', 'Bookkeeper', 'Tax Consultant', 'Financial Advisor', 'Insurance Agent',
  'Real Estate Agent', 'Property Manager', 'Business Consultant', 'Marketing Consultant',
  'HR Consultant', 'Legal Assistant', 'Paralegal', 'Notary Public', 'Translation Services',
  'Courier', 'Package Delivery', 'Moving Service', 'Packing Service', 'Storage Service',
  'Logistics Coordinator', 'Warehouse Worker', 'Forklift Operator', 'Shipping Clerk',
  'Gardener', 'Landscaper', 'Tree Trimmer', 'Pest Control', 'Lawn Care',
  'Plant Care', 'Nursery Worker', 'Agricultural Worker', 'Organic Farmer', 'Greenhouse Manager',
  'Sales Representative', 'Retail Assistant', 'Cashier', 'Store Manager', 'Inventory Manager',
  'Product Demonstrator', 'Market Research', 'Customer Service', 'Call Center Agent',
  'Hotel Staff', 'Receptionist', 'Concierge', 'Housekeeper', 'Room Service',
  'Tour Guide', 'Travel Agent', 'Event Planner', 'Wedding Planner', 'Party Organizer',
  'Restaurant Server', 'Bartender', 'Waitress', 'Kitchen Staff', 'Food Runner',
  'Security Guard', 'Night Watchman', 'CCTV Operator', 'Fire Safety Expert', 'Safety Inspector',
  'Bouncer', 'Event Security', 'Personal Bodyguard', 'Alarm Technician',
  'Mechanic', 'Auto Repair', 'Car Wash', 'Auto Detailing', 'Tire Technician',
  'Oil Change', 'Car Inspector', 'Automotive Electrician', 'Body Shop Worker',
  'Pet Groomer', 'Dog Walker', 'Pet Sitter', 'Veterinary Assistant', 'Animal Trainer',
  'Pet Boarding', 'Animal Behaviorist', 'Aquarium Maintenance', 'Horse Trainer', 'Stable Hand',
  'Tailor', 'Seamstress', 'Fashion Designer', 'Costume Designer', 'Alterations Specialist',
  'Dry Cleaner', 'Laundry Service', 'Fabric Consultant', 'Embroidery Artist', 'Textile Designer',
  'Factory Worker', 'Assembly Line Worker', 'Quality Control Inspector', 'Machine Operator',
  'Production Supervisor', 'Packaging Specialist', 'Industrial Cleaner', 'Maintenance Technician',
  'Sports Coach', 'Athletic Trainer', 'Referee', 'Sports Photographer', 'Equipment Manager',
  'Swimming Instructor', 'Tennis Coach', 'Basketball Coach', 'Football Coach', 'Cricket Coach',
  'DJ', 'Radio Host', 'Podcast Producer', 'Stand-up Comedian', 'Magician',
  'Clown', 'Face Painter', 'Balloon Artist', 'Street Performer', 'Theater Actor',
  'Janitor', 'Window Cleaner', 'Pool Cleaner', 'Pressure Washer', 'Chimney Cleaner',
  'Septic Tank Cleaner', 'Graffiti Remover', 'Biohazard Cleaner', 'Crime Scene Cleaner',
  'Barista', 'Tea Sommelier', 'Wine Expert', 'Beer Brewer', 'Chocolatier',
  'Ice Cream Maker', 'Sandwich Artist', 'Pizza Maker', 'Sushi Chef', 'Pastry Chef',
  'Emergency Responder', 'First Aid Trainer', 'CPR Instructor', 'Disaster Relief Worker',
  'Search and Rescue', 'Emergency Dispatcher', 'Crisis Counselor', 'Trauma Specialist',
  'Priest', 'Pastor', 'Religious Teacher', 'Spiritual Counselor', 'Wedding Officiant',
  'Funeral Director', 'Grief Counselor', 'Meditation Teacher', 'Spiritual Healer',
  'Research Assistant', 'Lab Technician', 'Data Analyst', 'Survey Researcher',
  'Market Analyst', 'Product Tester', 'Quality Assurance', 'Technical Writer',
  'Waste Management', 'Recycling Specialist', 'Environmental Consultant', 'Solar Panel Installer',
  'Wind Turbine Technician', 'Green Energy Consultant', 'Water Quality Tester', 'Air Quality Monitor',
  'Locksmith', 'Key Maker', 'Safe Technician', 'Clock Repair', 'Watch Repair',
  'Shoe Repair', 'Bicycle Repair', 'Upholstery Cleaner', 'Antique Restorer', 'Art Restorer',
  'Translator', 'Interpreter', 'Sign Language Interpreter', 'Transcriptionist', 'Proofreader',
  'Editor', 'Publisher', 'Print Technician', 'Graphic Artist', 'Layout Designer'
]


let ably: Ably.Realtime | null = null
let ablyRest: Ably.Rest | null = null

const initializeAbly = (clientId: string) => {
  ablyRest = new Ably.Rest({ key: '' })// Use yours
  ably = new Ably.Realtime({
    key: '',// Use yours
    authCallback: async (tokenParams, callback) => {
      try {
        if (!ablyRest) {
          throw new Error('Ably REST client not initialized')
        }
        const tokenRequest = await ablyRest.auth.createTokenRequest({ clientId })
        callback(null, tokenRequest)
      } catch (error: any) {
        console.error('Ably authCallback error:', error, {
          code: error.code,
          statusCode: error.statusCode,
          message: error.message,
        })
        Alert.alert('Error', `Failed to authenticate with chat service: ${error.message || 'Unknown error'}. Please try again.`)
        callback(error, null)
      }
    },
    log: { level: 4 },
  })

  
  ably.connection.on('connected', () => {
    console.log('Ably connected successfully')
  })
  ably.connection.on('failed', (err) => {
    console.error('Ably connection failed:', err)
    Alert.alert('Error', `Chat service connection failed. Please check your network.`)
  })
}

interface Gig {
  id: string
  age: number
  category: string
  city: string
  lat: string
  lon: string
  name: string
  phoneNumber: string
  price: number
  workingDays: number
  visibility: boolean
}

interface LocationCoords {
  latitude: number
  longitude: number
}


const createAblyChannel = (buyerId: string, sellerId: string) => {
  if (!ably) {
    throw new Error('Ably client not initialized')
  }
  const channelName = `chat:${[buyerId, sellerId].sort().join('_')}`
  return ably.channels.get(channelName)
}

const sendAblyMessage = async (buyerId: string, sellerId: string, message: string, senderName: string) => {
  try {
    if (!buyerId || !sellerId || !message || !senderName) {
      throw new Error('Missing required parameters for sending message')
    }
    if (!ably) {
      throw new Error('Chat client not initialized')
    }

    if (ably.connection.state !== 'connected') {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Ably connection timeout')), 10000)
        ably!.connection.once('connected', () => {
          clearTimeout(timeout)
          resolve()
        })
        ably!.connection.once('failed', (err) => {
          clearTimeout(timeout)
          reject(new Error(`Ably connection failed`))
        })
      })
    }

    const channel = createAblyChannel(buyerId, sellerId)
    await channel.publish('message', {
      text: message,
      senderId: buyerId,
      senderName: senderName,
      timestamp: Date.now(),
    })

    const chatId = [buyerId, sellerId].sort().join('_')
    await setDoc(doc(db, 'chats', chatId, 'messages', Date.now().toString()), {
      text: message,
      senderId: buyerId,
      senderName: senderName,
      createdAt: new Date(),
    })

    return true
  } catch (error: any) {
    console.error('Error sending Ably message:', error, {
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
    })
    Alert.alert(
      'Error',
      `Failed to send message: ${error.message || 'Unknown error'}. Please check your network and try again.`,
    )
    return false
  }
}

const createChatRoom = async (buyerId: string, sellerId: string, gigData: Gig) => {
  try {
    const chatId = [buyerId, sellerId].sort().join('_')

    await setDoc(doc(db, 'chatRooms', chatId), {
      participants: [buyerId, sellerId],
      buyerId,
      sellerId,
      gigId: gigData.id,
      gigTitle: `${gigData.category} - ${gigData.name}`,
      createdAt: new Date(),
      lastActivity: new Date(),
    })

    const buyerDoc = await getDoc(doc(db, 'users', buyerId))
    const buyerName = buyerDoc.exists() ? buyerDoc.data().name : 'Buyer'

    const initialMessage = `Hi! I'm interested in your ${gigData.category} services. Let's discuss the details.`
    const success = await sendAblyMessage(buyerId, sellerId, initialMessage, buyerName)

    if (!success) {
      throw new Error('Failed to send initial message')
    }

    return chatId
  } catch (error: any) {
    console.error('Error creating chat room:', error)
    Alert.alert('Error', `Failed to create chat room: ${error.message || 'Unknown error'}. Please try again.`)
    throw error
  }
}



interface FilterSectionProps {
  theme: any
  category: string
  setCategory: (value: string) => void
  minPrice: string
  setMinPrice: (value: string) => void
  maxPrice: string
  setMaxPrice: (value: string) => void
  sortBy: string
  setSortBy: (value: string) => void
}

const FilterSection: React.FC<FilterSectionProps> = React.memo(({
  theme,
  category,
  setCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
}) => {
  const prices = useMemo(() => ['0', '500', '1000', '1500', '2000', '3000', '4000', '5000'], [])
  const sortOptions = useMemo(() => ['Nearest', 'Cheapest', 'Most Expensive'], [])

  return (
    <View style={[styles.filterSection, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
      <Text style={[styles.filterTitle, { color: theme.text }]}>Filters & Sorting</Text>
      
      <View style={styles.filterItem}>
        <Text style={[styles.filterLabel, { color: theme.text }]}>Profession</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.cardBg, borderColor: theme.navBorder }]}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue: string) => setCategory(itemValue)}
            style={styles.picker}
            dropdownIconColor={theme.text}
          >
            <Picker.Item label="All Professions" value="" />
            {PROFESSIONS.map(profession => (
              <Picker.Item key={profession} label={profession} value={profession} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.priceRow}>
        <View style={[styles.filterItem, styles.halfWidth]}>
          <Text style={[styles.filterLabel, { color: theme.text }]}>Min Price</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.cardBg, borderColor: theme.navBorder }]}>
            <Picker
              selectedValue={minPrice}
              onValueChange={(itemValue: string) => setMinPrice(itemValue)}
              style={styles.picker}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="No Min" value="" />
              {prices.map(p => (
                <Picker.Item key={p} label={`₹${p}`} value={p} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={[styles.filterItem, styles.halfWidth]}>
          <Text style={[styles.filterLabel, { color: theme.text }]}>Max Price</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.cardBg, borderColor: theme.navBorder }]}>
            <Picker
              selectedValue={maxPrice}
              onValueChange={(itemValue: string) => setMaxPrice(itemValue)}
              style={styles.picker}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="No Max" value="" />
              {prices.map(p => (
                <Picker.Item key={p} label={`₹${p}`} value={p} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <View style={styles.filterItem}>
        <Text style={[styles.filterLabel, { color: theme.text }]}>Sort By</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.cardBg, borderColor: theme.navBorder }]}>
          <Picker
            selectedValue={sortBy}
            onValueChange={(itemValue: string) => setSortBy(itemValue)}
            style={styles.picker}
            dropdownIconColor={theme.text}
          >
            <Picker.Item label="None" value="" />
            {sortOptions.map(o => (
              <Picker.Item key={o} label={o} value={o} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  )
})

FilterSection.displayName = 'FilterSection'



interface SearchButtonProps {
  theme: any
  onPress: () => void
  loading: boolean
}

const SearchButton: React.FC<SearchButtonProps> = React.memo(({ theme, onPress, loading }) => {
  const [isPressed, setIsPressed] = useState(false)

  const handlePressIn = useCallback(() => {
    setIsPressed(true)
    Vibration.vibrate(25)
  }, [])

  const handlePressOut = useCallback(() => {
    setIsPressed(false)
  }, [])

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={loading}
      style={[
        styles.searchButtonContainer,
        {
          transform: [{ scale: isPressed ? 0.98 : 1 }],
          opacity: loading ? 0.7 : 1,
        },
      ]}
    >
      <LinearGradient
        colors={theme.gradient as string[]}
        style={[
          styles.searchButton,
          {
            shadowColor: theme.shadow,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <>
            <Text style={styles.searchButtonIcon}></Text>
            <Text style={styles.searchButtonText}>Search for Professionals</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  )
})

SearchButton.displayName = 'SearchButton'



interface GigItemProps {
  gig: Gig
  theme: any
  onPress: () => void
  index: number
  userLocation?: LocationCoords
}

const GigItem: React.FC<GigItemProps> = React.memo(({ 
  gig, 
  theme, 
  onPress, 
  index,
  userLocation 
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current
  const [isPressed, setIsPressed] = useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 100,
      }).start()
    }, index * 100)
    return () => clearTimeout(timer)
  }, [scaleAnim, index])

  const handlePressIn = useCallback(() => {
    setIsPressed(true)
    Vibration.vibrate(15)
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 8,
    }).start()
  }, [scaleAnim])

  const handlePressOut = useCallback(() => {
    setIsPressed(false)
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start()
  }, [scaleAnim])

  const getCategoryColor = useCallback((category: string) => {
    
    let hash = 0
    for (let i = 0 ;i < category.length ;i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    const colors = [theme.accentA, theme.accentB, theme.accentC, theme.accentD, theme.accentE]
    return colors[Math.abs(hash) % colors.length]
  }, [theme])

  const calculateDistance = useCallback(() => {
    if (!userLocation) return null
    
    const toRad = (val: number) => (val * Math.PI) / 180
    const R = 6371
    const lat2Num = parseFloat(gig.lat)
    const lon2Num = parseFloat(gig.lon)
    
    if (isNaN(lat2Num) || isNaN(lon2Num)) return null
    
    const dLat = toRad(lat2Num - userLocation.latitude)
    const dLon = toRad(lon2Num - userLocation.longitude)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(userLocation.latitude)) * Math.cos(toRad(lat2Num)) * Math.sin(dLon / 2) ** 2
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
  }, [userLocation, gig.lat, gig.lon])

  const distance = calculateDistance()

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.gigCard,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.navBorder,
            shadowColor: theme.shadow,
            width: width * 0.9,
            alignSelf: 'center',
          },
        ]}
      >
        <LinearGradient
          colors={[getCategoryColor(gig.category), getCategoryColor(gig.category)]}
          style={styles.gigGradientBorder}
        />
        
        <View style={styles.gigContent}>
          <View style={styles.gigHeader}>
            <View style={styles.gigInfo}>
              <Text style={[styles.gigName, { color: theme.text, fontSize: width * 0.05 }]}>{gig.name}</Text>
              <Text style={[styles.gigCity, { color: theme.textSub, fontSize: width * 0.035 }]}>
                {gig.city} {distance && `• ${distance}`}
              </Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(gig.category) }]}>
              <Text style={[styles.categoryText, { fontSize: width * 0.028 }]} numberOfLines={1}>
                {gig.category.length > 12 ? gig.category.substring(0, 12) + '...' : gig.category}
              </Text>
            </View>
          </View>
          
          <View style={styles.gigDetails}>
            <View style={styles.gigDetailItem}>
              <Text style={[styles.gigPrice, { color: theme.accentA, fontSize: width * 0.055 }]}>₹{gig.price}</Text>
              <Text style={[styles.gigPriceLabel, { color: theme.textSub, fontSize: width * 0.03 }]}>Price</Text>
            </View>
            <View style={styles.gigDetailItem}>
              <Text style={[styles.gigDays, { color: theme.text, fontSize: width * 0.045 }]}>{gig.workingDays}</Text>
              <Text style={[styles.gigDaysLabel, { color: theme.textSub, fontSize: width * 0.03 }]}>Days</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
})

GigItem.displayName = 'GigItem'



interface EmptyStateProps {
  theme: any
  hasSearched: boolean
}

const EmptyState: React.FC<EmptyStateProps> = ({ theme, hasSearched }) => {
  return (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={theme.gradient as string[]}
        style={[styles.emptyIcon, { shadowColor: theme.shadow }]}
      >
        <Text style={styles.emptyIconText}>
          {hasSearched ? '🔍' : '🎯'}
        </Text>
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: theme.text, fontSize: width * 0.06 }]}>
        {hasSearched ? 'No Professionals Found' : 'Ready to Search'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSub, fontSize: width * 0.04 }]}>
        {hasSearched 
          ? 'Try adjusting your filters or search criteria to find more results.'
          : 'Set your filters and tap "Search Professionals" to discover skilled workers in your area.'
        }
      </Text>
    </View>
  )
}



interface PopupProps {
  gig: Gig
  theme: any
  onClose: () => void
  userLocation?: LocationCoords
  currentUserId: string | null
}

const Popup: React.FC<PopupProps> = React.memo(({ gig, theme, onClose, userLocation, currentUserId }) => {
  const navigation = useNavigation<any>()
  const [isConnecting, setIsConnecting] = useState(false)

  const calculateDistance = useCallback(() => {
    if (!userLocation) return null
    
    const toRad = (val: number) => (val * Math.PI) / 180
    const R = 6371
    const lat2Num = parseFloat(gig.lat)
    const lon2Num = parseFloat(gig.lon)
    
    if (isNaN(lat2Num) || isNaN(lon2Num)) return null
    
    const dLat = toRad(lat2Num - userLocation.latitude)
    const dLon = toRad(lon2Num - userLocation.longitude)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(userLocation.latitude)) * Math.cos(toRad(lat2Num)) * Math.sin(dLon / 2) ** 2
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
  }, [userLocation, gig.lat, gig.lon])

  const distance = calculateDistance()

  const handleAcceptAndChat = useCallback(async () => {
    if (!currentUserId) {
      Alert.alert('Error', 'You must be logged in to start a chat.')
      return
    }

    setIsConnecting(true)
    
    try {
      const chatId = await createChatRoom(currentUserId, gig.id, gig)
      
      Alert.alert(
        'Success!', 
        'Chat started successfully! The professional will receive your message instantly.',
        [
          {
            text: 'OK',
            onPress: () => {
              onClose()
              try {
                navigation.navigate('chats', {
                  sellerId: gig.id,
                  sellerName: gig.name,
                  selectedGig: gig,
                  isNewChat: true,
                  chatId: chatId
                })
              } catch (navError) {
                console.log('Navigation error:', navError)
              }
            }
          }
        ]
      )
      
    } catch (error: any) {
      console.error('Error starting chat:', error)
      Alert.alert(
        'Error',
        `Failed to start chat: ${error.message || 'Unknown error'}. Please try again or check your network.`,
        [{ text: 'OK' }]
      )
    } finally {
      setIsConnecting(false)
    }
  }, [currentUserId, gig, onClose, navigation])

  const handleOverlayPress = useCallback(() => {
    onClose()
  }, [onClose])

  const handleCardPress = useCallback(() => {
    
  }, [])

  return (
    <Modal
      transparent
      animationType="fade"
      visible={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.popupOverlay} onPress={handleOverlayPress}>
        <View style={styles.popupContainer}>
          <Pressable onPress={handleCardPress} style={[styles.popupCard, { backgroundColor: theme.cardBg, borderColor: theme.navBorder }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.popupContent}>
              <Text style={[styles.popupTitle, { color: theme.text }]}>{gig.name}</Text>
              
              <View style={styles.popupDetailsContainer}>
                <View style={styles.popupRow}>
                  <Text style={[styles.popupLabel, { color: theme.textSub }]}>Age:</Text>
                  <Text style={[styles.popupValue, { color: theme.text }]}>{gig.age}</Text>
                </View>
                
                <View style={styles.popupRow}>
                  <Text style={[styles.popupLabel, { color: theme.textSub }]}>Profession:</Text>
                  <Text style={[styles.popupValue, { color: theme.text }]}>{gig.category}</Text>
                </View>
                
                <View style={styles.popupRow}>
                  <Text style={[styles.popupLabel, { color: theme.textSub }]}>City:</Text>
                  <Text style={[styles.popupValue, { color: theme.text }]}>{gig.city}</Text>
                </View>
                
                <View style={styles.popupRow}>
                  <Text style={[styles.popupLabel, { color: theme.textSub }]}>Phone Number:</Text>
                  <Text style={[styles.popupValue, { color: theme.accentA }]}>{gig.phoneNumber}</Text>
                </View>
                
                <View style={styles.popupRow}>
                  <Text style={[styles.popupLabel, { color: theme.textSub }]}>Price:</Text>
                  <Text style={[styles.popupValue, { color: theme.accentA }]}>₹{gig.price}</Text>
                </View>
                
                <View style={styles.popupRow}>
                  <Text style={[styles.popupLabel, { color: theme.textSub }]}>Working Days:</Text>
                  <Text style={[styles.popupValue, { color: theme.text }]}>{gig.workingDays}</Text>
                </View>
                
                {distance && (
                  <View style={styles.popupRow}>
                    <Text style={[styles.popupLabel, { color: theme.textSub }]}>Distance:</Text>
                    <Text style={[styles.popupValue, { color: theme.text }]}>{distance}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.popupButtonContainer}>
                <Pressable 
                  onPress={handleAcceptAndChat} 
                  style={[
                    styles.popupSingleActionButton,
                    { opacity: isConnecting ? 0.7 : 1 }
                  ]}
                  disabled={isConnecting}
                >
                  <LinearGradient colors={[theme.accentC, theme.accentC]} style={styles.popupButtonGradient}>
                    {isConnecting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Text style={styles.popupButtonIcon}>💬</Text>
                        <Text style={styles.popupButtonText}>Contact Professional</Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
              
              <Pressable onPress={onClose} style={styles.popupCloseButton}>
                <Text style={[styles.popupCloseButtonText, { color: theme.textSub }]}>Close</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  )
})

Popup.displayName = 'Popup'



const Search: React.FC = () => {
  const { theme, actualTheme } = useTheme() 
  
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [gigs, setGigs] = useState<Gig[]>([])
  const [location, setLocation] = useState<LocationCoords | null>(null)
  const [sortBy, setSortBy] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user ? user.uid : null)
    })

    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required for sorting by distance.')
          return
        }
        const loc = await Location.getCurrentPositionAsync({})
        setLocation(loc.coords)
      } catch (err) {
        console.error('Error fetching location:', err)
        Alert.alert('Error', 'Failed to fetch location.')
      }
    }

    getLocation()

    return () => {
      unsubscribe()
      if (ably) {
        ably.connection.off()
        ably.close()
      }
    }
  }, [])

  
  useEffect(() => {
    if (currentUserId) {
      if (ably) {
        ably.connection.off()
        ably.close()
      }
      initializeAbly(currentUserId)
    }
  }, [currentUserId])

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: string, lon2: string) => {
    const toRad = (val: number) => (val * Math.PI) / 180
    const R = 6371
    const lat2Num = parseFloat(lat2)
    const lon2Num = parseFloat(lon2)
    if (isNaN(lat2Num) || isNaN(lon2Num)) return Infinity
    const dLat = toRad(lat2Num - lat1)
    const dLon = toRad(lon2Num - lon1)
    const a = Math.sin(dLat / 2) ** 2 + 
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2Num)) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }, [])

  const knnSort = useCallback((gigs: Gig[], userLocation: LocationCoords) => {
    const gigsWithDistance = gigs.map(gig => ({
      ...gig,
      distance: calculateDistance(userLocation.latitude, userLocation.longitude, gig.lat, gig.lon)
    }))

    return gigsWithDistance
      .filter(gig => gig.distance !== Infinity)
      .sort((a, b) => a.distance - b.distance)
      .map(gig => ({
        id: gig.id,
        age: gig.age,
        category: gig.category,
        city: gig.city,
        lat: gig.lat,
        lon: gig.lon,
        name: gig.name,
        phoneNumber: gig.phoneNumber,
        price: gig.price,
        workingDays: gig.workingDays,
        visibility: gig.visibility
      }))
  }, [calculateDistance])

  const searchGigs = useCallback(async () => {
    setLoading(true)
    setHasSearched(true)
    try {
      const q = query(collection(db, 'Sellers'), where('visibility', '==', true))
      const snapshot = await getDocs(q)
      let gigs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Gig[]

      if (currentUserId) {
        gigs = gigs.filter((gig: Gig) => gig.id !== currentUserId)
      }

      gigs = gigs.filter((gig: Gig) => {
        if (category && gig.category !== category) return false
        if (minPrice && (isNaN(parseInt(minPrice)) || gig.price < parseInt(minPrice))) return false
        if (maxPrice && (isNaN(parseInt(maxPrice)) || gig.price > parseInt(maxPrice))) return false
        return true
      })

      if (sortBy === 'Nearest' && location) {
        gigs = knnSort(gigs, location)
      } else if (sortBy === 'Cheapest') {
        gigs = gigs.sort((a, b) => a.price - b.price)
      } else if (sortBy === 'Most Expensive') {
        gigs = gigs.sort((a, b) => b.price - a.price)
      }

      setGigs(gigs)
    } catch (err) {
      console.error('Error searching gigs:', err)
      Alert.alert('Error', 'Failed to load professionals.')
    } finally {
      setLoading(false)
    }
  }, [category, minPrice, maxPrice, currentUserId, sortBy, location, knnSort])

  const handleGigPress = useCallback((gig: Gig) => {
    setSelectedGig(gig)
  }, [])

  const handleClosePopup = useCallback(() => {
    setSelectedGig(null)
  }, [])

  const renderItem = useCallback(({ item, index }: { item: Gig; index: number }) => (
    <GigItem
      gig={item}
      theme={theme}
      onPress={() => handleGigPress(item)}
      index={index}
      userLocation={location || undefined}
    />
  ), [theme, handleGigPress, location])

  const renderSeparator = useCallback(() => <View style={styles.separator} />, [])

  const keyExtractor = useCallback((item: Gig) => item.id, [])

  const ListEmptyComponent = useCallback(() => <EmptyState theme={theme} hasSearched={hasSearched} />, [theme, hasSearched])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar 
        barStyle={actualTheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <View style={[styles.header, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: width * 0.065 }]}>Find Professionals</Text>
        <Text style={[styles.headerSub, { color: theme.textSub, fontSize: width * 0.035 }]}>
          Discover skilled professionals near you
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <FilterSection
          theme={theme}
          category={category}
          setCategory={setCategory}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <View style={styles.searchButtonWrapper}>
          <SearchButton
            theme={theme}
            onPress={searchGigs}
            loading={loading}
          />
        </View>

        <View style={styles.resultsContainer}>
          {gigs.length > 0 && (
            <Text style={[styles.resultsCount, { color: theme.text, fontSize: width * 0.04 }]}>
              Found {gigs.length} professional{gigs.length !== 1 ? 's' : ''}
            </Text>
          )}
          
          <FlatList
            data={gigs}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.gigsList,
              gigs.length === 0 && styles.gigsListEmpty
            ]}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            ListEmptyComponent={ListEmptyComponent}
            ItemSeparatorComponent={renderSeparator}
          />
        </View>
      </ScrollView>

      {selectedGig && (
        <Popup
          gig={selectedGig}
          theme={theme}
          onClose={handleClosePopup}
          userLocation={location || undefined}
          currentUserId={currentUserId}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  filterSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  filterTitle: {
    fontSize: width * 0.045,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterItem: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: width * 0.035,
    fontWeight: '600',
    marginBottom: 10,
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 55,
    justifyContent: 'center',
  },
  picker: {
    height: 55,
    width: '100%',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  halfWidth: {
    width: '46%',
  },
  searchButtonWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  searchButtonIcon: {
    fontSize: width * 0.05,
    marginRight: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '700',
  },
  resultsContainer: {
    paddingHorizontal: 20,
  },
  resultsCount: {
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  gigsList: {
    paddingBottom: 30,
  },
  gigsListEmpty: {
    minHeight: 300,
    justifyContent: 'center',
  },
  separator: {
    height: 12,
  },
  gigCard: {
    borderRadius: 20,
    marginVertical: 4,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  gigGradientBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  gigContent: {
    padding: 16,
    paddingLeft: 24,
  },
  gigHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gigInfo: {
    flex: 1,
    marginRight: 12,
  },
  gigName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  gigCity: {
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: 120,
  },
  categoryText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  gigDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gigDetailItem: {
    alignItems: 'center',
  },
  gigPrice: {
    fontWeight: '800',
  },
  gigPriceLabel: {
    fontWeight: '500',
    marginTop: 2,
  },
  gigDays: {
    fontWeight: '700',
  },
  gigDaysLabel: {
    fontWeight: '500',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  popupContainer: {
    width: '100%',
    maxWidth: width * 0.9,
    maxHeight: height * 0.8,
  },
  popupCard: {
    borderRadius: 20,
    borderWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  popupContent: {
    padding: 24,
  },
  popupTitle: {
    fontSize: width * 0.06,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  popupDetailsContainer: {
    marginBottom: 24,
  },
  popupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  popupLabel: {
    fontSize: width * 0.04,
    fontWeight: '600',
    flex: 1,
  },
  popupValue: {
    fontSize: width * 0.04,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  popupButtonContainer: {
    marginBottom: 16,
  },
  popupSingleActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  popupButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  popupButtonIcon: {
    fontSize: width * 0.04,
    marginRight: 8,
  },
  popupButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '700',
  },
  popupCloseButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  popupCloseButtonText: {
    fontSize: width * 0.04,
    fontWeight: '600',
  },
})

export default Search
