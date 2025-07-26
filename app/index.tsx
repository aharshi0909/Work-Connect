import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebaseConfig'

const { width, height } = Dimensions.get('window')

const lightColors = {
  background: '#ffffff',
  headerBackground: '#4765ecff', 
  gradientStart: '#6b7ad3',
  gradientEnd: '#553c9a',
  heroGradientStart: '#e674b3',
  heroGradientEnd: '#c53030',
  cardGradientStart: '#4a8cc7',
  cardGradientEnd: '#1a365d',
  textPrimary: '#1a202c',
  textSecondary: '#4a5568',
  textLight: '#ffffff',
  accent: '#38a169',
  accentSecondary: '#319795',
}

const darkColors = {
  background: '#1a202c',
  headerBackground: '#1e3a8a', 
  gradientStart: '#6b7ad3', 
  gradientEnd: '#553c9a', 
  heroGradientStart: '#e674b3', 
  heroGradientEnd: '#c53030', 
  cardGradientStart: '#4a8cc7', 
  cardGradientEnd: '#1a365d', 
  textPrimary: '#ffffff',
  textSecondary: '#a0aec0',
  textLight: '#ffffff',
  accent: '#38a169', 
  accentSecondary: '#319795', 
}

export default function WelcomePage() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = colorScheme === 'dark' ? darkColors : lightColors
  const styles = getStyles(colors)

  useEffect(() => {
    let isMounted = true

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && isMounted) {
        router.replace('/dashboard')
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [router])

  const features = [
    {
      icon: '📍',
      title: 'Local Opportunities',
      description: 'Browse nearby jobs effortlessly in just a few taps.',
      gradient: ['#3643f8ff', '#636df5ff'], 
    },
    {
      icon: '👤',
      title: 'Professional Profile',
      description: 'Showcase your experience and attract potential employers.',
      gradient: ['#4a9d9d', '#38d6d6'], 
    },
    {
      icon: '💬',
      title: 'Instant Communication',
      description: 'Message and schedule with employers directly from the app.',
      gradient: ['#FF6B6B', '#FA8072'], 
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
          <View style={styles.headerContent}>
            <Text style={styles.logo}>WorkConnect</Text>
            <Text style={styles.tagline}>Find work. Build your future.</Text>
          </View>
        </View>

        <LinearGradient
          colors={[colors.heroGradientStart, colors.heroGradientEnd]}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <Text style={styles.heroIcon}>🎯</Text>
            </View>
            <Text style={styles.heroTitle}>
              Discover flexible jobs that fit your lifestyle
            </Text>
            <Text style={styles.heroSubtitle}>
              Explore local opportunities and grow your career with ease.
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose WorkConnect?</Text>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={styles.featureCard}
              activeOpacity={0.8}
              accessibilityLabel={`${feature.title}: ${feature.description}`}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={feature.gradient}
                style={styles.featureGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.ctaSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>Get Started Today</Text>
            <Text style={styles.ctaSubtitle}>
              Create your profile to begin exploring new opportunities
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/signup')}
              activeOpacity={0.8}
              accessibilityLabel="Create Your Profile"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={[colors.accent, colors.accentSecondary]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Create Your Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/signin')}
              activeOpacity={0.8}
              accessibilityLabel="Sign in to existing account"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  )
}

interface ThemeColors {
  background: string
  headerBackground: string
  gradientStart: string
  gradientEnd: string
  heroGradientStart: string
  heroGradientEnd: string
  cardGradientStart: string
  cardGradientEnd: string
  textPrimary: string
  textSecondary: string
  textLight: string
  accent: string
  accentSecondary: string
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    header: {
      paddingTop: height * 0.02,
      paddingBottom: height * 0.04,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    headerContent: {
      alignItems: 'center',
      paddingHorizontal: width * 0.05,
    },
    logo: {
      fontSize: 36,
      fontWeight: '800',
      color: colors.textLight,
      marginBottom: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    tagline: {
      fontSize: 18,
      color: colors.textLight,
      textAlign: 'center',
      fontWeight: '500',
      opacity: 0.95,
    },
    heroSection: {
      marginHorizontal: width * 0.05,
      marginTop: height * 0.03,
      borderRadius: 25,
      overflow: 'hidden',
    },
    heroContent: {
      alignItems: 'center',
      padding: width * 0.08,
    },
    heroIconContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 40,
      padding: 20,
      marginBottom: 24,
    },
    heroIcon: {
      fontSize: 48,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 34,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    heroSubtitle: {
      fontSize: 18,
      color: colors.textLight,
      textAlign: 'center',
      fontWeight: '400',
      opacity: 0.9,
      lineHeight: 24,
    },
    featuresSection: {
      paddingHorizontal: width * 0.05,
      paddingVertical: height * 0.05,
    },
    sectionTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 32,
    },
    featureCard: {
      marginBottom: 20,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    featureGradient: {
      flexDirection: 'row',
      padding: 24,
      alignItems: 'center',
    },
    featureIconContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 25,
      padding: 16,
      marginRight: 20,
    },
    featureIcon: {
      fontSize: 32,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textLight,
      marginBottom: 8,
    },
    featureDescription: {
      fontSize: 16,
      color: colors.textLight,
      opacity: 0.9,
      lineHeight: 22,
    },
    ctaSection: {
      marginTop: height * 0.02,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
    },
    ctaContent: {
      alignItems: 'center',
      paddingHorizontal: width * 0.05,
      paddingTop: height * 0.05,
      paddingBottom: height * 0.08,
    },
    ctaTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: 12,
    },
    ctaSubtitle: {
      fontSize: 18,
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: 32,
      opacity: 0.9,
      lineHeight: 24,
    },
    primaryButton: {
      width: '100%',
      marginBottom: 16,
      borderRadius: 15,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    buttonGradient: {
      paddingVertical: 18,
      paddingHorizontal: 32,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: colors.textLight,
      fontSize: 18,
      fontWeight: '600',
    },
    secondaryButton: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      width: '100%',
      alignItems: 'center',
      borderRadius: 15,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    secondaryButtonText: {
      color: colors.textLight,
      fontSize: 16,
      fontWeight: '500',
      opacity: 0.9,
    },
  })
}
