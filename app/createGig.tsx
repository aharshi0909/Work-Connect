import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
  StatusBar,
  useColorScheme,
  Vibration,
  Pressable,
  ScrollView,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { auth, db } from './firebaseConfig'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import * as Location from 'expo-location'

const { width, height } = Dimensions.get('window')
const OPENCAGE_API_KEY = '' // Enter yours


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
  
  
  'Artist', 'Painter', 'Sculptor', 'Illustrator', 'Animator',
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
  'Pet Photographer', 'Aquarium Maintenance', 'Horse Trainer', 'Pet Taxi',
  
  
  'Tailor', 'Seamstress', 'Dry Cleaning', 'Laundry Service', 'Ironing Service',
  'Locksmith', 'Key Maker', 'Safe Technician', 'Watch Repair', 'Jewelry Repair',
  'Shoe Repair', 'Leather Worker', 'Upholsterer', 'Furniture Repair', 'Antique Restorer',
  
  
  'Waste Management', 'Recycling Worker', 'Environmental Consultant', 'Solar Panel Installer',
  'Energy Auditor', 'Green Building Consultant', 'Water Treatment Specialist',
  
  
  'Sports Coach', 'Swimming Instructor', 'Tennis Coach', 'Cricket Coach', 'Football Coach',
  'Badminton Coach', 'Basketball Coach', 'Sports Referee', 'Equipment Manager',
  
  
  'Handyman', 'Odd Jobs', 'Errand Runner', 'Shopping Assistant', 'Queue Stander',
  'Line Waiter', 'Document Processor', 'Form Filler', 'Research Assistant', 'Survey Conductor',
  'Mystery Shopper', 'Product Tester', 'Focus Group Participant', 'Brand Ambassador',
  'Promoter', 'Leaflet Distributor', 'Street Performer', 'Balloon Artist', 'Magician',
  'Clown', 'Face Painter', 'Henna Artist', 'Mehendi Artist', 'Rangoli Artist',
]



const lightPalette = {
  accentA: '#4c51bf',
  accentB: '#6366f1',
  accentC: '#10b981',
  accentD: '#f59e0b',
  accentE: '#ef4444',
  surface: '#ffffff',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1f2937',
  textSub: '#6b7280',
  navBg: '#ffffff',
  navBorder: '#e5e7eb',
  shadow: 'rgba(0, 0, 0, 0.1)',
  tip: '#fef3c7',
} as const

const darkPalette = {
  accentA: '#6366f1',
  accentB: '#8b5cf6',
  accentC: '#10b981',
  accentD: '#f59e0b',
  accentE: '#ef4444',
  surface: '#1f2937',
  background: '#111827',
  card: '#374151',
  text: '#ffffff',
  textSub: '#9ca3af',
  navBg: '#1f2937',
  navBorder: '#374151',
  shadow: 'rgba(0, 0, 0, 0.4)',
  tip: '#374151',
} as const

interface ThemeColors {
  bg: string
  surface: string
  cardBg: string
  text: string
  textSub: string
  gradient: readonly [string, string]
  accentA: string
  accentB: string
  accentC: string
  accentD: string
  accentE: string
  navBg: string
  navBorder: string
  shadow: string
  tip: string
}

const getTheme = (scheme: 'light' | 'dark'): ThemeColors => {
  const palette = scheme === 'dark' ? darkPalette : lightPalette
  return {
    bg: palette.background,
    surface: palette.surface,
    cardBg: palette.card,
    text: palette.text,
    textSub: palette.textSub,
    gradient: [palette.accentA, palette.accentB] as const,
    accentA: palette.accentA,
    accentB: palette.accentB,
    accentC: palette.accentC,
    accentD: palette.accentD,
    accentE: palette.accentE,
    navBg: palette.navBg,
    navBorder: palette.navBorder,
    shadow: palette.shadow,
    tip: palette.tip,
  }
}


interface ProfessionDropdownProps {
  theme: ThemeColors
  selectedCategory: string
  onSelect: (category: string) => void
}

