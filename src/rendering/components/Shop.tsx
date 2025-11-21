/**
 * Shop Component - IAP Store for Gems and Premium
 * Beautiful UI following Apple HIG and Material Design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../utils/theme';
import { useGems, useIsPremium, useUser, usePowerUps, PowerUpType } from '../../store/monetizationStore';
import { purchaseManager } from '../../services/iap/PurchaseManager';
import { getGemPacks, getTotalGems, getSubscriptions, type Product } from '../../services/iap/ProductCatalog';
import { powerUpService, POWER_UPS } from '../../services/powerups/PowerUpService';
import { premiumService, PremiumBenefit } from '../../services/subscription/PremiumService';

interface ShopProps {
  visible: boolean;
  onClose: () => void;
}

export function Shop({ visible, onClose }: ShopProps) {
  const gems = useGems();
  const isPremium = useIsPremium();
  const user = useUser();
  const powerUps = usePowerUps();
  const [loading, setLoading] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [purchasingPowerUp, setPurchasingPowerUp] = useState<PowerUpType | null>(null);

  const handlePurchase = async (product: Product) => {
    if (loading || !user.isAuthenticated) return;

    try {
      setLoading(true);
      setPurchasingId(product.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const AudioManager = (await import('../../services/audio/AudioManager')).default;
      const { SoundEffect } = await import('../../services/audio/AudioManager');
      AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP);

      const result = await purchaseManager.purchaseGemPack(product.id);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const AudioManager = (await import('../../services/audio/AudioManager')).default;
        const { SoundEffect } = await import('../../services/audio/AudioManager');
        AudioManager.playSoundEffect(SoundEffect.PURCHASE_SUCCESS);
      } else if (result.error !== 'cancelled') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
      setPurchasingId(null);
    }
  };

  const handleRestore = async () => {
    if (loading) return;

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const AudioManager = (await import('../../services/audio/AudioManager')).default;
      const { SoundEffect } = await import('../../services/audio/AudioManager');
      AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP);
      
      await purchaseManager.restorePurchases();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handlePowerUpPurchase = async (type: PowerUpType, quantity: number = 1) => {
    if (loading || !user.isAuthenticated) return;

    try {
      setLoading(true);
      setPurchasingPowerUp(type);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const AudioManager = (await import('../../services/audio/AudioManager')).default;
      const { SoundEffect } = await import('../../services/audio/AudioManager');
      AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP);

      const result = await powerUpService.purchaseWithGems(type, quantity);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const AudioManager = (await import('../../services/audio/AudioManager')).default;
        const { SoundEffect } = await import('../../services/audio/AudioManager');
        AudioManager.playSoundEffect(SoundEffect.PURCHASE_SUCCESS);
        Alert.alert('Success!', `Purchased ${quantity}x ${POWER_UPS[type].name}!`);
      } else {
        if (result.error === 'insufficient_gems') {
          Alert.alert('Not Enough Gems', 'You need more gems to purchase this power-up.');
        } else {
          Alert.alert('Purchase Failed', 'Unable to complete purchase. Please try again.');
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Power-up purchase error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
      setPurchasingPowerUp(null);
    }
  };

  const gemPacks = getGemPacks();
  const allPowerUps = powerUpService.getAllPowerUps();
  const subscriptions = getSubscriptions();
  
  const handleSubscriptionPurchase = async (productId: string) => {
    if (loading) return;
    
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await purchaseManager.purchaseSubscription(productId);
      
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Welcome to Premium!', 'Enjoy all premium benefits!');
      } else if (result.error !== 'cancelled') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={[COLORS.background.dark1, COLORS.background.dark2]}
        style={styles.container}
      >
        {/* Header */}
        <BlurView intensity={20} tint="dark" style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close shop"
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>💎 Gem Shop</Text>
            
            <View style={styles.gemsDisplay}>
              <Text style={styles.gemIcon}>💎</Text>
              <Text style={styles.gemsText}>{gems}</Text>
            </View>
          </View>
        </BlurView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Gem Packs Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gem Packs</Text>
            <Text style={styles.sectionSubtitle}>
              Purchase gems to unlock power-ups and cosmetics
            </Text>

            <View style={styles.gemPacksGrid}>
              {gemPacks.map((product) => (
                <GemPackCard
                  key={product.id}
                  product={product}
                  onPress={() => handlePurchase(product)}
                  loading={purchasingId === product.id}
                  disabled={loading || !user.isAuthenticated}
                />
              ))}
            </View>
          </View>

          {/* Power-Ups Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Power-Ups</Text>
            <Text style={styles.sectionSubtitle}>
              Use gems to purchase powerful abilities
            </Text>

            <View style={styles.powerUpsGrid}>
              {allPowerUps.map((powerUp) => (
                <PowerUpCard
                  key={powerUp.type}
                  powerUp={powerUp}
                  quantity={powerUps[powerUp.type]}
                  gems={gems}
                  onPress={() => handlePowerUpPurchase(powerUp.type, 1)}
                  loading={purchasingPowerUp === powerUp.type}
                  disabled={loading || !user.isAuthenticated}
                />
              ))}
            </View>
          </View>

          {/* Restore Purchases */}
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={loading}
          >
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>

          {/* Login Prompt for guests */}
          {!user.isAuthenticated && (
            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>
                Sign in to make purchases
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

interface GemPackCardProps {
  product: Product;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}

function GemPackCard({ product, onPress, loading, disabled }: GemPackCardProps) {
  const totalGems = getTotalGems(product);
  const hasBonus = (product.bonus || 0) > 0;

  return (
    <TouchableOpacity
      style={[styles.gemPackCard, disabled && styles.disabledCard]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={product.bestValue
          ? [COLORS.accent.gold + '20', COLORS.accent.warning + '20']
          : [COLORS.ui.cardBackground, COLORS.ui.cardBackground]}
        style={styles.cardGradient}
      >
        {product.bestValue && (
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.gemPackIcon}>💎</Text>
          <Text style={styles.gemPackName}>{product.name}</Text>
          
          <View style={styles.gemAmountContainer}>
            <Text style={styles.gemAmount}>{totalGems.toLocaleString()}</Text>
            <Text style={styles.gemsLabel}>gems</Text>
          </View>

          {hasBonus && (
            <View style={styles.bonusBadge}>
              <Text style={styles.bonusText}>+{product.bonus} bonus!</Text>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.primary.cyan} />
            </View>
          ) : (
            <View style={styles.priceButton}>
              <LinearGradient
                colors={[COLORS.primary.cyan, COLORS.primary.purple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.priceGradient}
              >
                <Text style={styles.priceText}>${product.price.toFixed(2)}</Text>
              </LinearGradient>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

interface PowerUpCardProps {
  powerUp: typeof POWER_UPS[PowerUpType];
  quantity: number;
  gems: number;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}

function PowerUpCard({ powerUp, quantity, gems, onPress, loading, disabled }: PowerUpCardProps) {
  const canAfford = gems >= powerUp.gemsPrice;
  const isDisabled = disabled || !canAfford;

  return (
    <TouchableOpacity
      style={[styles.powerUpCard, isDisabled && styles.disabledCard]}
      onPress={onPress}
      disabled={isDisabled || loading}
      activeOpacity={0.8}
      accessibilityLabel={`${powerUp.name}: ${powerUp.description}`}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={[`${powerUp.color}30`, `${powerUp.color}10`]}
        style={styles.powerUpCardGradient}
      >
        <View style={styles.powerUpCardContent}>
          {/* Icon and Quantity */}
          <View style={styles.powerUpIconContainer}>
            <Text style={styles.powerUpCardIcon}>{powerUp.icon}</Text>
            {quantity > 0 && (
              <View style={styles.powerUpQuantityBadge}>
                <Text style={styles.powerUpQuantityText}>×{quantity}</Text>
              </View>
            )}
          </View>

          {/* Name and Description */}
          <View style={styles.powerUpInfo}>
            <Text style={styles.powerUpCardName}>{powerUp.name}</Text>
            <Text style={styles.powerUpCardDescription} numberOfLines={2}>
              {powerUp.description}
            </Text>
          </View>

          {/* Price Button */}
          {loading ? (
            <View style={styles.powerUpLoadingContainer}>
              <ActivityIndicator color={powerUp.color} size="small" />
            </View>
          ) : (
            <View style={[styles.powerUpPriceButton, !canAfford && styles.powerUpPriceButtonDisabled]}>
              <Text style={[styles.powerUpPriceText, !canAfford && styles.powerUpPriceTextDisabled]}>
                💎 {powerUp.gemsPrice}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ui.cardBorder,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.ui.text,
  },
  headerTitle: {
    ...TYPOGRAPHY.title,
    flex: 1,
    textAlign: 'center',
  },
  gemsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ui.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
    minWidth: 80,
  },
  gemIcon: {
    fontSize: 16,
  },
  gemsText: {
    ...TYPOGRAPHY.score,
    fontSize: 16,
    color: COLORS.primary.cyan,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subtitle,
    fontSize: 24,
    marginBottom: SPACING.sm,
    color: COLORS.ui.text, // Explicitly set white color for visibility
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.ui.textSecondary,
    marginBottom: SPACING.lg,
  },
  gemPacksGrid: {
    gap: SPACING.md,
  },
  gemPackCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  disabledCard: {
    opacity: 0.5,
  },
  cardGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.xl,
  },
  bestValueBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.accent.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
    letterSpacing: 0.5,
  },
  cardContent: {
    alignItems: 'center',
  },
  gemPackIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  gemPackName: {
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.ui.text,
    marginBottom: SPACING.sm,
  },
  gemAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  gemAmount: {
    fontSize: 32,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.primary.cyan,
    marginRight: SPACING.xs,
  },
  gemsLabel: {
    fontSize: 16,
    color: COLORS.ui.textSecondary,
  },
  bonusBadge: {
    backgroundColor: COLORS.accent.success + '30',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  bonusText: {
    fontSize: 14,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.accent.success,
  },
  loadingContainer: {
    height: 48,
    justifyContent: 'center',
  },
  priceButton: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  priceGradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 20,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  restoreButtonText: {
    fontSize: 16,
    color: COLORS.primary.cyan,
    textDecorationLine: 'underline',
  },
  loginPrompt: {
    backgroundColor: COLORS.accent.warning + '20',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginPromptText: {
    fontSize: 16,
    color: COLORS.accent.warning,
    textAlign: 'center',
  },
  // Power-Up Card Styles
  powerUpsGrid: {
    gap: SPACING.md,
  },
  powerUpCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  powerUpCardGradient: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
  },
  powerUpCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  powerUpIconContainer: {
    position: 'relative',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ui.cardBackground,
    borderRadius: BORDER_RADIUS.md,
  },
  powerUpCardIcon: {
    fontSize: 32,
  },
  powerUpQuantityBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.accent.success,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  powerUpQuantityText: {
    fontSize: 11,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
  },
  powerUpInfo: {
    flex: 1,
  },
  powerUpCardName: {
    fontSize: 16,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.ui.text,
    marginBottom: 2,
  },
  powerUpCardDescription: {
    fontSize: 13,
    color: COLORS.ui.textSecondary,
    lineHeight: 18,
  },
  powerUpLoadingContainer: {
    width: 72,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerUpPriceButton: {
    backgroundColor: COLORS.primary.cyan + '30',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 72,
    alignItems: 'center',
  },
  powerUpPriceButtonDisabled: {
    backgroundColor: COLORS.ui.cardBorder,
  },
  powerUpPriceText: {
    fontSize: 15,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.primary.cyan,
  },
  powerUpPriceTextDisabled: {
    color: COLORS.ui.textSecondary,
  },
});

