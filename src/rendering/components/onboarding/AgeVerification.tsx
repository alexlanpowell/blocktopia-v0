/**
 * Age Verification Component for Turntopia Ecosystem
 * COPPA compliant (13+ years old required)
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Platform, 
  StyleSheet 
} from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker'; // TEMPORARILY DISABLED - needs rebuild
import { COLORS } from '../../../utils/theme';

interface AgeVerificationProps {
  onVerify: (birthdate: Date) => void;
  loading?: boolean;
}

export function AgeVerification({ onVerify, loading }: AgeVerificationProps) {
  const [date, setDate] = useState(new Date(2000, 0, 1)); // Default to Jan 1, 2000
  const [show, setShow] = useState(Platform.OS === 'ios');

  const calculateAge = (birthdate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    return age;
  };

  const handleConfirm = () => {
    const age = calculateAge(date);
    if (age < 13) {
      alert('You must be at least 13 years old to use Blocktopia.');
      return;
    }
    onVerify(date);
  };

  const formatDate = (date: Date): string => {
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Your Age</Text>
      <Text style={styles.subtitle}>Required for COPPA compliance (13+)</Text>
      
      {Platform.OS === 'ios' ? (
        // iOS shows picker inline
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={(_, selectedDate) => selectedDate && setDate(selectedDate)}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            textColor="#FFFFFF"
            themeVariant="dark"
            style={styles.picker}
          />
        </View>
      ) : (
        // Android shows button to open picker
        <>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShow(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
          </TouchableOpacity>
          {show && (
            <DateTimePicker
              value={date}
              mode="date"
              display="calendar"
              onChange={(_, selectedDate) => {
                setShow(false);
                if (selectedDate) setDate(selectedDate);
              }}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              themeVariant="dark"
            />
          )}
        </>
      )}
      
      <TouchableOpacity 
        style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
        onPress={handleConfirm}
        disabled={loading}
      >
        <Text style={styles.confirmButtonText}>
          {loading ? 'Verifying...' : 'Confirm & Continue'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.ageText}>
        You're {calculateAge(date)} years old
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    alignItems: 'center',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#FFF', 
    marginBottom: 8,
  },
  subtitle: { 
    fontSize: 14, 
    color: 'rgba(255, 255, 255, 0.6)', 
    marginBottom: 24,
    textAlign: 'center',
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  picker: { 
    width: '100%', 
    height: 200,
  },
  dateButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  confirmButton: {
    width: '100%',
    backgroundColor: COLORS.primary.cyan,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary.cyanGlow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: '700',
  },
  ageText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 8,
  },
});

