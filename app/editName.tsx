import React, { useState } from 'react';
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useColorScheme,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { useRouter } from 'expo-router'; 



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
} as const;

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
} as const;

interface ThemeColors {
  bg: string;
  surface: string;
  cardBg: string;
  text: string;
  textSub: string;
  gradient: readonly [string, string];
  accentA: string;
  accentB: string;
  accentC: string;
  accentD: string;
  accentE: string;
  navBg: string;
  navBorder: string;
  shadow: string;
  tip: string;
}

const getTheme = (scheme: 'light' | 'dark'): ThemeColors => {
  const palette = scheme === 'dark' ? darkPalette : lightPalette;
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
  };
};

export default function EditName() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter(); 
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark' ? 'dark' : 'light');
  const [isPressed, setIsPressed] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not found');

      const ref = doc(db, 'users', currentUser.uid);
      await setDoc(ref, { name }, { merge: true });
      
      
      router.replace('/dashboard');
    } catch (err) {
      console.error('Error saving name:', err);
      setError('Failed to save name');
      Alert.alert('Error', 'Failed to save name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePressIn = () => {
    setIsPressed(true);
    Vibration.vibrate(20);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>What's your name?</Text>

      <TextInput
        style={[
          styles.input,
          {
            borderColor: theme.navBorder,
            backgroundColor: theme.surface,
            color: theme.text,
          },
        ]}
        placeholder='Enter your name'
        placeholderTextColor={theme.textSub}
        value={name}
        onChangeText={setName}
      />

      {error ? <Text style={[styles.error, { color: theme.accentE }]}>{error}</Text> : null}

      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleSave}
        disabled={loading || !name.trim()}
        style={[
          styles.buttonContainer,
          {
            transform: [{ scale: isPressed ? 0.98 : 1 }],
            opacity: loading || !name.trim() ? 0.7 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={theme.gradient}
          style={[
            styles.button,
            {
              shadowColor: theme.shadow,
              borderColor: isPressed ? theme.accentC : 'transparent',
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={styles.buttonText}>Save</Text>
          )}
        </LinearGradient>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  buttonContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
});
