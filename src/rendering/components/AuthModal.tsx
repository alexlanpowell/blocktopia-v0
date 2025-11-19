/**
 * Authentication Modal
 * Handles user sign-in with Apple, Google, or Anonymous
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import { authService } from '../../services/auth/AuthService';
import { useMonetizationStore } from '../../store/monetizationStore';
import { COLORS } from '../../utils/theme';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  allowAnonymous?: boolean;
}

export function AuthModal({ 
  visible, 
  onClose, 
  onSuccess,
  allowAnonymous = true,
}: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const setUser = useMonetizationStore(state => state.setUser);
  const setAnonymous = useMonetizationStore(state => state.setAnonymous);
  const loadFromBackend = useMonetizationStore(state => state.loadFromBackend);

  const handleSignIn = async (provider: 'apple' | 'google' | 'anonymous') => {
    setLoading(true);
    setLoadingProvider(provider);

    try {
      let result;
      
      switch (provider) {
        case 'apple':
          result = await authService.signInWithApple();
          break;
        case 'google':
          result = await authService.signInWithGoogle();
          break;
        case 'anonymous':
          result = await authService.signInAnonymously();
          break;
      }

      if (result.success && result.user) {
        // Update store
        const profile = await authService.getUserProfile();
        setUser(profile);
        
        if (provider === 'anonymous') {
          setAnonymous(true);
        }

        // Load user data from backend
        await loadFromBackend();

        onSuccess();
        onClose();
      } else if (result.error) {
        if (result.error !== 'Sign-in cancelled') {
          Alert.alert('Sign-In Error', result.error);
        }
      }
    } catch (error: any) {
      console.error('Sign-in error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={[COLORS.background.dark1, COLORS.background.dark2]}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome to Blocktopia</Text>
              <Text style={styles.subtitle}>
                Sign in to save your progress and compete globally
              </Text>
            </View>

            {/* Benefits */}
            <View style={styles.benefits}>
              <BenefitItem 
                icon="✨"
                text="Save your progress across devices"
              />
              <BenefitItem 
                icon="🏆"
                text="Compete on global leaderboards"
              />
              <BenefitItem 
                icon="💎"
                text="Earn and keep your gems"
              />
              <BenefitItem 
                icon="🎨"
                text="Unlock exclusive themes"
              />
            </View>

            {/* Sign-In Buttons */}
            <View style={styles.buttons}>
              {/* Apple Sign-In */}
              {Platform.OS === 'ios' && !loading && (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                  cornerRadius={12}
                  style={styles.appleButton}
                  onPress={() => handleSignIn('apple')}
                />
              )}
              {Platform.OS === 'ios' && loading && loadingProvider === 'apple' && (
                <View style={[styles.appleButton, styles.button, { backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' }]}>
                  <ActivityIndicator color="#000" />
                </View>
              )}

              {/* Google Sign-In */}
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.googleButton,
                  loading && styles.buttonDisabled,
                ]}
                onPress={() => handleSignIn('google')}
                disabled={loading}
              >
                {loadingProvider === 'google' ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <View style={styles.googleIcon}>
                      <Text style={styles.googleIconText}>G</Text>
                    </View>
                    <Text style={styles.googleButtonText}>
                      Continue with Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Anonymous Sign-In */}
              {allowAnonymous && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.anonymousButton,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={() => handleSignIn('anonymous')}
                  disabled={loading}
                >
                  {loadingProvider === 'anonymous' ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.anonymousButtonText}>
                      Continue as Guest
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Terms */}
            <Text style={styles.terms}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>

            {/* Close Button */}
            {allowAnonymous && (
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.closeButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    padding: 32,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  benefits: {
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  buttons: {
    gap: 12,
  },
  appleButton: {
    height: 54,
  },
  button: {
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  googleButton: {
    backgroundColor: '#FFF',
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  anonymousButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  anonymousButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  terms: {
    marginTop: 24,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 18,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 15,
    fontWeight: '500',
  },
});

