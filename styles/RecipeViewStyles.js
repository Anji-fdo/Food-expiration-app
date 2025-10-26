// styles/RecipeViewStyles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { backgroundColor: '#f1f5f9' },

  heroWrap: { position: 'relative' },
  hero: { width: '100%', height: 220, backgroundColor: '#e5e7eb' },
  heroOverlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },

  header: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  backTxt: { color: '#3730a3', fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 6 },
  sub: { color: '#6b7280' },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 10 },
  body: { color: '#111827', lineHeight: 20 },
});

export default styles;