const ProfessionDropdown: React.FC<ProfessionDropdownProps> = ({ theme, selectedCategory, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filteredProfessions, setFilteredProfessions] = useState(PROFESSIONS)

  const handleSearch = useCallback((text: string) => {
    setSearchText(text)
    if (text.trim() === '') {
      setFilteredProfessions(PROFESSIONS)
    } else {
      const filtered = PROFESSIONS.filter(profession =>
        profession.toLowerCase().includes(text.toLowerCase())
      )
      setFilteredProfessions(filtered)
    }
  }, [])

  const handleSelectProfession = useCallback((profession: string) => {
    onSelect(profession)
    setModalVisible(false)
    setSearchText('')
    setFilteredProfessions(PROFESSIONS)
    Vibration.vibrate(25)
  }, [onSelect])

  const renderProfessionItem = useCallback(({ item }: { item: string }) => (
    <Pressable
      style={[
        styles.professionItem,
        {
          backgroundColor: selectedCategory === item ? theme.accentA + '20' : 'transparent',
          borderColor: selectedCategory === item ? theme.accentA : theme.navBorder,
        }
      ]}
      onPress={() => handleSelectProfession(item)}
    >
      <Text style={[
        styles.professionText,
        {
          color: selectedCategory === item ? theme.accentA : theme.text,
          fontWeight: selectedCategory === item ? '600' : '400',
        }
      ]}>
        {item}
      </Text>
      {selectedCategory === item && (
        <Text style={[styles.checkMark, { color: theme.accentA }]}>✓</Text>
      )}
    </Pressable>
  ), [selectedCategory, theme, handleSelectProfession])

  const keyExtractor = useCallback((item: string) => item, [])

  return (
    <>
      <Pressable
        style={[
          styles.dropdownButton,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.navBorder,
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[
          styles.dropdownText,
          {
            color: selectedCategory ? theme.text : theme.textSub,
          }
        ]}>
          {selectedCategory || 'Select a profession...'}
        </Text>
        <Text style={[styles.dropdownArrow, { color: theme.textSub }]}>▼</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.bg }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.navBorder }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Your Profession</Text>
            <Pressable
              style={[styles.closeButton, { backgroundColor: theme.accentE }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.navBorder,
                  color: theme.text,
                }
              ]}
              placeholder="Search professions..."
              placeholderTextColor={theme.textSub}
              value={searchText}
              onChangeText={handleSearch}
              autoCapitalize="words"
              clearButtonMode="while-editing"
            />
            <Text style={[styles.resultCount, { color: theme.textSub }]}>
              {filteredProfessions.length} profession{filteredProfessions.length !== 1 ? 's' : ''} found
            </Text>
          </View>

          <FlatList
            data={filteredProfessions}
            renderItem={renderProfessionItem}
            keyExtractor={keyExtractor}
            style={styles.professionList}
            contentContainerStyle={styles.professionListContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
            removeClippedSubviews={true}
            getItemLayout={(data, index) => ({
              length: 60,
              offset: 60 * index,
              index,
            })}
          />
        </SafeAreaView>
      </Modal>
    </>
  )
}


interface LocationSectionProps {
  theme: ThemeColors
  isAutoLocation: boolean
  setIsAutoLocation: (value: boolean) => void
  city: string
  setCity: (value: string) => void
  lat: string
  lon: string
  onRefreshLocation: () => void
  isRefreshing: boolean
}

