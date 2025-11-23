/**
 * Phone Input Component for Turntopia Ecosystem
 * Follows Material Design and Apple HIG guidelines
 */

import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform 
} from 'react-native';
import { COLORS } from '../../../utils/theme';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  error?: string;
}

export function PhoneInput({ 
  value, 
  onChange, 
  countryCode, 
  onCountryCodeChange, 
  error 
}: PhoneInputProps) {
  
  // Format phone number as user types (US format)
  const handlePhoneChange = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    let formatted = cleaned;
    if (cleaned.length > 0) {
      if (cleaned.length <= 3) {
        formatted = cleaned;
      } else if (cleaned.length <= 6) {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      } else {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      }
    }
    
    onChange(formatted);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.inputRow}>
        <TouchableOpacity 
          style={styles.countryCodeButton}
          onPress={() => {
            // For now, only US is supported
            // Future: Open country code picker
          }}
        >
          <Text style={styles.countryCodeText}>{countryCode}</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={value}
          onChangeText={handlePhoneChange}
          placeholder="(555) 123-4567"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          keyboardType="phone-pad"
          autoFocus
          maxLength={14} // (XXX) XXX-XXXX format
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Text style={styles.hint}>
        We'll send you a code to verify your number
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    marginBottom: 20,
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#FFF', 
    marginBottom: 8,
  },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  countryCodeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  countryCodeText: { 
    fontSize: 16, 
    color: '#FFF', 
    fontWeight: '600',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFF',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary.cyan,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputError: {
    borderColor: '#FF4444',
    borderWidth: 2,
  },
  error: { 
    color: '#FF4444', 
    fontSize: 14, 
    marginTop: 8,
    marginLeft: 4,
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});

