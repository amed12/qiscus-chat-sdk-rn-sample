import React, { useCallback, useEffect, useState } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Qiscus from '../qiscus';
import { IQAccount } from 'qiscus-sdk-javascript/types/model';
import { registerDeviceToken } from '../../index';
import { loadMultichannelSession } from '../services/sessionService';
import { APP_CONFIG } from '../config/appConfig';
import multichannelApi from '../qiscus/multichannelApi';

type RootStackParamList = {
  Login: undefined;
  Chat: { roomId: number };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginPage({ navigation }: Props) {
  const [userId, setUserId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Listen to login success event
  useEffect(() => {
    const handleLoginSuccess = (authData: IQAccount) => {
      console.log('[LoginScreen] Login success event received:', {
        userId: authData.id,
        name: authData.name,
      });
      reInitiateChat();
    };

    // Subscribe to login-success event
    Qiscus.qiscusEvents.on('login-success', handleLoginSuccess);

    // Cleanup listener on unmount
    return () => {
      Qiscus.qiscusEvents.off('login-success', handleLoginSuccess);
    };
  }, []);

  const reInitiateChat = async (): Promise<void> => {
    try {
      const result = await loadMultichannelSession(APP_CONFIG.qiscus.appId);
      if (!result) {
        console.log('[LoginScreen] No stored user data found');
        return;
      }

      const action = result.isResolved ? 'restored' : 'created';
      console.log(`[LoginScreen] Session ${action}, navigating to room:`, result.roomId);

      // Navigate to chat
      navigation.replace('Chat', { roomId: result.roomId });
    } catch (err) {
      const error = err as Error;
      console.error('[LoginScreen] Failed to restore session:', error.message);
      // If restoration fails, user needs to login again
    }
  };

  const onSubmit = useCallback(async (): Promise<void> => {
    if (!userId.trim()) {
      Alert.alert('Error', 'Please enter your User ID');
      return;
    }

    try {
      setIsLoading(true);
      const userIdTrimmed = userId.trim();
      const displayNameTrimmed = displayName.trim() || userIdTrimmed;

      console.log('[LoginScreen] Starting chat for:', userIdTrimmed);

      const result = await multichannelApi.initiateChat(
        APP_CONFIG.qiscus.appId,
        APP_CONFIG.qiscus.channelId,
        userIdTrimmed,
        displayNameTrimmed,
        null,
        null  
      );

      const action = result.restored ? 'Session restored' : 'New chat initiated';
      console.log(`[LoginScreen] ${action}:`, {
        roomId: result.roomId,
        userId: result.userId,
        restored: result.restored,
      });

      // Register device token for push notifications
      try {
        await registerDeviceToken();
        console.log('[LoginScreen] Device token registered');
      } catch (tokenError) {
        console.warn('[LoginScreen] Failed to register device token:', tokenError);
        // Don't block login if token registration fails
      }

      // Navigate to Chat screen
      navigation.replace('Chat', { roomId: result.roomId });
    } catch (err) {
      const error = err as Error;
      console.error('[LoginScreen] Failed to start chat:', error.message);
      Alert.alert('Error', error.message || 'Failed to start chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, displayName, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        <KeyboardAvoidingView enabled behavior="padding">
          <ImageBackground source={require('assets/bg-pattern.png')} style={styles.background}>
            <View style={styles.container}>
              <Image source={require('assets/logo.png')} style={styles.logo} />

              {/* Welcome Text */}
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Welcome to Customer Support</Text>
                <Text style={styles.welcomeSubtitle}>
                  We're here to help! Enter your details to start chatting with our support team.
                </Text>
              </View>

              <View style={styles.form}>
                {/* User ID Input */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email or User ID</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={setUserId}
                    value={userId}
                    placeholder="Enter your email or ID"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading}
                  />
                </View>

                {/* Display Name Input */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Your Name (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={setDisplayName}
                    value={displayName}
                    placeholder="Enter your name"
                    placeholderTextColor="#999"
                    editable={!isLoading}
                  />
                </View>

                {/* Submit Button */}
                <View style={styles.formGroup}>
                  <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={onSubmit}
                    disabled={isLoading}>
                    <Text style={styles.submitText}>
                      {isLoading ? 'Starting Chat...' : 'Start Chat'}
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
  welcomeContainer: {
    marginTop: 40,
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 40,
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
    fontSize: 11,
    textTransform: 'uppercase',
    color: '#979797',
  },
  input: {
    height: 35,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    color: '#333',
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
  infoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
