/**
 * Turntopia Sign-In Modal for Blocktopia
 * "Sign In to Earn Rewards" flow connecting to Unmap's Supabase
 * Implements: Phone → OTP → Age Verification → Account Linking
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PhoneInput } from './onboarding/PhoneInput';
import { OTPInput } from './onboarding/OTPInput';
import { AgeVerification } from './onboarding/AgeVerification';
import { COLORS } from '../../utils/theme';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Unmap's Supabase credentials (from app.config.js extra)
const UNMAP_SUPABASE_URL = Constants.expoConfig?.extra?.UNMAP_SUPABASE_URL || '';
const UNMAP_SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.UNMAP_SUPABASE_ANON_KEY || '';

// Lazy initialization - only create client when credentials are available
let unmapSupabase: any = null;
const getUnmapSupabase = () => {
  if (!UNMAP_SUPABASE_URL || !UNMAP_SUPABASE_ANON_KEY) {
    if (__DEV__) {
      console.error('[TurntopiaSignInModal] Unmap Supabase credentials not configured');
    }
    return null;
  }
  if (!unmapSupabase) {
    unmapSupabase = createClient(UNMAP_SUPABASE_URL, UNMAP_SUPABASE_ANON_KEY);
  }
  return unmapSupabase;
};

type Step = 'intro' | 'phone' | 'otp' | 'age' | 'linking' | 'success';

interface TurntopiaSignInModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (userId: string, tTokens: number) => void;
  currentDiamonds: number;
  gameStats: {
    highScore: number;
    totalGamesPlayed: number;
    totalLinesCleared: number;
  };
}

export function TurntopiaSignInModal({
  visible,
  onClose,
  onComplete,
  currentDiamonds,
  gameStats,
}: TurntopiaSignInModalProps) {
  const [step, setStep] = useState<Step>('intro');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const resetState = () => {
    setStep('intro');
    setPhone('');
    setOtp('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSendOTP = async () => {
    setError('');
    setLoading(true);

    const client = getUnmapSupabase();
    if (!client) {
      setError('Turntopia sign-in is not configured. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`;
      
      const { error: authError } = await client.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (authError) throw authError;

      setStep('otp');
    } catch (err: any) {
      console.error('OTP send error:', err);
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setLoading(true);

    const client = getUnmapSupabase();
    if (!client) {
      setError('Turntopia sign-in is not configured. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`;

      const { data, error: authError } = await client.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: 'sms',
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('No user returned from verification');

      // Check if age is already verified
      const { data: profile } = await client
        .from('profiles')
        .select('age_verified')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile?.age_verified) {
        // Age already verified, proceed directly to linking
        await linkAccount(data.user.id);
      } else {
        // Need age verification
        setStep('age');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleAgeVerification = async (birthdate: Date) => {
    setError('');
    setLoading(true);

    const client = getUnmapSupabase();
    if (!client) {
      setError('Turntopia sign-in is not configured. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      const { data: { user }, error: userError } = await client.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      // Update profile with age
      const { error: updateError } = await client
        .from('profiles')
        .update({ 
          birth_date: birthdate.toISOString().split('T')[0], 
          age_verified: true,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Proceed to account linking
      await linkAccount(user.id);
    } catch (err: any) {
      console.error('Age verification error:', err);
      setError(err.message || 'Failed to verify age');
      setLoading(false);
    }
  };

  const linkAccount = async (userId: string) => {
    setStep('linking');
    setLoading(true);

    const client = getUnmapSupabase();
    if (!client) {
      setError('Turntopia sign-in is not configured. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      // Get current session token
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error('No active session');

      // Call Edge Function to link Blocktopia account
      const response = await fetch(
        `${UNMAP_SUPABASE_URL}/functions/v1/link-blocktopia-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            userId,
            currentDiamonds,
            blocktopiaProfileData: {
              highScore: gameStats.highScore,
              totalGamesPlayed: gameStats.totalGamesPlayed,
              totalLinesCleared: gameStats.totalLinesCleared,
              originalAnonymousId: 'guest', // TODO: Track actual guest ID
            },
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to link account');
      }

      // Success!
      setStep('success');
      setTimeout(() => {
        onComplete(userId, result.data.converted.tTokens);
        handleClose();
      }, 2000);
    } catch (err: any) {
      console.error('Account linking error:', err);
      Alert.alert(
        'Linking Failed',
        err.message || 'Failed to link account. Please try again.',
        [
          { text: 'OK', onPress: () => setStep('intro') }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'intro':
        return (
          <View style={styles.content}>
            <Text style={styles.emoji}>💎✨</Text>
            <Text style={styles.title}>Sign In to Earn Rewards</Text>
            <Text style={styles.subtitle}>
              Link your Blocktopia progress to the Turntopia ecosystem
            </Text>

            <View style={styles.benefits}>
              <BenefitItem icon="💰" text={`Convert ${currentDiamonds} Diamonds to T Tokens`} />
              <BenefitItem icon="🌐" text="Use T Tokens across all Turntopia apps" />
              <BenefitItem icon="🏆" text="Access global leaderboards" />
              <BenefitItem icon="☁️" text="Save progress to the cloud" />
            </View>

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => setStep('phone')}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleClose}
            >
              <Text style={styles.secondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        );

      case 'phone':
        return (
          <View style={styles.content}>
            <Text style={styles.title}>Enter Your Phone Number</Text>
            <Text style={styles.subtitle}>
              We'll send you a code to verify your number
            </Text>

            <PhoneInput
              value={phone}
              onChange={setPhone}
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              error={error}
            />

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={loading || phone.length < 10}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Send Code</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'otp':
        return (
          <View style={styles.content}>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              Sent to {countryCode}{phone}
            </Text>

            <OTPInput value={otp} onChange={setOtp} />
            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading || otp.length < 6}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleSendOTP}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Resend Code</Text>
            </TouchableOpacity>
          </View>
        );

      case 'age':
        return (
          <ScrollView 
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
          >
            <AgeVerification onVerify={handleAgeVerification} loading={loading} />
          </ScrollView>
        );

      case 'linking':
        return (
          <View style={styles.content}>
            <ActivityIndicator size="large" color={COLORS.primary.cyan} />
            <Text style={styles.title}>Linking Your Account</Text>
            <Text style={styles.subtitle}>
              Converting {currentDiamonds} Diamonds to T Tokens...
            </Text>
          </View>
        );

      case 'success':
        return (
          <View style={styles.content}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.title}>Account Linked!</Text>
            <Text style={styles.subtitle}>
              {currentDiamonds} Diamonds → {currentDiamonds} T Tokens
            </Text>
            <Text style={styles.subtitle}>
              You can now earn and spend T Tokens across all Turntopia apps!
            </Text>
          </View>
        );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <LinearGradient
        colors={[COLORS.background.dark1, COLORS.background.dark2]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            {step !== 'linking' && step !== 'success' && (
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {renderContent()}
        </SafeAreaView>
      </LinearGradient>
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
  container: { 
    flex: 1,
  },
  safeArea: { 
    flex: 1,
  },
  header: { 
    padding: 20, 
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: { 
    fontSize: 28, 
    color: '#FFF',
    fontWeight: '300',
  },
  content: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#FFF', 
    marginBottom: 10, 
    textAlign: 'center',
  },
  subtitle: { 
    fontSize: 16, 
    color: 'rgba(255, 255, 255, 0.7)', 
    marginBottom: 30, 
    textAlign: 'center',
    lineHeight: 24,
  },
  benefits: {
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  primaryButton: {
    backgroundColor: COLORS.primary.cyan,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: { 
    color: 'rgba(255, 255, 255, 0.7)', 
    fontSize: 16, 
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  error: {
    color: '#FF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  successEmoji: {
    fontSize: 72,
    textAlign: 'center',
    marginBottom: 20,
  },
});

