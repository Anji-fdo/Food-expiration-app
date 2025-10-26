// styles/RecipeStyles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { backgroundColor: '#f1f5f9' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  muted: { color: '#64748b', marginTop: 8 },

  // Form card
  searchCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  h1: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 12 },

  // Ingredient input + trailing button
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#0f172a',
  },
  searchBtn: {
    backgroundColor: '#facc15',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Chips
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipTxt: { color: '#3730a3', fontWeight: '700' },
  err: { color: '#b91c1c', marginTop: 8 },

  // Results header + link
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  link: { color: '#2563eb', fontWeight: '700' },

  // In-list search
  searchListRow: { marginHorizontal: 16, marginTop: 8, marginBottom: 4 },
  searchListInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#0f172a',
  },

  // Recipe cards
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  thumb: { width: 92, height: 92, borderRadius: 12, backgroundColor: '#e5e7eb' },
  name: { fontSize: 16, fontWeight: '800', color: '#111827' },
  meta: { color: '#6b7280', marginTop: 4 },
  badges: { flexDirection: 'row', gap: 8, marginTop: 8 },
  badge: { backgroundColor: '#fee2e2', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeTxt: { color: '#991b1b', fontWeight: '700' },
});

export default styles;
