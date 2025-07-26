import React, { useEffect, useState } from 'react'

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
  Animated,
  Pressable,
  Dimensions,
  Vibration,
  StatusBar,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebaseConfig'
import * as Location from 'expo-location'
import { Picker } from '@react-native-picker/picker'
import { useRouter } from 'expo-router'

const { width } = Dimensions.get('window')

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

interface Gig {
  id: string
  name: string
  category: string
  price: number
  workingDays: number
  city: string
  lat: string
  lon: string
  visibility: boolean
}



interface FilterSectionProps {
  theme: ThemeColors
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
  const categories = ['Cook', 'Driver', 'Cleaner', 'Painter', 'Plumber']
  const prices = ['0', '500', '1000', '1500', '2000']
  const sortOptions = ['Nearest', 'Cheapest']

  return (
    <View style={[styles.filterSection, { backgroundColor: theme.surface }]}>
      <Text style={[styles.filterTitle, { color: theme.text }]}>Filters & Sorting</Text>
      
      <View style={styles.filterItem}>
        <Text style={[styles.filterLabel, { color: theme.text }]}>Category</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.cardBg, borderColor: theme.navBorder }]}>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={[styles.picker]}
          >
            <Picker.Item label="All Categories" value="" />
            {categories.map(c => (
              <Picker.Item key={c} label={c} value={c} />
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
              onValueChange={setMinPrice}
              style={[styles.picker]}
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
              onValueChange={setMaxPrice}
              style={[styles.picker]}
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
            onValueChange={setSortBy}
            style={[styles.picker]}
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



interface SearchButtonProps {
  theme: ThemeColors
  onPress: () => void
  loading: boolean
}

const SearchButton: React.FC<SearchButtonProps> = React.memo(({ theme, onPress, loading }) => {
  const [isPressed, setIsPressed] = useState(false)

  const handlePressIn = () => {
    setIsPressed(true)
    Vibration.vibrate(25)
  }

  const handlePressOut = () => {
    setIsPressed(false)
  }

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
        colors={theme.gradient}
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
            <Text style={styles.searchButtonIcon}>🔍</Text>
            <Text style={styles.searchButtonText}>Search Gigs</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  )
})



interface GigItemProps {
  gig: Gig
  theme: ThemeColors
  onPress: () => void
  index: number
  userLocation?: { latitude: number; longitude: number }
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

  const handlePressIn = () => {
    setIsPressed(true)
    Vibration.vibrate(15)
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 8,
    }).start()
  }

  const handlePressOut = () => {
    setIsPressed(false)
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start()
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Cook: theme.accentC,
      Driver: theme.accentD,
      Cleaner: theme.accentB,
      Painter: theme.accentE,
      Plumber: theme.accentA,
    }
    return colors[category as keyof typeof colors] || theme.accentA
  }

  const calculateDistance = () => {
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
  }

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
              <Text style={[styles.gigName, { color: theme.text }]}>{gig.name}</Text>
              <Text style={[styles.gigCity, { color: theme.textSub }]}>
                {gig.city} {distance && `• ${distance}`}
              </Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(gig.category) }]}>
              <Text style={styles.categoryText}>{gig.category}</Text>
            </View>
          </View>
          
          <View style={styles.gigDetails}>
            <View style={styles.gigDetailItem}>
              <Text style={[styles.gigPrice, { color: theme.accentA }]}>₹{gig.price}</Text>
              <Text style={[styles.gigPriceLabel, { color: theme.textSub }]}>Price</Text>
            </View>
            <View style={styles.gigDetailItem}>
              <Text style={[styles.gigDays, { color: theme.text }]}>{gig.workingDays}</Text>
              <Text style={[styles.gigDaysLabel, { color: theme.textSub }]}>Days</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
})



interface EmptyStateProps {
  theme: ThemeColors
  hasSearched: boolean
}

const EmptyState: React.FC<EmptyStateProps> = ({ theme, hasSearched }) => {
  return (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={theme.gradient}
        style={[styles.emptyIcon, { shadowColor: theme.shadow }]}
      >
        <Text style={styles.emptyIconText}>
          {hasSearched ? '🔍' : '🎯'}
        </Text>
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {hasSearched ? 'No Gigs Found' : 'Ready to Search'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSub }]}>
        {hasSearched 
          ? 'Try adjusting your filters or search criteria to find more results.'
          : 'Set your filters and tap "Search Gigs" to discover skilled professionals in your area.'
        }
      </Text>
    </View>
  )
}



export default function Search() {
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [gigs, setGigs] = useState<Gig[]>([])
  const [location, setLocation] = useState<{ latitude: number ;longitude: number } | null>(null)
  const [sortBy, setSortBy] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const router = useRouter()
  const colorScheme = useColorScheme()
  const theme = getTheme(colorScheme === 'dark' ? 'dark' : 'light')

  useEffect(() => {
    (async () => {
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
    })()
  }, [])

  const calculateDistance = (lat1: number, lon1: number, lat2: string, lon2: string) => {
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
  }

  const knnSort = (gigs: Gig[], userLocation: { latitude: number ;longitude: number }) => {
    
    const gigsWithDistance = gigs.map(gig => ({
      ...gig,
      distance: calculateDistance(userLocation.latitude, userLocation.longitude, gig.lat, gig.lon)
    }))

    
    return gigsWithDistance
      .filter(gig => gig.distance !== Infinity) 
      .sort((a, b) => a.distance - b.distance)
      .map(gig => ({
        id: gig.id,
        name: gig.name,
        category: gig.category,
        price: gig.price,
        workingDays: gig.workingDays,
        city: gig.city,
        lat: gig.lat,
        lon: gig.lon,
        visibility: gig.visibility
      }))
  }

  const searchGigs = async () => {
    setLoading(true)
    setHasSearched(true)
    try {
      const q = query(collection(db, 'Sellers'), where('visibility', '==', true))
      const snapshot = await getDocs(q)
      let gigs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Gig[]

      
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
      }

      setGigs(gigs)
    } catch (err) {
      console.error('Error searching gigs:', err)
      Alert.alert('Error', 'Failed to load gigs.')
    } finally {
      setLoading(false)
    }
  }

  const renderItem = ({ item, index }: { item: Gig ;index: number }) => (
    <GigItem
      gig={item}
      theme={theme}
      onPress={() => router.push(`/viewGig?id=${item.id}`)} 
      index={index}
      userLocation={location || undefined}
    />
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Find Gigs</Text>
        <Text style={[styles.headerSub, { color: theme.textSub }]}>
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
            <Text style={[styles.resultsCount, { color: theme.text }]}>
              Found {gigs.length} gig{gigs.length !== 1 ? 's' : ''}
            </Text>
          )}
          
          <FlatList
            data={gigs}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.gigsList,
              gigs.length === 0 && styles.gigsListEmpty
            ]}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            ListEmptyComponent={<EmptyState theme={theme} hasSearched={hasSearched} />}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </ScrollView>
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterItem: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
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
    fontSize: 20,
    marginRight: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsContainer: {
    paddingHorizontal: 20,
  },
  resultsCount: {
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  gigCity: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  gigDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gigDetailItem: {
    alignItems: 'center',
  },
  gigPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  gigPriceLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  gigDays: {
    fontSize: 16,
    fontWeight: '700',
  },
  gigDaysLabel: {
    fontSize: 12,
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
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },
})