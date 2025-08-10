import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, usePathname, useFocusEffect } from 'expo-router';
import { usePersistedAuth } from './usePersistedAuth';
import { useTheme } from './ThemeContext';
import { db } from './firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');


const ParticleComponent: React.FC<{ theme: any; index: number }> = React.memo(({ theme, index }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  const initialPosition = useRef({
    left: Math.random() * (width - 20),
    top: Math.random() * (height - 100),
    size: 4 + Math.random() * 8,
  }).current;

  useEffect(() => {
    const delay = Math.random() * 3000;
    const startAnimations = () => {
      Animated.loop(
        Animated.timing(translateY, {
          toValue: -120 - Math.random() * 80,
          duration: 6000 + Math.random() * 4000,
          useNativeDriver: true,
          easing: Easing.sin,
        }),
      ).start();
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
      ).start();
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
      ).start();
    };
    const timer = setTimeout(startAnimations, delay);
    return () => clearTimeout(timer);
  }, [translateY, scale, opacity]);

  const colors = [theme.accentA, theme.accentB, theme.accentC, theme.accentD];
  const particleColor = colors[index % colors.length];

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
  );
});

const FloatingParticles: React.FC<{ theme: any }> = React.memo(({ theme }) => {
  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {Array.from({ length: 30 }, (_, i) => (
        <ParticleComponent key={i} theme={theme} index={i} />
      ))}
    </View>
  );
});

interface TipCardProps {
  title: string;
  description: string;
  color: string;
  onPress: () => void;
  delay?: number;
}

const TipCard: React.FC<TipCardProps> = React.memo(({ title, description, color, onPress, delay = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 100,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [scaleAnim, delay]);

  const handlePressIn = () => {
    setIsPressed(true);
    Vibration.vibrate(20);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.tipCard,
          {
            backgroundColor: color,
            borderColor: isPressed ? 'rgba(255,255,255,0.3)' : 'transparent',
            borderWidth: 2,
          },
        ]}
      >
        <Text style={styles.tipTitle}>{title}</Text>
        <Text style={styles.tipDescription}>{description}</Text>
      </Pressable>
    </Animated.View>
  );
});

interface RoleSwitcherProps {
  role: 'Buyer' | 'Seller';
  onToggle: () => void;
  theme: any;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = React.memo(({ role, onToggle, theme }) => {
  const animValue = useRef(new Animated.Value(role === 'Buyer' ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: role === 'Buyer' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [role, animValue]);

  const handlePress = () => {
    Vibration.vibrate(30);
    onToggle();
  };

  const interpolatedColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.accentB, theme.accentA],
  });

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.roleSwitcher,
          {
            shadowColor: theme.shadow,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.roleSwitcherInner,
            {
              backgroundColor: interpolatedColor,
            },
          ]}
        >
          <Text style={styles.roleSwitcherText}>
            Switch to {role === 'Seller' ? 'Buyer' : 'Seller'} Mode
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
});

interface ActionCardProps {
  title: string;
  subtitle: string;
  gradient: readonly [string, string];
  onPress: () => void;
  delay?: number;
  theme: any;
  unreadCount?: number;
}

const ActionCard: React.FC<ActionCardProps> = React.memo(({ title, subtitle, gradient, onPress, delay = 0, theme, unreadCount }) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

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
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [translateY, opacity, delay]);

  const handlePressIn = () => {
    setIsPressed(true);
    Vibration.vibrate(25);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  return (
    <Animated.View
      style={[
        {
          transform: [
            { translateY: translateY },
            { scale: isPressed ? 0.98 : 1 },
          ],
          opacity: opacity,
        },
      ]}
    >
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
        <LinearGradient
          colors={gradient}
          style={[
            styles.actionCard,
            {
              shadowColor: theme.shadow,
            },
          ]}
        >
          <Text style={styles.actionTitle}>
            {title}
            {unreadCount && unreadCount > 0 ? ` (${unreadCount})` : ''}
          </Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
});

