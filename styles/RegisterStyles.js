// styles/RegisterStyles.js
import { StyleSheet } from 'react-native';

const colors = {
  card: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  primary: '#facc15',
  primaryDark: '#eab308',
};

export default StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f8fb' },
  content: { paddingHorizontal: 20, paddingVertical: 24 },

  header: { marginBottom: 12, alignItems: 'flex-start' },
  brand: { fontSize: 28, fontWeight: '800', color: colors.text },
  tagline: { marginTop: 4, color: '#9AA0A6', fontSize: 14 },

  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingRight: 8,
  },
  icon: { marginLeft: 12 },
  trailing: { paddingHorizontal: 6, paddingVertical: 8 },
  input: {
    flex: 1,
    color: colors.text,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  sectionHeader: { marginTop: 4 },
  sectionTitle: { color: colors.text, fontWeight: '800' },

  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: '48%' },

  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 6,
  },
  buttonText: { color: '#111827', fontSize: 16, fontWeight: '700' },

  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 6 },
  footerText: { color: colors.muted },
  footerLink: { color: colors.primaryDark, fontWeight: '700' },
});
