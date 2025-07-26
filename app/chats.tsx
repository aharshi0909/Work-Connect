import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Alert,
  useColorScheme,
  ListRenderItem,
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { auth, db } from './firebaseConfig'
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  getDocs,
  where,
  doc,
  getDoc,
  Timestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { useFocusEffect } from '@react-navigation/native'
import { v4 as uuidv4 } from 'uuid'

const lightTheme = {
  bg: '#f8fafc',
  cardBg: '#ffffff',
  text: '#1f2937',
  subText: '#6b7280',
  accent: '#4c51bf',
  accentSecondary: '#6366f1',
  inputBg: '#f0f0f0',
  userMessageBg: '#4c51bf',
  sellerMessageBg: '#f0f0f0',
  timestampColor: '#888',
  borderColor: '#ddd',
  contactBg: '#ffffff',
  activeContactBg: '#f3f4f6',
  shadow: 'rgba(0, 0, 0, 0.1)',
}

const darkTheme = {
  bg: '#111827',
  cardBg: '#1f2937',
  text: '#ffffff',
  subText: '#9ca3af',
  accent: '#6366f1',
  accentSecondary: '#8b5cf6',
  inputBg: '#374151',
  userMessageBg: '#6366f1',
  sellerMessageBg: '#374151',
  timestampColor: '#9ca3af',
  borderColor: '#374151',
  contactBg: '#1f2937',
  activeContactBg: '#374151',
  shadow: 'rgba(0, 0, 0, 0.4)',
}

type RootStackParamList = {
  ChatScreen: { 
    sellerId?: string 
    sellerName?: string
    selectedGig?: any
    isNewChat?: boolean
  }
}

type Props = NativeStackScreenProps<RootStackParamList, 'ChatScreen'>

interface Message {
  id: string
  text: string
  senderId: string
  createdAt: Date
}

interface Contact {
  id: string
  name: string
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount?: number
  chatId?: string
  isOnline?: boolean
}

type ViewMode = 'contacts' | 'chat'

