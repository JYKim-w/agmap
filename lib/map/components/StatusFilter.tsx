// Design Ref: §5.4 — 상태 필터 칩 토글
// Plan SC: SC-2 — 상태 필터 토글
import React, { memo, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { STATUS_COLORS, STATUS_LABELS, type SurveyStatus } from '../types';

const FILTERS: SurveyStatus[] = ['NOT_SURVEYED', 'REJECTED', 'DRAFT', 'SUBMITTED', 'APPROVED'];

interface Props {
  activeFilters: Set<SurveyStatus>;
  onChange: (filters: Set<SurveyStatus>) => void;
}

export const StatusFilter = memo(({ activeFilters, onChange }: Props) => {
  const showAll = activeFilters.size === 0;

  const toggleAll = useCallback(() => onChange(new Set()), [onChange]);

  const toggleFilter = useCallback((status: SurveyStatus) => {
    const next = new Set(activeFilters);
    if (next.has(status)) next.delete(status);
    else next.add(status);
    onChange(next);
  }, [activeFilters, onChange]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Pressable
          style={[styles.chip, showAll && styles.chipActive]}
          onPress={toggleAll}
        >
          <Text style={[styles.chipText, showAll && styles.chipTextActive]}>전체</Text>
        </Pressable>
        {FILTERS.map((status) => {
          const active = activeFilters.has(status);
          return (
            <Pressable
              key={status}
              style={[styles.chip, active && { backgroundColor: STATUS_COLORS[status].fill }]}
              onPress={() => toggleFilter(status)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {STATUS_LABELS[status]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chipActive: {
    backgroundColor: '#339AF0',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  chipTextActive: {
    color: 'white',
  },
});
