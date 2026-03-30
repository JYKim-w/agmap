import { StyleSheet } from 'react-native';

const STYLE = StyleSheet.create({
  header: {
    padding: 16,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassDark: {
    backgroundColor: 'rgba(26, 29, 30, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  view: {
    marginTop: 8,
    padding: 12,
  },
  box: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  input: {
    color: '#1a1d1e',
    fontSize: 16,
    paddingVertical: 12,
  },
  row: {
    width: '100%',
    paddingHorizontal: 20,
  },
  label: {
    width: '100%',
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 4,
  },
  postfix: {
    alignSelf: 'flex-end',
    color: '#adb5bd',
    fontSize: 12,
  },
  btn_primary: {
    borderRadius: 12,
    height: 52,
    backgroundColor: '#339af0', // primary.500
  },
  btn_text: {
    fontWeight: '700',
    fontSize: 16,
  },

  select: {
    width: '100%',
  },

  btn_inspect: {
    minWidth: 60,
    // maxWidth: 80,
    // width: 78,
    maxHeight: 50,
    overflow: 'hidden',
    //height: 30,
    borderRadius: 30,
    //padding:0
  },
  btn_bottom: {
    //  height:50
  },
});
export default STYLE;
