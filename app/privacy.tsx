/**
 * Privacy Policy Screen
 * Displays app privacy policy
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../src/utils/theme';

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background.dark1, COLORS.background.dark2]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Privacy Policy</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.lastUpdated}>Last Updated: November 19, 2025</Text>

            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.paragraph}>
              Welcome to Blocktopia. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our mobile application.
            </Text>

            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            <Text style={styles.paragraph}>
              We collect information that you provide directly to us, including:
            </Text>
            <Text style={styles.bulletPoint}>• Account information (username, email)</Text>
            <Text style={styles.bulletPoint}>• Game progress and statistics</Text>
            <Text style={styles.bulletPoint}>• Purchase history</Text>
            <Text style={styles.bulletPoint}>• Device information</Text>

            <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              We use the information we collect to:
            </Text>
            <Text style={styles.bulletPoint}>• Provide and maintain our services</Text>
            <Text style={styles.bulletPoint}>• Improve user experience</Text>
            <Text style={styles.bulletPoint}>• Process transactions</Text>
            <Text style={styles.bulletPoint}>• Send important updates</Text>
            <Text style={styles.bulletPoint}>• Analyze usage patterns</Text>

            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.paragraph}>
              We implement appropriate security measures to protect your personal information.
              However, no method of transmission over the internet is 100% secure.
            </Text>

            <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
            <Text style={styles.paragraph}>
              We use third-party services for analytics, advertising, and in-app purchases:
            </Text>
            <Text style={styles.bulletPoint}>• Google AdMob (advertising)</Text>
            <Text style={styles.bulletPoint}>• RevenueCat (subscriptions)</Text>
            <Text style={styles.bulletPoint}>• Supabase (backend services)</Text>
            <Text style={styles.bulletPoint}>• Google Sign-In</Text>
            <Text style={styles.bulletPoint}>• Apple Sign-In</Text>

            <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
            <Text style={styles.paragraph}>
              Our service is not directed to children under 13. We do not knowingly collect
              personal information from children under 13.
            </Text>

            <Text style={styles.sectionTitle}>7. Your Rights</Text>
            <Text style={styles.paragraph}>
              You have the right to:
            </Text>
            <Text style={styles.bulletPoint}>• Access your personal data</Text>
            <Text style={styles.bulletPoint}>• Request data deletion</Text>
            <Text style={styles.bulletPoint}>• Opt-out of marketing communications</Text>
            <Text style={styles.bulletPoint}>• Request data portability</Text>

            <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page.
            </Text>

            <Text style={styles.sectionTitle}>9. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have questions about this Privacy Policy, please contact us at:
            </Text>
            <Text style={styles.contactText}>privacy@blocktopia.app</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.dark1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary.cyan,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
  },
  lastUpdated: {
    fontSize: 14,
    color: COLORS.ui.textSecondary,
    marginBottom: SPACING.xl,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.ui.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  paragraph: {
    fontSize: 15,
    color: COLORS.ui.text,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  bulletPoint: {
    fontSize: 15,
    color: COLORS.ui.text,
    lineHeight: 24,
    marginLeft: SPACING.md,
    marginBottom: SPACING.xs,
  },
  contactText: {
    fontSize: 15,
    color: COLORS.primary.cyan,
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
});