const LocationSection: React.FC<LocationSectionProps> = ({
  theme,
  isAutoLocation,
  setIsAutoLocation,
  city,
  setCity,
  lat,
  lon,
  onRefreshLocation,
  isRefreshing,
}) => {
  return (
    <View style={[styles.locationSection, { backgroundColor: theme.cardBg, borderColor: theme.navBorder }]}>
      <Text style={[styles.locationSectionTitle, { color: theme.text }]}>Location Settings</Text>
      
      <View style={styles.locationSwitchRow}>
        <View style={styles.locationSwitchInfo}>
          <Text style={[styles.locationSwitchLabel, { color: theme.text }]}>Auto-detect Location</Text>
          <Text style={[styles.locationSwitchSubtext, { color: theme.textSub }]}>
            {isAutoLocation ? 'Using GPS to detect your location' : 'Manually enter your city name'}
          </Text>
        </View>
        <Switch
          value={isAutoLocation}
          onValueChange={setIsAutoLocation}
          trackColor={{ false: theme.navBorder, true: theme.accentC + '50' }}
          thumbColor={isAutoLocation ? theme.accentC : theme.textSub}
        />
      </View>

      {isAutoLocation ? (
        <View style={styles.autoLocationContainer}>
          <View style={[styles.autoLocationInfo, { backgroundColor: theme.surface, borderColor: theme.navBorder }]}>
            <Text style={[styles.autoLocationTitle, { color: theme.text }]}>📍 Current Location</Text>
            <Text style={[styles.autoLocationText, { color: theme.textSub }]}>
              {city || 'Detecting location...'}
            </Text>
            {lat && lon && (
              <Text style={[styles.autoLocationCoords, { color: theme.textSub }]}>
                Coordinates: {parseFloat(lat).toFixed(4)}, {parseFloat(lon).toFixed(4)}
              </Text>
            )}
          </View>
          <Pressable
            style={[
              styles.refreshLocationButton,
              {
                backgroundColor: theme.accentC,
                opacity: isRefreshing ? 0.7 : 1,
              }
            ]}
            onPress={onRefreshLocation}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.refreshLocationText}>Refresh Location</Text>
              </>
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.manualLocationContainer}>
          <Text style={[styles.manualLocationLabel, { color: theme.text }]}>City/Location Name</Text>
          <TextInput
            style={[
              styles.manualLocationInput,
              {
                backgroundColor: theme.surface,
                borderColor: theme.navBorder,
                color: theme.text,
              }
            ]}
            placeholder="Enter your city or area name"
            placeholderTextColor={theme.textSub}
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
          />
          <Text style={[styles.manualLocationHint, { color: theme.textSub }]}>
            e.g., Mumbai, Delhi, Bangalore, Kolkata, etc.
          </Text>
        </View>
      )}
    </View>
  )
}


