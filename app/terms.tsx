/**
 * Terms of Service Screen
 * Displays app terms of service
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

export default function TermsOfServiceScreen() {
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
          <Text style={styles.title}>Terms of Service</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.lastUpdated}>Last Updated: November 19, 2025</Text>

            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing and using Blocktopia, you accept and agree to be bound by the terms
              and provisions of this agreement. If you do not agree to these Terms of Service,
              please do not use the app.
            </Text>

            <Text style={styles.sectionTitle}>2. Use License</Text>
            <Text style={styles.paragraph}>
              We grant you a personal, non-exclusive, non-transferable license to use Blocktopia
              for your personal entertainment purposes, subject to these terms.
            </Text>

            <Text style={styles.sectionTitle}>3. User Accounts</Text>
            <Text style={styles.paragraph}>
              You are responsible for:
            </Text>
            <Text style={styles.bulletPoint}>• Maintaining account security</Text>
            <Text style={styles.bulletPoint}>• All activities under your account</Text>
            <Text style={styles.bulletPoint}>• Notifying us of unauthorized use</Text>
            <Text style={styles.bulletPoint}>• Providing accurate information</Text>

            <Text style={styles.sectionTitle}>4. Purchases and Payments</Text>
            <Text style={styles.paragraph}>
              In-app purchases are final and non-refundable except as required by law. Prices
              are subject to change without notice. Virtual currency has no real-world value.
            </Text>

            <Text style={styles.sectionTitle}>5. Prohibited Conduct</Text>
            <Text style={styles.paragraph}>
              You agree not to:
            </Text>
            <Text style={styles.bulletPoint}>• Cheat or exploit game mechanics</Text>
            <Text style={styles.bulletPoint}>• Reverse engineer the app</Text>
            <Text style={styles.bulletPoint}>• Use automated tools or bots</Text>
            <Text style={styles.bulletPoint}>• Attempt unauthorized access</Text>
            <Text style={styles.bulletPoint}>• Violate any applicable laws</Text>

            <Text style={styles.sectionTitle}>6. Premium Subscription</Text>
            <Text style={styles.paragraph}>
              Premium subscriptions auto-renew unless cancelled. You can manage your subscription
              through your device's app store settings. Cancellation takes effect at the end of
              the current billing period.
            </Text>

            <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
            <Text style={styles.paragraph}>
              All content, features, and functionality of Blocktopia are owned by us and protected
              by international copyright, trademark, and other intellectual property laws.
            </Text>

            <Text style={styles.sectionTitle}>8. Termination</Text>
            <Text style={styles.paragraph}>
              We may terminate or suspend your account immediately, without prior notice, for
              conduct that we believe violates these Terms of Service or is harmful to other
              users, us, or third parties.
            </Text>

            <Text style={styles.sectionTitle}>9. Disclaimers</Text>
            <Text style={styles.paragraph}>
              Blocktopia is provided "as is" without warranties of any kind. We do not guarantee
              that the app will be error-free, secure, or always available.
            </Text>

            <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              We shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use or inability to use the app.
            </Text>

            <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
            <Text style={styles.paragraph}>
              We reserve the right to modify these terms at any time. We will notify users of
              any material changes. Continued use after changes constitutes acceptance of the
              new terms.
            </Text>

            <Text style={styles.sectionTitle}>12. Governing Law</Text>
            <Text style={styles.paragraph}>
              These terms shall be governed by and construed in accordance with applicable laws,
              without regard to conflict of law principles.
            </Text>

            <Text style={styles.sectionTitle}>13. Contact Information</Text>
            <Text style={styles.paragraph}>
              For questions about these Terms of Service, please contact us at:
            </Text>
            <Text style={styles.contactText}>legal@blocktopia.app</Text>
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

