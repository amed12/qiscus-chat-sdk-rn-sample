import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ImageBackground,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import * as Qiscus from 'qiscus';
import {registerDeviceToken} from '../../index';
import {multichannelApi} from '../qiscus/multichannelApi';
import {APP_CONFIG} from '../config/appConfig';
// Optional: Use auth store for state management
// import { useAuthStore } from '../store/authStore';

export function LoginPage(props) {
  const storage = useAsyncStorage('qiscus');
  const [userId, setUserId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Listen to login success event
  useEffect(() => {
    const handleLoginSuccess = (authData) => {
      console.log('[LoginScreen] Login success event received:', authData);
      reInitiateChat();
    };

    // Subscribe to login-success event
    Qiscus.qiscusEvents.on('login-success', handleLoginSuccess);

    // Cleanup listener on unmount
    return () => {
      Qiscus.qiscusEvents.off('login-success', handleLoginSuccess);
    };
  }, []);

  const reInitiateChat = async () => {
    try {
      // Get stored user data for fallback
      const storedData = await storage.getItem();
      if (!storedData) {
        console.log('[LoginScreen] No stored user data found');
        return;
      }

      const userData = JSON.parse(storedData);
      const storedUserId = userData.email || userData.username || 'guest-101';

      console.log('[LoginScreen] Restoring session for:', storedUserId);

      // Initiate chat with session restoration
      const result = await multichannelApi.initiateChat(
        APP_CONFIG.qiscus.appId,
        APP_CONFIG.qiscus.channelId,
        {
          userId: storedUserId,
          displayName: storedUserId,
          avatarUrl: null,
        }
      );

      const action = result.restored ? 'restored' : 'created';
      console.log(`[LoginScreen] Session ${action}, navigating to room:`, result.roomId);

      // Navigate to chat
      props.navigation.replace('Chat', { roomId: result.roomId });
    } catch (err) {
      console.error('[LoginScreen] Failed to restore session:', err.message);
      // If restoration fails, user needs to login again
    }
  };

  const onSubmit = useCallback(async () => {
    if (!userId.trim()) {
      alert('Please enter your User ID');
      return;
    }

    try {
      setIsLoading(true);
      const userIdTrimmed = userId.trim();
      const displayNameTrimmed = displayName.trim() || userIdTrimmed;
      
      console.log('[LoginScreen] Starting chat for:', userIdTrimmed);
      
      // Initiate chat (will check for existing session automatically)
      const result = await multichannelApi.initiateChat(
        APP_CONFIG.qiscus.appId,
        APP_CONFIG.qiscus.channelId,
        {
          userId: userIdTrimmed,
          displayName: displayNameTrimmed,
          avatarUrl: null,
        }
      );
      
      const action = result.restored ? 'Session restored' : 'New chat initiated';
      console.log(`[LoginScreen] ${action}:`, result.roomId);
      
      // Save user data for backward compatibility
      await storage.setItem(JSON.stringify({ 
        email: result.userId,
        username: result.userId 
      }));
      
      // Register device token for push notifications
      await registerDeviceToken();
      
      // Navigate to Chat screen
      props.navigation.replace('Chat', { roomId: result.roomId });
    } catch (err) {
      console.error('[LoginScreen] Failed to start chat:', err.message);
      alert(err.message || 'Failed to start chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, displayName, storage, props.navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <KeyboardAvoidingView enabled behavior="padding">
          <ImageBackground
            source={require('assets/bg-pattern.png')}
            style={styles.background}>
            <View style={styles.container}>
              <Image source={require('assets/logo.png')} style={styles.logo} />
              
              {/* Welcome Text */}
              <Text style={styles.welcomeTitle}>Welcome to Customer Support</Text>
              <Text style={styles.welcomeSubtitle}>
                Chat with our support team for any assistance
              </Text>
              
              <View style={styles.form}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Your Name or Email</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => setUserId(text)}
                    value={userId}
                    placeholder="e.g. john@example.com"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Display Name (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => setDisplayName(text)}
                    value={displayName}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="#999"
                    editable={!isLoading}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={onSubmit}
                    disabled={isLoading}>
                    <Text style={styles.submitText}>
                      {isLoading ? 'Connecting...' : 'Start Chat with Support'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* Info Text */}
                <Text style={styles.infoText}>
                  💬 You'll be connected to our customer support team
                </Text>
              </View>
            </View>
          </ImageBackground>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    minHeight: Dimensions.get('window').height,
  },
  background: {
    minHeight: Dimensions.get('window').height,
    width: '100%',
  },
  container: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 45,
    height: '100%',
    width: '100%',
  },
  logo: {
    marginTop: 60,
    resizeMode: 'contain',
    width: '80%',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 80,
    width: '100%',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 20,
  },
  label: {
    fontStyle: 'normal',
    fontWeight: '600',
    // lineHeight: 'normal',
    fontSize: 11,
    textTransform: 'uppercase',
    color: '#979797',
  },
  input: {
    height: 35,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  submitButton: {
    backgroundColor: '#9aca62',
    borderRadius: 8,
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 12,
    color: 'white',
    paddingVertical: 16,
    paddingHorizontal: 10,
    textTransform: 'uppercase',
    alignItems: 'center',
    shadowColor: '#9aca62',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginTop: 40,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
