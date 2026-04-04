// Design Ref: mockup/components/badges.html
import { StyleSheet, Text, View } from 'react-native';

type BadgeType =
  | 'unsurveyed' | 'in-progress' | 'completed' | 'rejected'
  | 'submitted' | 'reviewing' | 'approved'
  | 'HIGH' | 'MEDIUM' | 'LOW';

const BADGE_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  'unsurveyed':  { bg: '#fff5f5', color: '#fa5252', label: '미조사' },
  'in-progress': { bg: '#fff9db', color: '#f08c00', label: '진행중' },
  'completed':   { bg: '#ebfbee', color: '#2b8a3e', label: '완료' },
  'rejected':    { bg: '#fff4e6', color: '#e8590c', label: '반려' },
  'submitted':   { bg: '#e7f5ff', color: '#228be6', label: '제출완료' },
  'reviewing':   { bg: '#f3f0ff', color: '#7048e8', label: '검수중' },
  'approved':    { bg: '#ebfbee', color: '#2b8a3e', label: '승인' },
  'HIGH':        { bg: '#fff5f5', color: '#fa5252', label: 'HIGH' },
  'MEDIUM':      { bg: '#fff4e6', color: '#fd7e14', label: 'MEDIUM' },
  'LOW':         { bg: '#e7f5ff', color: '#339af0', label: 'LOW' },
};

export default function StatusBadge({ type, label }: { type: BadgeType; label?: string }) {
  const config = BADGE_CONFIG[type] ?? BADGE_CONFIG['unsurveyed'];
  return (
    <View style={[s.badge, { backgroundColor: config.bg }]}>
      <Text style={[s.text, { color: config.color }]}>{label ?? config.label}</Text>
    </View>
  );
}

/** resultStatus → BadgeType 변환 */
export function getStatusBadgeType(resultId: number | null, resultStatus: string | null): BadgeType {
  if (!resultId) return 'unsurveyed';
  switch (resultStatus) {
    case 'DRAFT': return 'in-progress';
    case 'SUBMITTED': return 'submitted';
    case 'REVIEWING': return 'reviewing';
    case 'APPROVED': return 'approved';
    case 'REJECTED': return 'rejected';
    default: return 'completed';
  }
}

const s = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