export default function ChatScreen({ navigation, route }: Props) {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme
  
  const initialSellerId = route?.params?.sellerId ?? ''
  const initialSellerName = route?.params?.sellerName ?? ''
  const selectedGig = route?.params?.selectedGig
  const isNewChat = route?.params?.isNewChat ?? false

  const user = auth.currentUser
  const userId = user?.uid ?? ''
  console.log('Current userId:', userId)

  const [viewMode, setViewMode] = useState<ViewMode>(
    initialSellerId || (selectedGig && isNewChat) ? 'chat' : 'contacts'
  )
  const [selectedContact, setSelectedContact] = useState<Contact | null>(
    initialSellerId ? { id: initialSellerId, name: initialSellerName } : 
    (selectedGig && isNewChat) ? { id: selectedGig.id, name: selectedGig.name || 'Unknown' } : null
  )
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const flatListRef = useRef<FlatList<Message>>(null)

  const getChatId = useCallback(async (contactId: string): Promise<string> => {
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const sortedIds = [userId, contactId].sort()
    const chatId = sortedIds.join('_')
    
    try {
      const chatRoomDoc = await getDoc(doc(db, 'chatRooms', chatId))
      if (chatRoomDoc.exists()) {
        console.log('Found existing chatId:', chatId)
        return chatId
      }

      await setDoc(doc(db, 'chatRooms', chatId), { 
        participants: sortedIds,
        createdAt: Timestamp.now(),
        lastActivity: Timestamp.now(),
        agreements: { [userId]: false, [contactId]: false }
      })
      console.log('Created new chatId:', chatId)
      return chatId
    } catch (error) {
      console.error('Error in getChatId:', error)
      throw error
    }
  }, [userId])

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content')
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent', true)
        StatusBar.setTranslucent(true)
      }
    }, [colorScheme])
  )

  const loadContacts = useCallback(async () => {
    if (!userId) {
      console.log('No userId, skipping contact load')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const contactsSet = new Set<string>()
      const contactsMap = new Map<string, Contact>()

      const q = query(
        collection(db, 'chatRooms'), 
        where('participants', 'array-contains', userId)
      )
      
      const snapshot = await getDocs(q)
      snapshot.forEach(doc => {
        const data = doc.data()
        const participants = data.participants || []
        const otherUsers = participants.filter((uid: string) => uid !== userId)
        otherUsers.forEach((contactId: string) => {
          contactsSet.add(contactId)
        })
      })

      for (const contactId of contactsSet) {
        try {
          const userDoc = await getDoc(doc(db, 'users', contactId))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const contact: Contact = {
              id: contactId,
              name: userData.name || `User ${contactId.slice(0, 8)}`,
              isOnline: userData.isOnline || false,
            }

            const chatId = await getChatId(contactId)
            const lastMessageQuery = query(
              collection(db, 'chats', chatId, 'messages'),
              orderBy('createdAt', 'desc')
            )
            const lastMessageSnapshot = await getDocs(lastMessageQuery)
            if (!lastMessageSnapshot.empty) {
              const lastMessageData = lastMessageSnapshot.docs[0].data()
              contact.lastMessage = lastMessageData.text || ''
              contact.lastMessageTime = lastMessageData.createdAt?.toDate()
              contact.chatId = chatId
            }

            contactsMap.set(contactId, contact)
          } else {
            contactsMap.set(contactId, {
              id: contactId,
              name: `User ${contactId.slice(0, 8)}`,
              isOnline: false,
            })
          }
        } catch (userError) {
          console.log('Error fetching user:', userError)
        }
      }

      const contactsArray = Array.from(contactsMap.values()).sort((a, b) => {
        if (!a.lastMessageTime && !b.lastMessageTime) return 0
        if (!a.lastMessageTime) return 1
        if (!b.lastMessageTime) return -1
        return b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
      })

      console.log('Loaded contacts:', contactsArray.length)
      setContacts(contactsArray)
    } catch (error) {
      console.error('Error loading contacts:', error)
      Alert.alert('Error', 'Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }, [userId, getChatId])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  useEffect(() => {
    if (isNewChat && selectedGig && selectedGig.id) {
      const newContact: Contact = { id: selectedGig.id, name: selectedGig.name || 'Unknown' }
      setSelectedContact(newContact)
      setViewMode('chat')
      console.log('New chat initialized with contact:', newContact)
      setTimeout(() => {
        setInput(`Hi! I'm interested in your ${selectedGig.category} services. Let's discuss the details.`)
      }, 500)
    }
  }, [isNewChat, selectedGig])

  useEffect(() => {
    if (!selectedContact || viewMode !== 'chat' || !userId) {
      console.log('Skipping message load, conditions not met:', { selectedContact, viewMode, userId })
      return
    }

    setChatLoading(true)
    let unsubscribe: (() => void) | undefined

    const loadMessages = async () => {
      try {
        const chatId = await getChatId(selectedContact.id)
        const messagesRef = collection(db, 'chats', chatId, 'messages')
        const q = query(messagesRef, orderBy('createdAt', 'asc'))

        console.log('Starting snapshot for chatId:', chatId)
        unsubscribe = onSnapshot(q, (snapshot) => {
          const msgs: Message[] = []
          snapshot.forEach((doc) => {
            const data = doc.data()
            msgs.push({
              id: doc.id,
              text: data.text || 'No text',
              senderId: data.senderId || 'unknown',
              createdAt: data.createdAt?.toDate() || new Date(),
            })
          })
          console.log('Messages snapshot:', msgs.length, msgs)
          setMessages(msgs)
          setChatLoading(false)
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
        }, (error) => {
          console.error('Snapshot error:', error)
          Alert.alert('Error', `Failed to load messages: ${error.message}`)
          setChatLoading(false)
        })

        
        const chatRoomDoc = await getDoc(doc(db, 'chatRooms', chatId))
        if (chatRoomDoc.exists()) {
          const data = chatRoomDoc.data()
          setAgreed(data.agreements?.[userId] || false)
        }
      } catch (error) {
        console.error('Error loading messages:', error)
        setChatLoading(false)
      }
    }

    void loadMessages()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [selectedContact, viewMode, userId, getChatId])

  const selectContact = useCallback((contact: Contact) => {
    console.log('Selecting contact:', contact)
    setSelectedContact(contact)
    setViewMode('chat')
    setMessages([])
  }, [])

  const goBackToContacts = useCallback(() => {
    setViewMode('contacts')
    setSelectedContact(null)
    setMessages([])
    setInput('')
  }, [])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedContact || !userId) return

    try {
      const chatId = await getChatId(selectedContact.id)
      const messagesRef = collection(db, 'chats', chatId, 'messages')
      await addDoc(messagesRef, {
        text: input.trim(),
        senderId: userId,
        createdAt: Timestamp.now(),
      })
      console.log('Message sent to chatId:', chatId)
      setInput('')

      
      await updateDoc(doc(db, 'chatRooms', chatId), {
        lastActivity: Timestamp.now(),
      })
    } catch (error) {
      console.error('Send message error:', error)
      Alert.alert('Error', 'Failed to send message. Please try again.')
    }
  }, [input, selectedContact, userId, getChatId])

  const handleAgree = useCallback(async () => {
    if (!selectedContact || !userId || agreed) return

    try {
      const chatId = await getChatId(selectedContact.id)
      const chatRoomDocRef = doc(db, 'chatRooms', chatId)
      const chatRoomDoc = await getDoc(chatRoomDocRef)
      if (chatRoomDoc.exists()) {
        const data = chatRoomDoc.data()
        const newAgreements = { ...data.agreements, [userId]: true }
        await updateDoc(chatRoomDocRef, { agreements: newAgreements })

        const agreedCount = Object.values(newAgreements).filter((agreed: boolean) => agreed).length
        console.log('Agreed count updated:', agreedCount)

        if (agreedCount === data.participants.length) {
          
          const contractId = uuidv4()
          await setDoc(doc(db, 'contracts_buyers', contractId), {
            userId: userId,
            sellerId: selectedContact.id,
            gigId: selectedGig?.id,
            createdAt: Timestamp.now(),
            status: 'active',
          })
          await setDoc(doc(db, 'contracts_sellers', contractId), {
            userId: selectedContact.id,
            buyerId: userId,
            gigId: selectedGig?.id,
            createdAt: Timestamp.now(),
            status: 'active',
          })
          Alert.alert('Success', 'Contract created!')
          setAgreed(true)
        } else {
          setAgreed(true)
        }
      }
    } catch (error) {
      console.error('Error agreeing to contract:', error)
      Alert.alert('Error', 'Failed to agree to contract. Please try again.')
    }
  }, [selectedContact, userId, agreed, selectedGig, getChatId])

  const renderContact: ListRenderItem<Contact> = useCallback(({ item }) => (
    <Pressable
      style={[styles.contactItem, { backgroundColor: theme.contactBg, borderBottomColor: theme.borderColor }]}
      onPress={() => selectContact(item)}
    >
      <View style={styles.contactInfo}>
        <View style={styles.contactHeader}>
          <Text style={[styles.contactName, { color: theme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.isOnline && <View style={styles.onlineIndicator} />}
          {item.lastMessageTime && (
            <Text style={[styles.contactTime, { color: theme.subText }]}>
              {item.lastMessageTime.toLocaleDateString() === new Date().toLocaleDateString()
                ? item.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : item.lastMessageTime.toLocaleDateString()
              }
            </Text>
          )}
        </View>
        {item.lastMessage && (
          <Text style={[styles.contactLastMessage, { color: theme.subText }]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        )}
      </View>
      <Text style={[styles.chevron, { color: theme.subText }]}>›</Text>
    </Pressable>
  ), [theme, selectContact])

  const renderMessage: ListRenderItem<Message> = useCallback(({ item }) => {
    const isUser = item.senderId === userId
    return (
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isUser ? theme.userMessageBg : theme.sellerMessageBg,
            alignSelf: isUser ? 'flex-end' : 'flex-start',
            shadowColor: theme.shadow,
          },
        ]}
      >
        <Text style={{ color: isUser ? '#fff' : theme.text, fontSize: 16 }}>
          {item.text}
        </Text>
        <Text style={{ color: theme.timestampColor, fontSize: 10, marginTop: 4, alignSelf: 'flex-end' }}>
          {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    )
  }, [theme, userId])

  const keyExtractor = useCallback((item: Contact | Message) => item.id, [])

  const EmptyContactsComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No conversations yet</Text>
      <Text style={[styles.emptyText, { color: theme.subText }]}>
        Start a conversation by accepting a gig or contract
      </Text>
    </View>
  ), [theme])

  const EmptyMessagesComponent = useCallback(() => (
    <View style={styles.emptyMessagesContainer}>
      <Text style={[styles.emptyMessagesText, { color: theme.subText }]}>
        Start your conversation with {selectedContact?.name}
      </Text>
    </View>
  ), [theme, selectedContact])

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar 
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading chats...</Text>
        </SafeAreaView>
      </View>
    )
  }

  if (viewMode === 'contacts') {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar 
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <SafeAreaView style={styles.flex}>
          <View style={[styles.header, { backgroundColor: theme.cardBg, borderBottomColor: theme.borderColor, shadowColor: theme.shadow }]}>
            <Pressable onPress={() => navigation?.goBack?.()} hitSlop={8}>
              <Text style={[styles.backText, { color: theme.accent }]}>← Back</Text>
            </Pressable>
            <Text style={[styles.headerText, { color: theme.text }]}>Chats</Text>
            <Pressable onPress={loadContacts} hitSlop={8}>
              <Text style={[styles.refreshText, { color: theme.accent }]}>↻</Text>
            </Pressable>
          </View>

          <FlatList
            data={contacts}
            renderItem={renderContact}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.contactsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={EmptyContactsComponent}
          />
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={styles.flex}>
        <View style={[styles.header, { backgroundColor: theme.cardBg, borderBottomColor: theme.borderColor, shadowColor: theme.shadow }]}>
          <Pressable onPress={goBackToContacts} hitSlop={8}>
            <Text style={[styles.backText, { color: theme.accent }]}>← Chats</Text>
          </Pressable>
          <Text style={[styles.headerText, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">
            {selectedContact?.name || 'Unknown'}
          </Text>
          <View style={{ width: 48 }} />
        </View>

        {chatLoading ? (
          <View style={styles.chatLoadingContainer}>
            <ActivityIndicator size="small" color={theme.accent} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={EmptyMessagesComponent}
            extraData={messages}
          />
        )}

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.inputContainer, { backgroundColor: theme.cardBg, borderTopColor: theme.borderColor }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor={theme.subText}
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor }]}
              multiline
              maxLength={500}
              accessibilityLabel="Message input"
              accessibilityHint="Type your message here"
            />
            <Pressable
              onPress={sendMessage}
              style={[styles.sendButton, { opacity: input.trim() ? 1 : 0.5, backgroundColor: theme.accent }]}
              disabled={!input.trim()}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </Pressable>
          </View>
          {!agreed && (
            <Pressable
              style={[styles.agreeButton, { backgroundColor: theme.accentSecondary }]}
              onPress={handleAgree}
              accessibilityRole="button"
              accessibilityLabel="Agree to contract"
            >
              <Text style={styles.agreeButtonText}>Agree</Text>
            </Pressable>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  
  flex: {
    flex: 1,
  },
  
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  backText: {
    fontSize: 16,
    fontWeight: '600',
  },

  refreshText: {
    fontSize: 18,
    fontWeight: '600',
  },

  headerText: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },

  contactsList: {
    flexGrow: 1,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },

  contactInfo: {
    flex: 1,
  },

  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  contactName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },

  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginLeft: 8,
    marginRight: 8,
  },

  contactTime: {
    fontSize: 12,
    fontWeight: '500',
  },

  contactLastMessage: {
    fontSize: 14,
    fontWeight: '400',
  },

  chevron: {
    fontSize: 24,
    fontWeight: '300',
    marginLeft: 8,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  chatLoadingContainer: {
    padding: 20,
    alignItems: 'center',
  },

  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
  },

  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyMessagesText: {
    fontSize: 16,
    textAlign: 'center',
  },

  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    alignItems: 'center',
  },

  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    maxHeight: 120,
    borderWidth: 1,
  },

  sendButton: {
    marginLeft: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  agreeButton: {
    margin: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  agreeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
})