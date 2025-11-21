/**
 * Profile Edit Screen
 * Edit username, bio, and upload avatar
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { authService } from '../../src/services/auth/AuthService';
import { useMonetizationStore } from '../../src/store/monetizationStore';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/utils/theme';

export default function ProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const user = useMonetizationStore(state => state.user);
  const setUser = useMonetizationStore(state => state.setUser);
  
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user.avatar_url || null);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user.username) setUsername(user.username);
    if (user.bio) setBio(user.bio);
    if (user.avatar_url) setAvatarUri(user.avatar_url);
  }, [user]);

  /**
   * Lazy-load image picker module to avoid native module errors during import
   */
  const loadImagePicker = async () => {
    try {
      // Dynamic import to avoid loading if native module unavailable
      const ImagePicker = await import('expo-image-picker');
      return ImagePicker.default || ImagePicker;
    } catch (error: any) {
      // Handle missing native module gracefully
      if (error.message?.includes('native module') || error.message?.includes('ExponentImagePicker')) {
        Alert.alert(
          'Feature Unavailable',
          'Image picker is not available in this environment. Please rebuild the app with expo-image-picker configured.',
          [{ text: 'OK' }]
        );
        return null;
      }
      throw error;
    }
  };

  const requestImagePermission = async () => {
    if (Platform.OS === 'web') {
      return true;
    }

    try {
      const ImagePicker = await loadImagePicker();
      if (!ImagePicker) return false;

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your photos to upload an avatar.'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Error', 'Failed to request permissions');
      return false;
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) return;

    try {
      const ImagePicker = await loadImagePicker();
      if (!ImagePicker) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      // Check if it's a native module error
      if (error.message?.includes('native module') || error.message?.includes('ExponentImagePicker')) {
        Alert.alert(
          'Feature Unavailable',
          'Image picker is not available. Please rebuild the app with the image picker plugin configured.'
        );
      } else {
        Alert.alert('Error', 'Failed to pick image');
      }
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Camera is not available on web');
      return;
    }

    const hasPermission = await requestImagePermission();
    if (!hasPermission) return;

    try {
      const ImagePicker = await loadImagePicker();
      if (!ImagePicker) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      // Check if it's a native module error
      if (error.message?.includes('native module') || error.message?.includes('ExponentImagePicker')) {
        Alert.alert(
          'Feature Unavailable',
          'Camera is not available. Please rebuild the app with the image picker plugin configured.'
        );
      } else {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const uploadAvatar = async (uri: string) => {
    setUploadingAvatar(true);
    try {
      const result = await authService.uploadAvatar(uri);
      if (result.success && result.avatarUrl) {
        setAvatarUri(result.avatarUrl);
        // Reload profile from backend to get updated data
        const updatedProfile = await authService.getUserProfile();
        if (updatedProfile) {
          setUser(updatedProfile);
        }
        Alert.alert('Success', 'Avatar uploaded successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!username.trim() || username.length < 3) {
      Alert.alert('Validation Error', 'Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.updateProfile({
        username: username.trim(),
        bio: bio.trim() || null,
      });

      if (result.success) {
        // Reload profile from backend to get updated data
        const updatedProfile = await authService.getUserProfile();
        if (updatedProfile) {
          setUser(updatedProfile);
        }
        Alert.alert('Success', 'Profile updated successfully!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.background.dark1, COLORS.background.dark2, COLORS.background.dark3]}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 20) },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {username.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            {uploadingAvatar && (
              <View style={styles.avatarLoading}>
                <ActivityIndicator color="#FFF" />
              </View>
            )}
          </View>

          <View style={styles.avatarButtons}>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={pickImage}
              disabled={uploadingAvatar}
            >
              <Text style={styles.avatarButtonText}>Choose Photo</Text>
            </TouchableOpacity>
            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={styles.avatarButton}
                onPress={takePhoto}
                disabled={uploadingAvatar}
              >
                <Text style={styles.avatarButtonText}>Take Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              placeholderTextColor={COLORS.ui.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              maxLength={20}
            />
            <Text style={styles.hint}>3-20 characters</Text>
          </View>

          {/* Bio Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell us about yourself..."
              placeholderTextColor={COLORS.ui.textSecondary}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
              maxLength={150}
            />
            <Text style={styles.hint}>{bio.length}/150 characters</Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary.cyan, COLORS.primary.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.dark1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.xxl,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.lg,
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.primary.cyan,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.ui.text,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary.cyan,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary.purple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary.cyan,
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.ui.text,
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  avatarButton: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  avatarButtonText: {
    color: COLORS.primary.cyan,
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.h4,
    color: COLORS.ui.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.ui.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.ui.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: COLORS.ui.text,
    fontSize: 16,
    ...SHADOWS.small,
  },
  bioInput: {
    minHeight: 100,
    paddingTop: SPACING.md,
  },
  hint: {
    fontSize: 12,
    color: COLORS.ui.textSecondary,
    marginTop: SPACING.xs,
  },
  saveButton: {
    borderRadius: BORDER_RADIUS.xl,
    marginTop: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  saveButtonGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.ui.text,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

