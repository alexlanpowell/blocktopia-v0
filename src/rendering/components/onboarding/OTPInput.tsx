/**
 * OTP Input Component for Turntopia Ecosystem
 * Auto-focus and paste support for seamless UX
 */

import React, { useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet,
  Platform 
} from 'react-native';
import { COLORS } from '../../../utils/theme';

interface OTPInputProps {
  value: string;
  onChange: (otp: string) => void;
  length?: number;
}

export function OTPInput({ value, onChange, length = 6 }: OTPInputProps) {
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input on mount
    inputs.current[0]?.focus();
  }, []);

  const handleChangeText = (text: string, index: number) => {
    // Handle paste of full OTP code
    if (text.length === length) {
      onChange(text);
      inputs.current[length - 1]?.focus();
      return;
    }

    // Handle single character input
    const newValue = value.split('');
    newValue[index] = text.slice(-1); // Only take the last character
    onChange(newValue.join(''));

    // Auto-advance to next input
    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace - move to previous input
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputs.current[index] = ref)}
          style={[
            styles.input,
            value[index] && styles.inputFilled,
          ]}
          value={value[index] || ''}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          textAlign="center"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginVertical: 20,
    gap: 8,
  },
  input: {
    flex: 1,
    aspectRatio: 1, // Square boxes
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    borderWidth: 2,
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
  inputFilled: {
    borderColor: COLORS.primary.cyan,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
});

