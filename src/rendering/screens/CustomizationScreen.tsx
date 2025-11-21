/**
 * Customization Screen - Browse and purchase cosmetics
 * Beautiful UI following Apple HIG and Material Design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../utils/theme';
import { useGems, useIsPremium, useOwnedCosmetics, useActiveCosmetics, CosmeticType } from '../../store/monetizationStore';
import { cosmeticService } from '../../services/cosmetics/CosmeticService';
import { getCosmeticsByType, getRarityColor, getRarityLabel, type Cosmetic } from '../../services/cosmetics/CosmeticCatalog';

interface CustomizationScreenProps {
  visible: boolean;
  onClose: () => void;
}

export function CustomizationScreen({ visible, onClose }: CustomizationScreenProps) {
  const gems = useGems();
  const isPremium = useIsPremium();
  const ownedCosmetics = useOwnedCosmetics();
  const activeCosmetics = useActiveCosmetics();
  const [selectedTab, setSelectedTab] = useState<CosmeticType>(CosmeticType.BLOCK_SKIN);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const tabs = [
    { type: CosmeticType.BLOCK_SKIN, label: '🎨 Skins', emoji: '🎨' },
    { type: CosmeticType.BOARD_THEME, label: '🌈 Themes', emoji: '🌈' },
    { type: CosmeticType.PARTICLE_EFFECT, label: '✨ Effects', emoji: '✨' },
  ];

  const cosmetics = getCosmeticsByType(selectedTab);

  const handlePurchase = async (cosmetic: Cosmetic) => {
    if (purchasing) return;

    const { canPurchase, reason } = cosmeticService.canPurchase(cosmetic.id);
    if (!canPurchase) {
      Alert.alert('Cannot Purchase', reason || 'Unable to purchase this cosmetic');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      setPurchasing(cosmetic.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const AudioManager = (await import('../../services/audio/AudioManager')).default;
      const { SoundEffect } = await import('../../services/audio/AudioManager');
      AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP);

      const result = await cosmeticService.purchaseCosmetic(cosmetic.id);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        AudioManager.playSoundEffect(SoundEffect.PURCHASE_SUCCESS);
        Alert.alert('Success!', `${cosmetic.name} unlocked!`);
        
        // Auto-equip
        await cosmeticService.equipCosmetic(cosmetic.id);
      } else {
        const errorMessages: Record<string, string> = {
          'insufficient_gems': `You need ${cosmetic.price} gems`,
          'requires_premium': 'This requires Premium membership',
          'already_owned': 'You already own this',
        };
        Alert.alert('Purchase Failed', errorMessages[result.error || 'unknown'] || 'Unable to complete purchase');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setPurchasing(null);
    }
  };

  const handleEquip = async (cosmetic: Cosmetic) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const AudioManager = (await import('../../services/audio/AudioManager')).default;
    const { SoundEffect } = await import('../../services/audio/AudioManager');
    AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP);
    
    const result = await cosmeticService.equipCosmetic(cosmetic.id);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      AudioManager.playSoundEffect(SoundEffect.BUTTON_TAP);
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
              accessibilityLabel="Close customization"
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>🎨 Customization</Text>
            
            <View style={styles.gemsDisplay}>
              <Text style={styles.gemIcon}>💎</Text>
              <Text style={styles.gemsText}>{gems}</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.type}
                style={[
                  styles.tab,
                  selectedTab === tab.type && styles.activeTab,
                ]}
                onPress={() => {
                  setSelectedTab(tab.type);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[
                  styles.tabText,
                  selectedTab === tab.type && styles.activeTabText,
                ]}>
                  {tab.emoji}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>

        {/* Cosmetics Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {cosmetics.map((cosmetic) => {
              const isOwned = ownedCosmetics.includes(cosmetic.id);
              const isActive = activeCosmetics[cosmetic.type] === cosmetic.id;
              const isPurchasing = purchasing === cosmetic.id;

              return (
                <CosmeticCard
                  key={cosmetic.id}
                  cosmetic={cosmetic}
                  isOwned={isOwned}
                  isActive={isActive}
                  isPurchasing={isPurchasing}
                  onPurchase={() => handlePurchase(cosmetic)}
                  onEquip={() => handleEquip(cosmetic)}
                />
              );
            })}
          </View>
        </ScrollView>

        {/* Premium Prompt */}
        {!isPremium && (
          <View style={styles.premiumPrompt}>
            <Text style={styles.premiumPromptText}>
              👑 Unlock exclusive cosmetics with Premium
            </Text>
          </View>
        )}
      </LinearGradient>
    </Modal>
  );
}

interface CosmeticCardProps {
  cosmetic: Cosmetic;
  isOwned: boolean;
  isActive: boolean;
  isPurchasing: boolean;
  onPurchase: () => void;
  onEquip: () => void;
}

function CosmeticCard({
  cosmetic,
  isOwned,
  isActive,
  isPurchasing,
  onPurchase,
  onEquip,
}: CosmeticCardProps) {
  const rarityColor = getRarityColor(cosmetic.rarity);

  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.activeCard]}
      onPress={isOwned ? onEquip : onPurchase}
      disabled={isPurchasing}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[`${rarityColor}20`, `${rarityColor}05`]}
        style={styles.cardGradient}
      >
        {/* Preview */}
        <View style={styles.preview}>
          <Text style={styles.previewEmoji}>{cosmetic.preview}</Text>
        </View>

        {/* Name */}
        <Text style={styles.cosmeticName} numberOfLines={1}>
          {cosmetic.name}
        </Text>

        {/* Rarity Badge */}
        <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
          <Text style={styles.rarityText}>{getRarityLabel(cosmetic.rarity)}</Text>
        </View>

        {/* Status / Action */}
        {isActive ? (
          <View style={styles.equippedBadge}>
            <Text style={styles.equippedText}>✓ Equipped</Text>
          </View>
        ) : isOwned ? (
          <View style={styles.equipButton}>
            <Text style={styles.equipButtonText}>Tap to Equip</Text>
          </View>
        ) : (
          <View style={styles.priceContainer}>
            {cosmetic.isPremium && (
              <Text style={styles.premiumIcon}>👑</Text>
            )}
            <Text style={styles.priceText}>💎 {cosmetic.price}</Text>
          </View>
        )}
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
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ui.cardBorder,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.ui.cardBackground,
    borderRadius: BORDER_RADIUS.md,
  },
  activeTab: {
    backgroundColor: COLORS.primary.cyan + '30',
  },
  tabText: {
    fontSize: 24,
  },
  activeTabText: {
    transform: [{ scale: 1.1 }],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  card: {
    width: '48%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  activeCard: {
    ...SHADOWS.glow,
  },
  cardGradient: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    minHeight: 160,
  },
  preview: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  previewEmoji: {
    fontSize: 48,
  },
  cosmeticName: {
    fontSize: 14,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.ui.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  rarityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.ui.text,
    textTransform: 'uppercase',
  },
  equippedBadge: {
    backgroundColor: COLORS.accent.success + '30',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  equippedText: {
    fontSize: 12,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.accent.success,
  },
  equipButton: {
    backgroundColor: COLORS.primary.cyan + '20',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  equipButtonText: {
    fontSize: 12,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.primary.cyan,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent.gold + '20',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  premiumIcon: {
    fontSize: 12,
  },
  priceText: {
    fontSize: 13,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.accent.gold,
  },
  premiumPrompt: {
    backgroundColor: COLORS.accent.gold + '20',
    padding: SPACING.md,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.accent.gold,
  },
  premiumPromptText: {
    fontSize: 14,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.accent.gold,
    textAlign: 'center',
  },
});

