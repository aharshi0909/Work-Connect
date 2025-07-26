import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Pressable,
  StatusBar,
  Dimensions,
  Easing,
  Vibration,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, usePathname, useFocusEffect } from 'expo-router'
import { useTheme } from './ThemeContext' 
const { width, height } = Dimensions.get('window')


const ParticleComponent: React.FC<{ theme: any ;index: number }> = React.memo(({ theme, index }) => {
  const translateY = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.5)).current
  const opacity = useRef(new Animated.Value(0)).current
  
  const initialPosition = useRef({
    left: Math.random() * (width - 20),
    top: Math.random() * (height - 100),
    size: 4 + Math.random() * 8,
  }).current

  useEffect(() => {
    const delay = Math.random() * 3000
    const startAnimations = () => {
      Animated.loop(
        Animated.timing(translateY, {
          toValue: -120 - Math.random() * 80,
          duration: 6000 + Math.random() * 4000,
          useNativeDriver: true,
          easing: Easing.sin,
        }),
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 1500 + Math.random() * 1000,
            useNativeDriver: true,
            easing: Easing.quad,
          }),
          Animated.timing(scale, {
            toValue: 0.5,
            duration: 1500 + Math.random() * 1000,
            useNativeDriver: true,
            easing: Easing.quad,
          }),
        ]),
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    }
    const timer = setTimeout(startAnimations, delay)
    return () => clearTimeout(timer)
  }, [translateY, scale, opacity])

  const colors = [theme.accentA, theme.accentB, theme.accentC, theme.accentD]
  const particleColor = colors[index % colors.length]

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: initialPosition.left,
          top: initialPosition.top,
          width: initialPosition.size,
          height: initialPosition.size,
          borderRadius: 6,
          backgroundColor: particleColor,
        },
        {
          transform: [{ translateY: translateY }, { scale: scale }],
          opacity: opacity,
        },
      ]}
    />
  )
})

const FloatingParticles: React.FC<{ theme: any }> = React.memo(({ theme }) => {
  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {Array.from({ length: 30 }, (_, i) => (
        <ParticleComponent key={i} theme={theme} index={i} />
      ))}
    </View>
  )
})


interface SettingItemProps {
  title: string  
  subtitle?: string
  icon: string
  onPress?: () => void
  rightElement?: React.ReactNode
  delay?: number
  theme: any
}

const SettingItem: React.FC<SettingItemProps> = React.memo(({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  rightElement, 
  delay = 0, 
  theme 
}) => {
  const translateY = useRef(new Animated.Value(30)).current
  const opacity = useRef(new Animated.Value(0)).current
  const [isPressed, setIsPressed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 120,
        }),
        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 120,
        }),
      ]).start()
    }, delay)
    return () => clearTimeout(timer)
  }, [translateY, opacity, delay])

  const handlePressIn = () => {
    if (onPress) {
      setIsPressed(true)
      Vibration.vibrate(20)
    }
  }

  const handlePressOut = () => {
    setIsPressed(false)
  }

  return (
    <Animated.View
      style={[
        {
          transform: [
            { translateY },
            { scale: isPressed ? 0.98 : 1 },
          ],
          opacity,
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.settingItem,
          {
            backgroundColor: theme.cardBg,
            shadowColor: theme.shadow,
            borderColor: isPressed ? theme.accentA : 'transparent',
          },
        ]}
      >
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>{icon}</Text>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
            {subtitle && <Text style={[styles.settingSubtitle, { color: theme.textSub }]}>{subtitle}</Text>}
          </View>
        </View>
        {rightElement && <View style={styles.settingRight}>{rightElement}</View>}
      </Pressable>
    </Animated.View>
  )
})


