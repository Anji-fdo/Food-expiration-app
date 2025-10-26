// styles/ProfileStyles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8fb' },
  content: { paddingHorizontal: 16, paddingBottom: 16, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#fff' },
  muted: { color: '#6b7280', marginTop: 8 },
  error: { color: '#b91c1c' },

  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  avatarImg: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fef3c7' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fde68a', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#7c2d12', fontWeight: '800', fontSize: 18 },
  name: { fontSize: 20, fontWeight: '800', color: '#111827' },

  outBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fee2e2', borderRadius: 10 },
  outBtnText: { color: '#991b1b', fontWeight: '700' },

  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { width: '48%', backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#eef2f7' },
  statLabel: { color: '#6b7280', fontSize: 12 },
  statValue: { color: '#111827', fontWeight: '700', marginTop: 4 },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipDanger: { backgroundColor: '#fee2e2', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#fecaca' },
  chipDangerText: { color: '#991b1b', fontWeight: '700' },

  btn: { backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  btnText: { color: '#fff', fontWeight: '700' },

  btnSm: { backgroundColor: '#fde68a', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  btnSmText: { color: '#7c2d12', fontWeight: '700' },
});

export default styles;