const CreateGig: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAutoLocation, setIsAutoLocation] = useState(true)
  const [gig, setGig] = useState({
    name: '',
    age: '',
    price: '',
    workingDays: '',
    category: '',
    phoneNumber: '',
    visibility: true,
    city: '',
    lat: '',
    lon: '',
  })

  const colorScheme = useColorScheme()
  const theme = getTheme(colorScheme === 'dark' ? 'dark' : 'light')

  const fetchCity = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        'https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}'
      )
      const json = await res.json()
      return json?.results?.[0]?.components?.city || 
             json?.results?.[0]?.components?.town || 
             json?.results?.[0]?.components?.village || 
             json?.results?.[0]?.components?.state || 
             'Unknown'
    } catch (err) {
      console.error('Error fetching city:', err)
      return 'Unknown'
    }
  }

  const getCurrentLocation = async () => {
    try {
      setIsRefreshing(true)
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied', 
          'Location permission is required for auto-detection. You can manually enter your city instead.',
          [
            { text: 'Switch to Manual', onPress: () => setIsAutoLocation(false) },
            { text: 'Try Again', onPress: getCurrentLocation },
          ]
        )
        return
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        
      })
      const coords = loc.coords
      const city = await fetchCity(coords.latitude, coords.longitude)
      
      setGig(prev => ({
        ...prev,
        lat: coords.latitude.toString(),
        lon: coords.longitude.toString(),
        city,
      }))
    } catch (err) {
      console.error('Error getting current location:', err)
      Alert.alert(
        'Location Error', 
        'Failed to get your current location. You can manually enter your city instead.',
        [
          { text: 'Switch to Manual', onPress: () => setIsAutoLocation(false) },
          { text: 'Try Again', onPress: getCurrentLocation },
        ]
      )
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          Alert.alert('Error', 'User not authenticated')
          return
        }
        const SELLERS_COLLECTION = 'Sellers'
        const gigRef = doc(db, SELLERS_COLLECTION, currentUser.uid)
        
        const gigSnap = await getDoc(gigRef)

        if (gigSnap.exists()) {
          const data = gigSnap.data()
          
          
          const hasCoordinates = data.lat && data.lon
          setIsAutoLocation(hasCoordinates)
          
          setGig({
            name: data.name ?? '',
            age: data.age !== undefined ? String(data.age) : '',
            price: data.price !== undefined ? String(data.price) : '',
            workingDays: data.workingDays !== undefined ? String(data.workingDays) : '',
            category: data.category ?? '',
            phoneNumber: data.phoneNumber ?? '',
            visibility: data.visibility !== undefined ? data.visibility : true,
            city: data.city ?? '',
            lat: data.lat !== undefined ? String(data.lat) : '',
            lon: data.lon !== undefined ? String(data.lon) : '',
          })
        } else {
          getCurrentLocation()
        }
      } catch (err) {
        console.error('Error initializing gig:', err)
        Alert.alert('Error', 'Failed to initialize gig data.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  
  useEffect(() => {
    if (isAutoLocation && !gig.lat && !gig.lon) {
      getCurrentLocation()
    } else if (!isAutoLocation) {
      
      setGig(prev => ({
        ...prev,
        lat: '',
        lon: '',
      }))
    }
  }, [isAutoLocation])

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const handleSave = async () => {
    if (!gig.name || !gig.age || !gig.price || !gig.workingDays || !gig.category || !gig.phoneNumber) {
      Alert.alert('Validation Error', 'Please fill all fields including phone number and profession')
      return
    }

    if (!gig.city.trim()) {
      Alert.alert('Validation Error', 'Please provide your location (either auto-detect or enter manually)')
      return
    }
    
    if (
      isNaN(Number(gig.age)) ||
      isNaN(Number(gig.price)) ||
      isNaN(Number(gig.workingDays))
    ) {
      Alert.alert('Invalid input', 'Age, Price, and Working Days must be valid numbers.')
      return
    }

    if (!validatePhoneNumber(gig.phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number with at least 10 digits.')
      return
    }

    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated')
        return
      }

      const SELLERS_COLLECTION = 'Sellers'
      const ref = doc(db, SELLERS_COLLECTION, currentUser.uid)
      
      console.log('Saving to collection:', SELLERS_COLLECTION)
      console.log('User UID:', currentUser.uid)
      console.log('Document path:', `${SELLERS_COLLECTION}/${currentUser.uid}`)
      
      const gigData = {
        ...gig,
        age: Number(gig.age),
        price: Number(gig.price),
        workingDays: Number(gig.workingDays),
        phoneNumber: gig.phoneNumber.trim(),
        city: gig.city.trim(),
        sellerId: currentUser.uid,
        updatedAt: new Date().toISOString(),
        
        ...(isAutoLocation && gig.lat && gig.lon ? {
          lat: gig.lat,
          lon: gig.lon,
        } : {}),
      }
      
      console.log('Saving gig data:', gigData)
      
      await setDoc(ref, gigData, { merge: true })
      
      Alert.alert('Success', 'Gig saved successfully.')
      Vibration.vibrate(50)
    } catch (err) {
      console.error('Error saving gig:', err)
      const errorMsg = err instanceof Error ? err.message : String(err)
      Alert.alert('Error', `Failed to save gig: ${errorMsg}`)
    }
  }

  const handleDelete = async () => {
    Alert.alert(
      'Delete Gig',
      'Are you sure you want to delete this gig? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUser = auth.currentUser
              if (!currentUser) {
                Alert.alert('Error', 'User not authenticated')
                return
              }

              const SELLERS_COLLECTION = 'Sellers'
              const ref = doc(db, SELLERS_COLLECTION, currentUser.uid)
              
              await deleteDoc(ref)

              setGig({
                name: '',
                age: '',
                price: '',
                workingDays: '',
                category: '',
                phoneNumber: '',
                visibility: true,
                city: '',
                lat: '',
                lon: '',
              })

              console.log('Gig deleted successfully')
              Alert.alert('Success', 'Gig deleted successfully')
              Vibration.vibrate(50)
            } catch (err) {
              console.error('Error deleting gig:', err)
              const errorMsg = err instanceof Error ? err.message : String(err)
              Alert.alert('Error', `Failed to delete gig: ${errorMsg}`)
            }
          },
        },
      ]
    )
  }

  const updateField = (field: string, value: string | boolean) => {
    setGig(prev => ({ ...prev, [field]: value }))
  }

  const handleRefreshLocation = () => {
    getCurrentLocation()
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
          <View style={[styles.loadingIcon, { backgroundColor: theme.accentA, shadowColor: theme.shadow }]}>
            <Text style={styles.loadingText}>G</Text>
          </View>
          <Text style={[styles.loadingLabel, { color: theme.text }]}>Loading Gig...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Create / Edit Gig</Text>
        <Text style={[styles.headerSub, { color: theme.textSub }]}>
          Choose from {PROFESSIONS.length}+ professions
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.formSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Service Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.cardBg, 
                borderColor: theme.navBorder,
                color: theme.text 
              }]}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSub}
              value={gig.name}
              onChangeText={v => updateField('name', v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Age</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.cardBg, 
                borderColor: theme.navBorder,
                color: theme.text 
              }]}
              placeholder="Enter your age"
              placeholderTextColor={theme.textSub}
              keyboardType="numeric"
              value={gig.age}
              onChangeText={v => updateField('age', v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.cardBg, 
                borderColor: theme.navBorder,
                color: theme.text 
              }]}
              placeholder="Enter your phone number"
              placeholderTextColor={theme.textSub}
              keyboardType="phone-pad"
              value={gig.phoneNumber}
              onChangeText={v => updateField('phoneNumber', v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Price per Project</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.cardBg, 
                borderColor: theme.navBorder,
                color: theme.text 
              }]}
              placeholder="Enter price in rupees"
              placeholderTextColor={theme.textSub}
              keyboardType="numeric"
              value={gig.price}
              onChangeText={v => updateField('price', v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Working Days per Month</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.cardBg, 
                borderColor: theme.navBorder,
                color: theme.text 
              }]}
              placeholder="Enter working days"
              placeholderTextColor={theme.textSub}
              keyboardType="numeric"
              value={gig.workingDays}
              onChangeText={v => updateField('workingDays', v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Profession ({PROFESSIONS.length}+ options available)
            </Text>
            <ProfessionDropdown
              theme={theme}
              selectedCategory={gig.category}
              onSelect={(category) => updateField('category', category)}
            />
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={[styles.switchLabel, { color: theme.text }]}>Visibility</Text>
              <Text style={[styles.switchSubtext, { color: theme.textSub }]}>
                Make your gig visible to buyers
              </Text>
            </View>
            <Switch
              value={gig.visibility}
              onValueChange={v => updateField('visibility', v)}
              trackColor={{ false: theme.navBorder, true: theme.accentA + '50' }}
              thumbColor={gig.visibility ? theme.accentA : theme.textSub}
            />
          </View>

          <LocationSection
            theme={theme}
            isAutoLocation={isAutoLocation}
            setIsAutoLocation={setIsAutoLocation}
            city={gig.city}
            setCity={(city) => updateField('city', city)}
            lat={gig.lat}
            lon={gig.lon}
            onRefreshLocation={handleRefreshLocation}
            isRefreshing={isRefreshing}
          />
        </View>

        <View style={styles.buttonSection}>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveButtonContainer,
              { transform: [{ scale: pressed ? 0.98 : 1 }] }
            ]}
          >
            <LinearGradient
              colors={theme.gradient}
              style={[styles.saveButton, { shadowColor: theme.shadow }]}
            >
              <Text style={styles.saveButtonText}>Save Gig</Text>
            </LinearGradient>
          </Pressable>

          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: theme.accentE }]}
            onPress={handleDelete}
          >
            <Text style={[styles.deleteText, { color: theme.accentE }]}>Delete Gig</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  loadingLabel: {
    marginTop: 20,
    fontSize: 16,
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
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  formSection: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 56,
  },
  
  dropdownButton: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchInput: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 8,
  },
  resultCount: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  professionList: {
    flex: 1,
  },
  professionListContent: {
    paddingBottom: 20,
  },
  professionItem: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  professionText: {
    fontSize: 16,
    flex: 1,
  },
  checkMark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  switchSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  
  locationSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  locationSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  locationSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationSwitchInfo: {
    flex: 1,
  },
  locationSwitchLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  locationSwitchSubtext: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  autoLocationContainer: {
    gap: 12,
  },
  autoLocationInfo: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  autoLocationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  autoLocationText: {
    fontSize: 15,
    fontWeight: '500',
  },
  autoLocationCoords: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  refreshLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  refreshLocationIcon: {
    fontSize: 16,
  },
  refreshLocationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  manualLocationContainer: {
    gap: 8,
  },
  manualLocationLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  manualLocationInput: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    minHeight: 48,
  },
  manualLocationHint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  buttonSection: {
    marginTop: 30,
    gap: 16,
  },
  saveButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButton: {
    padding: 18,
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
  },
})

export default CreateGig
