import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { clearMultichannelSession, loadMultichannelSession } from '../services/sessionService';
import APP_CONFIG from '../config/appConfig';
import type { MultichannelSession } from '../types/qiscus.types';

type RootStackParamList = {
  Login: undefined;
  ResumeSession: undefined;
  Chat: { roomId: number };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ResumeSession'>;

export function ResumeSessionScreen({ navigation }: Props) {
  const [session, setSession] = useState<MultichannelSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSessionData();
  }, []);

  const loadSessionData = async () => {
    try {
      const storedSession = await loadMultichannelSession(APP_CONFIG.qiscus.appId);
      if (storedSession) {
        setSession(storedSession);
      } else {
        // No session found, redirect to login
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('[ResumeSession] Error loading session data:', error);
      navigation.replace('Login');
    }
  };

  const handleEnterRoom = async () => {
    if (!session) {
      console.log('[ResumeSession] No session available');
      navigation.replace('Login');
      return;
    }

    try {
      setIsLoading(true);
      const action = !session.isResolved ? 'restored' : 'created';
      console.log(`[ResumeSession] Session ${action}, navigating to room:`, session.roomId);
      navigation.replace('Chat', { roomId: session.roomId });
    } catch (error) {
      console.error('[ResumeSession] Failed to navigate to chat:', error);
      navigation.replace('Login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewChat = () => {
    // Clear session and go to login
    handleLogout();
  };

  const handleLogout = async () => {
    try {
      await clearMultichannelSession();

      console.log('[ResumeSession] Logged out successfully');
      
      // Navigate to Login
      navigation.replace('Login');
    } catch (error) {
      console.error('[ResumeSession] Logout error:', error);
      navigation.replace('Login');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={require('assets/bg-pattern.png')} style={styles.background}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <Image source={require('assets/logo.png')} style={styles.logo} />

            {/* Welcome Back Section */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Welcome Back! 👋</Text>
              <Text style={styles.welcomeSubtitle}>
                You're already logged in as
              </Text>
              <Text style={styles.userEmail}>{session?.userId || 'User'}</Text>
            </View>

            {/* Session Info */}
            <View style={styles.sessionInfo}>
              <View style={styles.infoCard}>
                <Text style={styles.infoIcon}>💬</Text>
                <Text style={styles.infoTitle}>Active Session Found</Text>
                <Text style={styles.infoDescription}>
                  You have an existing chat session. Continue where you left off!
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {/* Continue to Room Button */}
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleEnterRoom}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>
                      Continue to Chat Room
                    </Text>
                    <Text style={styles.buttonSubtext}>→</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Start New Chat Button */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleStartNewChat}
                disabled={isLoading}>
                <Text style={styles.secondaryButtonText}>
                  Start New Chat
                </Text>
              </TouchableOpacity>

              {/* Logout Link */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={isLoading}>
                <Text style={styles.logoutText}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: Dimensions.get('window').height,
  },
  container: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 30,
    width: '100%',
  },
  logo: {
    marginTop: 40,
    resizeMode: 'contain',
    width: '70%',
    marginBottom: 20,
  },
  welcomeContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9aca62',
    textAlign: 'center',
  },
  sessionInfo: {
    marginTop: 30,
    width: '100%',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 40,
    width: '100%',
    gap: 12,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#9aca62',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#9aca62',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonSubtext: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9aca62',
  },
  secondaryButtonText: {
    color: '#9aca62',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  logoutButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#999',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