const ThemeSelector: React.FC<{ 
  theme: any 
  currentMode: string 
  onThemeChange: (mode: 'system' | 'light' | 'dark') => Promise<void>
}> = React.memo(({ theme, currentMode, onThemeChange }) => {
  const themeOptions = [
    { key: 'system', label: 'System', icon: '🔄' },
    { key: 'light', label: 'Light', icon: '☀️' },
    { key: 'dark', label: 'Dark', icon: '🌙' },
  ]

  const handleThemeChange = async (mode: 'system' | 'light' | 'dark') => {
    Vibration.vibrate(30)
    await onThemeChange(mode)
  }

  return (
    <View style={[styles.themeSelector, { backgroundColor: theme.cardBg, shadowColor: theme.shadow }]}>
      <Text style={[styles.themeSelectorTitle, { color: theme.text }]}>Theme</Text>
      <View style={styles.themeOptions}>
        {themeOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.themeOption,
              {
                backgroundColor: currentMode === option.key ? theme.accentA : 'transparent',
                borderColor: currentMode === option.key ? theme.accentA : theme.navBorder,
              },
            ]}
            onPress={() => handleThemeChange(option.key as 'system' | 'light' | 'dark')}
          >
            <Text style={styles.themeOptionIcon}>{option.icon}</Text>
            <Text
              style={[
                styles.themeOptionLabel,
                {
                  color: currentMode === option.key ? '#fff' : theme.text,
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
})


const SectionHeader: React.FC<{ title: string ;theme: any }> = React.memo(({ title, theme }) => (
  <Text style={[styles.sectionHeader, { color: theme.text }]}>{title}</Text>
))


interface BottomNavigationProps {
  router: any
  theme: any
}

const BottomNavigation: React.FC<BottomNavigationProps> = React.memo(({ router, theme }) => {
  const pathname = usePathname()
  
  const navItems = [
    {
      label: 'Home',
      route: '/dashboard',
      icon: '⬜',
      showPlus: true, 
    },
    {
      label: 'Chats',
      route: '/chats',
      icon: '💬',
      showPlus: false,
    },
    {
      label: 'Settings',
      route: '/settings',
      icon: '⚙️',
      showPlus: false,
    },
  ]

  const getActiveIndex = () => {
    if (pathname === '/chats') return 1
    if (pathname === '/settings') return 2
    return 0
  }

  const activeIndex = getActiveIndex()
  const indicatorPosition = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const tabWidth = width / navItems.length
    const toValue = tabWidth * activeIndex + (tabWidth / 2) - 20

    Animated.spring(indicatorPosition, {
      toValue,
      useNativeDriver: false,
      friction: 12,
      tension: 120,
      velocity: 1,
    }).start()
  }, [activeIndex, indicatorPosition, navItems.length])

  const handleTabPress = (index: number, route: string | null) => {
    Vibration.vibrate(20)
    if (route && pathname !== route) {
      router.push(route)
    }
  }

  return (
    <View
      style={[
        styles.bottomNav,
        {
          backgroundColor: theme.navBg,
          borderTopColor: theme.navBorder,
          shadowColor: theme.shadow,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.navIndicator,
          {
            backgroundColor: theme.accentA,
            left: indicatorPosition,
          },
        ]}
      />
      {navItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.navItem}
          onPress={() => handleTabPress(index, item.route)}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            {item.icon && (
              <Text
                style={[
                  styles.navIcon,
                  {
                    opacity: activeIndex === index ? 1 : 0.6,
                    transform: [{ scale: activeIndex === index ? 1.2 : 1 }],
                  },
                ]}
              >
                {item.icon}
              </Text>
            )}
            {item.showPlus && (
              <View style={[styles.plusSymbol, { backgroundColor: theme.accentA }]}>
                <Text style={styles.plusText}>+</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.navLabel,
              {
                color: activeIndex === index ? theme.accentA : theme.textSub,
                fontWeight: activeIndex === index ? '600' : '500',
              },
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
})


const SettingsScreen = () => {
  const router = useRouter()
  const { theme, currentMode, actualTheme, setThemeMode, isLoading } = useTheme() 

  
  const handleBackPress = useCallback(() => {
    Vibration.vibrate(20)
    router.push('/dashboard')
  }, [router])

  const handleAbout = useCallback(() => {
    Vibration.vibrate(30)
    
  }, [])

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(actualTheme === 'dark' ? 'light-content' : 'dark-content')
    }, [actualTheme])
  )

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
          <View style={[styles.loadingIcon, { backgroundColor: theme.accentA, shadowColor: theme.shadow }]}>
            <Text style={styles.loadingText}>⚙️</Text>
          </View>
          <Text style={[styles.loadingLabel, { color: theme.text }]}>Loading Settings...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <StatusBar
        barStyle={actualTheme === 'dark' ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />
      <FloatingParticles theme={theme} />
      
      {}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: theme.accentA }]}
            onPress={handleBackPress}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
            <Text style={[styles.headerSub, { color: theme.textSub }]}>
              Customize your WorkConnect experience
            </Text>
          </View>
        </View>
      </View>

      {}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {}
        <ThemeSelector
          theme={theme}
          currentMode={currentMode}
          onThemeChange={setThemeMode}
        />

        {}
        <SectionHeader title="Support" theme={theme} />
        <SettingItem
          title="About"
          subtitle="App version and information"
          icon="ℹ️"
          onPress={handleAbout}
          delay={100}
          theme={theme}
        />
      </ScrollView>

      {}
      <SafeAreaView edges={['bottom']}>
        <BottomNavigation router={router} theme={theme} />
      </SafeAreaView>
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
    fontSize: 24,
  },
  loadingLabel: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 22,
    marginLeft: -2,
    marginTop: -1,
  },
  headerTextContainer: {
    flex: 1,
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
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  themeSelector: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  themeSelectorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  themeOptionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  settingRight: {
    marginLeft: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  navIconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navIcon: {
    fontSize: 20,
  },
  plusSymbol: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  plusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
})

export default SettingsScreen