interface BottomNavigationProps {
  router: any;
  theme: any;
}

const BottomNavigation: React.FC<BottomNavigationProps> = React.memo(({ router, theme }) => {
  const pathname = usePathname();
  
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
  ];

  const getActiveIndex = () => {
    if (pathname === '/chats') return 1;
    if (pathname === '/settings') return 2;
    return 0;
  };

  const activeIndex = getActiveIndex();
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const tabWidth = width / navItems.length;
    const toValue = tabWidth * activeIndex + (tabWidth / 2) - 20;

    Animated.spring(indicatorPosition, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 150,
      velocity: 2,
    }).start();
  }, [activeIndex, indicatorPosition, navItems.length]);

  const handleTabPress = (index: number, route: string | null) => {
    Vibration.vibrate(20);
    if (route && pathname !== route) {
      router.push(route);
    }
  };

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
  );
});

const ChatbotPopup: React.FC<{ theme: any; onClose: () => void }> = React.memo(({ theme, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const suggestedQuestions = [
    {
      question: 'How can I increase my gig popularity?',
      answer: 'To boost your gig popularity, ensure your profile is complete with a professional photo, detailed descriptions, and a portfolio showcasing your best work. Set competitive prices based on market research. Respond to inquiries within an hour to improve your response rate. Promote your gigs on social media and engage with clients through clear communication. Regularly update your gig with fresh content and request reviews from satisfied clients to build credibility.',
    },
    {
      question: 'How do I set the right price for my services?',
      answer: 'Research similar services on the platform to understand market rates. Consider your experience, skill level, and the complexity of the task. Start with competitive pricing to attract initial clients, then adjust based on demand and feedback. Offer tiered packages (basic, standard, premium) to cater to different budgets. Monitor competitors’ pricing and ensure your rates reflect the value you provide.',
    },
    {
      question: 'What makes a good gig description?',
      answer: 'A good gig description is clear, concise, and highlights your unique skills. Use bullet points to list key services, specify deliverables, and mention your expertise. Include keywords relevant to your niche for better search visibility. Avoid jargon, and focus on how you solve the client’s problem. Add a call-to-action, like "Contact me to discuss your project!" to encourage inquiries.',
    },
    {
      question: 'How can I improve my response time?',
      answer: 'Enable push notifications to stay alerted about new messages. Check the app frequently, especially during peak hours. Set up auto-responses for common inquiries to acknowledge messages quickly. Prioritize responding to new inquiries within an hour to boost your ranking. If you’re unavailable, update your status to manage client expectations.',
    },
    {
      question: 'How do I handle difficult clients?',
      answer: 'Stay professional and calm. Listen to their concerns and clarify misunderstandings politely. Set clear expectations upfront in your gig description and contracts. If issues persist, use the platform’s messaging system to document communication. Offer reasonable solutions, like revisions or partial refunds, and escalate to support if needed. Always maintain a positive tone to protect your reputation.',
    },
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = { text, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const matchedQuestion = suggestedQuestions.find(q => q.question.toLowerCase() === text.toLowerCase());
      if (matchedQuestion) {
        setMessages(prev => [...prev, { text: matchedQuestion.answer, isUser: false }]);
        setIsLoading(false);
        return;
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': ``, // Use your's I cannot provide mine
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: text }],
          temperature: 0.7,
        }),
      });
      const data = await response.json();
      const botMessage = { text: data.choices?.[0]?.message?.content || "I'm powered by Groq, here to assist!", isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Sorry, I couldn't process that. Try again!", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
    sendMessage(question);
    Vibration.vibrate(20);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleClose = useCallback(() => {
    console.log('Close button pressed');
    Vibration.vibrate(30);
    onClose();
  }, [onClose]);

  return (
    <Modal
      transparent={false}
      animationType="fade"
      visible={true}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={[{
        flex: 1,
        backgroundColor: theme.bg,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        paddingTop: 0,
      }]}>
        <View style={[{
          paddingTop: 48,
          paddingBottom: 16,
          paddingHorizontal: 20,
          backgroundColor: theme.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.navBorder,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          elevation: 2,
        }]}>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: 22, fontWeight: '800', color: theme.text }]}>AI Assistant</Text>
            <Text style={[{ fontSize: 13, color: theme.textSub, marginTop: 2 }]}>Powered by Groq API</Text>
          </View>
          <TouchableOpacity
            onPress={handleClose}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: theme.accentA,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 16,
              elevation: 4,
              shadowColor: theme.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
            activeOpacity={0.7}
            accessibilityLabel="Close AI Assistant"
            accessibilityRole="button"
          >
            <Text style={{
              fontSize: 28,
              color: '#fff',
              fontWeight: 'bold',
              lineHeight: 28,
              textAlign: 'center',
            }}>
              ×
            </Text>
          </TouchableOpacity>
        </View>

        {/* Suggested Questions Section */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ padding: 12, backgroundColor: theme.bg }}
          contentContainerStyle={{ paddingHorizontal: 8 }}
        >
          {suggestedQuestions.map((q, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSuggestedQuestion(q.question)}
              style={{
                backgroundColor: theme.cardBg,
                borderRadius: 16,
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginRight: 8,
                borderWidth: 1,
                borderColor: theme.navBorder,
              }}
            >
              <Text style={{ color: theme.text, fontSize: 13, fontWeight: '500' }}>{q.question}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, backgroundColor: theme.bg }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                {
                  alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                  marginBottom: 10,
                  maxWidth: '80%',
                },
              ]}
            >
              <View
                style={[
                  {
                    backgroundColor: msg.isUser ? theme.accentA : theme.cardBg,
                    borderRadius: 14,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    shadowColor: theme.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                  },
                ]}
              >
                <Text style={{ color: msg.isUser ? '#fff' : theme.text, fontSize: 15 }}>{msg.text}</Text>
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={{ alignSelf: 'flex-start', marginBottom: 10 }}>
              <View style={{ backgroundColor: theme.cardBg, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16 }}>
                <ActivityIndicator color={theme.accentA} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.navBorder,
        }}>
          <TextInput
            style={{
              flex: 1,
              borderRadius: 10,
              padding: 12,
              backgroundColor: theme.cardBg,
              color: theme.text,
              borderColor: theme.navBorder,
              borderWidth: 1,
              fontSize: 15,
              marginRight: 10,
            }}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your question..."
            placeholderTextColor={theme.textSub}
            onSubmitEditing={() => sendMessage(inputText)}
            editable={!isLoading}
            returnKeyType="send"
          />
          <Pressable
            style={{
              backgroundColor: theme.accentA,
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 18,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: isLoading ? 0.7 : 1,
            }}
            onPress={() => sendMessage(inputText)}
            disabled={isLoading}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Send</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});

