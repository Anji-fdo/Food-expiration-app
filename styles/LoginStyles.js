import { StyleSheet } from 'react-native';

const colors = {
  bg: '#ffffff',
  card: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  primary: '#facc15',
  primaryDark: '#eab308',
};

export default StyleSheet.create({
  // Background image + overlay
  bg: { flex: 1 },
  // Slight dim/whitening so the white card pops even atop bright art
  bgImage: { opacity: 0.85 },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },

  // Container centers the form
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },

  headerCenter: { marginBottom: 30, alignItems: 'center' },
  brand: { fontSize: 28, fontWeight: '800', color: colors.text },
  tagline: { marginTop: 4, color: '#9AA0A6', fontSize: 14 },

  card: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 14,

    // Cross‑platform depth
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
  inputIcon: { marginLeft: 12 },
  trailingIcon: { paddingHorizontal: 6, paddingVertical: 8 },
  input: { flex: 1, color: colors.text, paddingVertical: 12, paddingHorizontal: 12 },

  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 2,
  },
  buttonText: { color: '#111827', fontSize: 16, fontWeight: '700' },

  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 6 },
  footerText: { color: colors.muted },
  footerLink: { color: colors.primaryDark, fontWeight: '700' },
});
