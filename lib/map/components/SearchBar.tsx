// Plan SC: SC-1, SC-3 — 내 할당 주소 검색바 + 자동완성
import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  Text,
  View,
} from 'react-native';
import { useAssignmentStore } from '@/lib/store/assignments';
import { STATUS_COLORS, STATUS_LABELS } from '../types';
import type { ParcelStatusEntry } from '../types';

interface Props {
  statusMap: Map<string, ParcelStatusEntry>;
  onSelect: (pnu: string) => void;
}

export const SearchBar = memo(({ statusMap, onSelect }: Props) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const assignments = useAssignmentStore((s) => s.assignments);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return assignments
      .filter((a) => a.pnu && a.address?.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, assignments]);

  const handleSelect = useCallback((pnu: string) => {
    setQuery('');
    setIsFocused(false);
    Keyboard.dismiss();
    onSelect(pnu);
  }, [onSelect]);

  const showDropdown = isFocused && query.length > 0 && results.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="할당 주소 검색"
          placeholderTextColor="#adb5bd"
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable
            style={styles.clearBtn}
            onPress={() => { setQuery(''); setIsFocused(false); Keyboard.dismiss(); }}
            hitSlop={8}
          >
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        )}
      </View>

      {showDropdown && (
        <View style={styles.dropdown}>
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.assignmentId)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const entry = statusMap.get(item.pnu);
              const status = entry?.status ?? 'NOT_SURVEYED';
              const color = STATUS_COLORS[status];
              return (
                <Pressable
                  style={styles.item}
                  onPress={() => handleSelect(item.pnu)}
                >
                  <View style={[styles.dot, { backgroundColor: color.fill }]} />
                  <Text style={styles.itemAddress} numberOfLines={1}>{item.address}</Text>
                  <Text style={styles.itemStatus}>{STATUS_LABELS[status]}</Text>
                </Pressable>
              );
            }}
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 80,
    zIndex: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  clearBtn: {
    padding: 4,
  },
  clearText: {
    fontSize: 16,
    color: '#adb5bd',
  },
  dropdown: {
    marginTop: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f1f3f5',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  itemAddress: {
    flex: 1,
    fontSize: 13,
    color: '#343a40',
  },
  itemStatus: {
    fontSize: 12,
    color: '#868e96',
  },
});
