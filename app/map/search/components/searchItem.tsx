import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const categoryData: Record<string, { icon: string; color: string }> = {
  '음식점': { icon: 'restaurant-outline', color: '#f59e0b' },
  '카페': { icon: 'cafe-outline', color: '#8b5cf6' },
  '편의점': { icon: 'storefront-outline', color: '#10b981' },
  '대형마트': { icon: 'cart-outline', color: '#3b82f6' },
  '주유소,충전소': { icon: 'flash-outline', color: '#ef4444' },
  '교통,수송': { icon: 'bus-outline', color: '#6366f1' },
  '은행': { icon: 'business-outline', color: '#0ea5e9' },
  '병원': { icon: 'medkit-outline', color: '#ec4899' },
  '약국': { icon: 'medkit-outline', color: '#14b8a6' },
  '학교': { icon: 'school-outline', color: '#f97316' },
  '학원': { icon: 'book-outline', color: '#f97316' },
  '관광명소': { icon: 'camera-outline', color: '#a855f7' },
  '숙박': { icon: 'bed-outline', color: '#06b6d4' },
  '문화시설': { icon: 'library-outline', color: '#8b5cf6' },
  '공공기관': { icon: 'business-outline', color: '#64748b' },
  '부동산': { icon: 'home-outline', color: '#78716c' },
  '서비스,산업': { icon: 'construct-outline', color: '#71717a' },
  '스포츠,레저': { icon: 'fitness-outline', color: '#22c55e' },
  '생활서비스': { icon: 'cut-outline', color: '#e879f9' },
  '쇼핑': { icon: 'bag-outline', color: '#f43f5e' },
  '가정,생활': { icon: 'home-outline', color: '#a3a3a3' },
  '자동차': { icon: 'car-outline', color: '#ef4444' },
  '교육,학문': { icon: 'school-outline', color: '#f97316' },
  '사회,공공기관': { icon: 'people-outline', color: '#64748b' },
  '종교': { icon: 'heart-outline', color: '#a78bfa' },
  '농업': { icon: 'leaf-outline', color: '#16a34a' },
};

// 매칭 안 되는 카테고리용 팔레트 — 해시 기반 자동 배정
const fallbackColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#0d9488', '#7c3aed', '#2563eb',
];

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getCategoryEntry = (categoryName: string) => {
  if (!categoryName) return null;
  const main = categoryName.split('>')[0].trim();
  return categoryData[main] || null;
};

const getCategoryIcon = (categoryName: string): string => {
  return getCategoryEntry(categoryName)?.icon || 'location-outline';
};

const getCategoryColor = (categoryName: string): string => {
  const entry = getCategoryEntry(categoryName);
  if (entry) return entry.color;
  if (!categoryName) return '#6b7280';
  return fallbackColors[hashString(categoryName) % fallbackColors.length];
};

const getLastCategory = (categoryName: string): string => {
  if (!categoryName) return '';
  const parts = categoryName.split('>');
  return parts[parts.length - 1].trim();
};

const formatDistance = (distance: string | undefined): string | null => {
  if (!distance) return null;
  const m = parseInt(distance, 10);
  if (isNaN(m)) return null;
  if (m >= 1000) return `${(m / 1000).toFixed(1)}km`;
  return `${m}m`;
};

interface SearchItemProps {
  data: { item: any; index: number };
  isSelected: boolean;
  onPress: (data: any) => void;
}

export default function SearchItem({ data, isSelected, onPress }: SearchItemProps) {
  const { item, index } = data;
  const category = getLastCategory(item['category_name']);
  const iconName = getCategoryIcon(item['category_name']);
  const categoryColor = getCategoryColor(item['category_name']);
  const roadAddress = item['road_address_name'];
  const jibunAddress = item['address_name'];
  const distance = formatDistance(item['distance']);

  return (
    <Pressable
      onPress={() => onPress(data)}
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.cardSelected,
        pressed && !isSelected && styles.cardPressed,
      ]}
    >
      {isSelected && <View style={styles.leftBar} />}

      <View style={[styles.iconCircle, { backgroundColor: isSelected ? '#339AF0' : categoryColor + '18' }]}>
        <Ionicons
          name={iconName as any}
          size={18}
          color={isSelected ? '#fff' : categoryColor}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.placeName, isSelected && { color: '#1a6fc4' }]} numberOfLines={1} ellipsizeMode="tail">
            {item['place_name']}
          </Text>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={18} color="#339AF0" />
          )}
        </View>

        <View style={styles.metaRow}>
          {category ? (
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '14', borderColor: categoryColor + '30' }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>{category}</Text>
            </View>
          ) : null}
          {distance ? (
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate-outline" size={11} color="#6b7280" />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
          ) : null}
        </View>

        {roadAddress ? (
          <View style={styles.addressRow}>
            <Ionicons name="map-outline" size={12} color="#9ca3af" style={{ marginTop: 1 }} />
            <Text style={styles.roadAddress} numberOfLines={1} ellipsizeMode="tail">
              {roadAddress}
            </Text>
          </View>
        ) : null}

        {jibunAddress && jibunAddress !== roadAddress ? (
          <View style={styles.addressRow}>
            <Ionicons name="pin-outline" size={12} color="#d1d5db" style={{ marginTop: 1 }} />
            <Text style={styles.jibunAddress} numberOfLines={1} ellipsizeMode="tail">
              {jibunAddress}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 8,
    marginBottom: 0,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    overflow: 'hidden',
  },
  cardSelected: {
    backgroundColor: '#EFF8FF',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  cardPressed: {
    backgroundColor: '#f9fafb',
  },
  leftBar: {
    width: 3,
    backgroundColor: '#339AF0',
    borderRadius: 2,
    marginRight: 10,
    marginVertical: -14,
    marginLeft: -14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  placeName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginBottom: 2,
  },
  roadAddress: {
    flex: 1,
    fontSize: 13,
    color: '#4b5563',
  },
  jibunAddress: {
    flex: 1,
    fontSize: 12,
    color: '#9ca3af',
  },
});