export default function Dashboard() {
  const router = useRouter();
  const { theme, actualTheme } = useTheme();
  const { user, role, name, loading, setRole, logout } = usePersistedAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(actualTheme === 'dark' ? 'light-content' : 'dark-content');
      return () => {};
    }, [actualTheme])
  );

  useEffect(() => {
    if (user && !name && !loading) {
      router.push('/editName');
    }
  }, [user, name, loading, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  const sellerTips = React.useMemo(
    () => [
      {
        title: 'Complete Your Profile',
        description: 'Add detailed descriptions and showcase your best work to attract clients',
        color: theme.accentC,
      },
      {
        title: 'Respond Quickly',
        description: 'Fast response times build trust and improve your reputation score',
        color: theme.accentD,
      },
      {
        title: 'Set Competitive Prices',
        description: 'Research market rates and price your services competitively',
        color: theme.accentE,
      },
    ],
    [theme],
  );

  const buyerTips = React.useMemo(
    () => [
      {
        title: 'Be Specific',
        description: 'Clear project descriptions help you find the right professionals faster',
        color: theme.accentC,
      },
      {
        title: 'Check Reviews',
        description: 'Read previous client feedback to make informed hiring decisions',
        color: theme.accentD,
      },
      {
        title: 'Communicate Clearly',
        description: 'Detailed briefs and expectations lead to better project outcomes',
        color: theme.accentE,
      },
    ],
    [theme],
  );

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      router.replace('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [logout, router]);

  const toggleRole = useCallback(async () => {
    try {
      const newRole = role === 'Buyer' ? 'Seller' : 'Buyer';
      await setRole(newRole);
    } catch (error) {
      console.error('Toggle role error:', error);
    }
  }, [role, setRole]);

  const handleTipPress = useCallback((title: string) => {
    Vibration.vibrate(15);
  }, []);

  const toggleChat = useCallback(() => {
    console.log('toggleChat called, current state:', isChatOpen);
    setIsChatOpen(prev => {
      const newState = !prev;
      console.log('Setting isChatOpen to:', newState);
      return newState;
    });
    Vibration.vibrate(20);
  }, [isChatOpen]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
          <View style={[styles.loadingIcon, { backgroundColor: theme.accentA, shadowColor: theme.shadow }]}>
            <Text style={styles.loadingText}>WC</Text>
          </View>
          <Text style={[styles.loadingLabel, { color: theme.text }]}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <StatusBar
        barStyle={actualTheme === 'dark' ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />
      <FloatingParticles theme={theme} />
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>WorkConnect</Text>
        <Text style={[styles.headerSub, { color: theme.textSub }]}>
          Welcome, {name || user.email} (<Text style={{ fontWeight: '700' }}>{role}</Text> Dashboard)
        </Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <RoleSwitcher role={role} onToggle={toggleRole} theme={theme} />
        <View style={styles.actionContainer}>
          {role === 'Seller' ? (
            <ActionCard
              title="Create/Edit Gig"
              subtitle="Manage your service offerings and attract more clients"
              gradient={theme.gradient}
              onPress={() => router.push('/createGig')}
              theme={theme}
              delay={0}
            />
          ) : (
            <ActionCard
              title="Search for workers"
              subtitle="Find skilled professionals perfect for your projects"
              gradient={[theme.accentB, theme.accentA] as const}
              onPress={() => router.push('/search')}
              theme={theme}
              delay={0}
            />
          )}
        </View>
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.quickActionsTitle, { color: theme.text }]}>Quick Actions</Text>
          <ActionCard
            title="Sign Out"
            subtitle="Securely log out of your account"
            gradient={[theme.accentE, theme.accentA] as const}
            onPress={handleSignOut}
            theme={theme}
            delay={400}
          />
          <ActionCard
            title="Chat with our AI-powered assistant"
            subtitle="Get all your questions answered by AI"
            gradient={[theme.accentC, theme.accentB] as const}
            onPress={toggleChat}
            theme={theme}
            delay={500}
          />
        </View>
        <View style={styles.tipsSection}>
          <Text style={[styles.tipsTitle, { color: theme.text }]}>
            {role === 'Seller' ? 'Seller Tips' : 'Buyer Tips'}
          </Text>
          <View style={styles.tipsGrid}>
            {(role === 'Seller' ? sellerTips : buyerTips).map((tip, index) => (
              <TipCard
                key={index}
                title={tip.title}
                description={tip.description}
                color={tip.color}
                onPress={() => handleTipPress(tip.title)}
                delay={index * 100}
              />
            ))}
          </View>
        </View>
      </ScrollView>
      <SafeAreaView edges={['bottom']}>
        <BottomNavigation router={router} theme={theme} />
      </SafeAreaView>
      {isChatOpen && <ChatbotPopup theme={theme} onClose={toggleChat} />}
    </SafeAreaView>
  );
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
    fontSize: 18,
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
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  roleSwitcher: {
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 24,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  roleSwitcherInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleSwitcherText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionContainer: {
    gap: 16,
    marginBottom: 30,
  },
  actionCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    height: 160,
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  actionSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActionsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipsGrid: {
    gap: 12,
  },
  tipCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  tipTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  tipDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
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
});
