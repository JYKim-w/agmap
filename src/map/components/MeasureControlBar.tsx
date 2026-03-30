import React, { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { HStack, IconButton, Box } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import useMeasureStore from '@/store/measureStore';

interface MeasureControlBarProps {
  onAdd: () => void;
  onUndo: () => void;
  onReset: () => void;
  onFinish: () => void;
}

const MeasureControlBar = memo(({ onAdd, onUndo, onReset, onFinish }: MeasureControlBarProps) => {
  const measurePoints = useMeasureStore((s) => s.measurePoints);
  const canUndo = measurePoints.length > 0;
  const canFinish = measurePoints.length >= 3;

  const handleAdd = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onAdd();
  }, [onAdd]);

  return (
    <Box style={styles.container}>
      <HStack space={4} alignItems="center" justifyContent="center">
        <IconButton
          icon={<Ionicons name="refresh-outline" size={24} color="#4b5563" />}
          onPress={onReset}
          style={styles.actionButton}
          bg="white"
          _pressed={{ bg: 'gray.100' }}
        />
        
        <IconButton
          icon={<Ionicons name="arrow-undo-outline" size={24} color={canUndo ? "#4b5563" : "#d1d5db"} />}
          onPress={onUndo}
          isDisabled={!canUndo}
          style={styles.actionButton}
          bg="white"
          _pressed={{ bg: 'gray.100' }}
        />

        <IconButton
          icon={<Ionicons name="add" size={36} color="white" />}
          onPress={handleAdd}
          style={styles.addButton}
          bg="#339af0"
          _pressed={{ bg: '#228be6' }}
        />

        <IconButton
          icon={<Ionicons name="checkmark" size={26} color={canFinish ? "#339af0" : "#d1d5db"} />}
          onPress={onFinish}
          isDisabled={!canFinish}
          style={styles.actionButton}
          bg="white"
          _pressed={{ bg: 'gray.100' }}
        />
      </HStack>
    </Box>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    shadowColor: '#339af0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
});

export default MeasureControlBar;
