import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  useColorScheme,
  StatusBar,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebaseConfig'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

const { width, height } = Dimensions.get('window')

const sharedGradients = {
  header: { start: '#4c51bf', end: '#553c9a' },
  button: { start: '#38a169', end: '#319795' },
}
const lightColors = {
  background: '#f8f9fa',
  cardBackground: '#ffffff',
  gradientStart: sharedGradients.header.start,
  gradientEnd: sharedGradients.header.end,
  textPrimary: '#1a202c',
  textSecondary: '#4a5568',
  textLight: '#ffffff',
  inputBackground: '#ffffff',
  inputBorder: '#e2e8f0',
  inputText: '#2d3748',
  accent: sharedGradients.button.start,
  accentSecondary: sharedGradients.button.end,
  error: '#e53e3e',
  errorBackground: '#fed7d7',
  errorBorder: '#feb2b2',
}
const darkColors = {
  background: '#1a202c',
  cardBackground: '#2d3748',
  gradientStart: sharedGradients.header.start,
  gradientEnd: sharedGradients.header.end,
  textPrimary: '#ffffff',
  textSecondary: '#a0aec0',
  textLight: '#ffffff',
  inputBackground: '#2d3748',
  inputBorder: '#4a5568',
  inputText: '#ffffff',
  accent: sharedGradients.button.start,
  accentSecondary: sharedGradients.button.end,
  error: '#fc8181',
  errorBackground: '#553c3c',
  errorBorder: '#742626',
}

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const colorScheme = useColorScheme()
  const colors = colorScheme === 'dark' ? darkColors : lightColors
  const styles = getStyles(colors)

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.replace('/dashboard')
    } catch (err: any) {
      let errorMessage = 'Something went wrong. Please try again.'
      if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.'
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.'
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.'
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please wait a moment and try again.'
      }
      setError(errorMessage)
    }
    setLoading(false)
  }

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (error) setError('')
    if (field === 'email') {
      setEmail(value)
    } else {
      setPassword(value)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔑</Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your WorkConnect account</Text>
        </View>
      </LinearGradient>
      <View style={styles.formCard}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, error && styles.inputError]}
              value={email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              textContentType="emailAddress"
              importantForAutofill="yes"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, error && styles.inputError]}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(value) => handleInputChange('password', value)}
              autoCapitalize="none"
              autoComplete="current-password"
              autoCorrect={false}
              textContentType="password"
              importantForAutofill="yes"
            />
            <TouchableOpacity
              style={styles.showPasswordContainer}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <View style={styles.checkbox}>
                {showPassword && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.showPasswordText}>Show password</Text>
            </TouchableOpacity>
          </View>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.accent, colors.accentSecondary]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/signup')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

interface ThemeColors {
  background: string
  cardBackground: string
  gradientStart: string
  gradientEnd: string
  textPrimary: string
  textSecondary: string
  textLight: string
  inputBackground: string
  inputBorder: string
  inputText: string
  accent: string
  accentSecondary: string
  error: string
  errorBackground: string
  errorBorder: string
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: height * 0.02,
      paddingBottom: height * 0.025,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
    },
    headerContent: {
      alignItems: 'center',
      paddingHorizontal: width * 0.05,
    },
    iconContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 30,
      padding: 15,
      marginBottom: 15,
    },
    icon: {
      fontSize: 35,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textLight,
      marginBottom: 6,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textLight,
      textAlign: 'center',
      fontWeight: '500',
      opacity: 0.9,
    },
    formCard: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      paddingHorizontal: width * 0.06,
      paddingTop: height * 0.04,
      paddingBottom: height * 0.02,
      marginTop: height * 0.02,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    form: {
      width: '100%',
    },
    inputContainer: {
      marginBottom: 24,
    },
    inputLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 2,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color: colors.inputText,
      fontWeight: '500',
    },
    inputError: {
      borderColor: colors.error,
      backgroundColor: colors.errorBackground,
    },
    showPasswordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    checkbox: {
      width: 16,
      height: 16,
      borderWidth: 2,
      borderColor: colors.accent,
      borderRadius: 3,
      marginRight: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmark: {
      color: colors.accent,
      fontSize: 10,
      fontWeight: 'bold',
    },
    showPasswordText: {
      fontSize: 12,
      color: colors.accent,
      fontWeight: '500',
    },
    errorContainer: {
      backgroundColor: colors.errorBackground,
      borderWidth: 1,
      borderColor: colors.errorBorder,
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 18,
    },
    button: {
      width: '100%',
      marginBottom: 24,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    buttonGradient: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.textLight,
      fontSize: 17,
      fontWeight: '700',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.inputBorder,
    },
    dividerText: {
      marginHorizontal: 15,
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
    },
    secondaryButton: {
      paddingVertical: 14,
      paddingHorizontal: 32,
      alignItems: 'center',
      borderRadius: 12,
      backgroundColor: 'rgba(76, 81, 191, 0.1)',
    },
    secondaryButtonText: {
      color: colors.accent,
      fontSize: 15,
      fontWeight: '600',
    },
  })
}
