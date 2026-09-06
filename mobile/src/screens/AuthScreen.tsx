import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { AFRICAN_COUNTRIES } from '../data/mockData';
import { Colors, gradientPink, gradientDark } from '../components/ui/Colors';
import { GradientButton } from '../components/ui/GradientButton';

const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export default function AuthScreen() {
  const { loginUser, signupUser, showToast } = useApp();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Login state
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup state
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('2000-01-15');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'woman' | 'man' | 'non-binary'>('woman');
  const [showMe, setShowMe] = useState<'men' | 'women' | 'everyone'>('men');
  const [country, setCountry] = useState('South Africa');
  const [city, setCity] = useState('Johannesburg');
  const [bio, setBio] = useState('');
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  const calcAge = calculateAge(dob);

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPass.trim()) {
      setLoginError('Please enter your email/phone and password.');
      return;
    }
    setLoginError('');
    setLoginLoading(true);
    const res = await loginUser(loginId.trim(), loginPass);
    setLoginLoading(false);
    if (!res.success) setLoginError(res.error || 'Login failed.');
    else showToast('Welcome back!', 'Successfully signed in.', 'success');
  };

  const handleDemoLogin = async (id: string, pass: string) => {
    setLoginId(id);
    setLoginPass(pass);
    setLoginLoading(true);
    const res = await loginUser(id, pass);
    setLoginLoading(false);
    if (!res.success) setLoginError(res.error || 'Demo login failed.');
    else showToast('Demo Account', `Signed in successfully.`, 'success');
  };

  const handleSignup = async () => {
    if (!name.trim()) { setSignupError('Full name is required.'); return; }
    if (!contact.trim()) { setSignupError('Contact number is required.'); return; }
    if (!dob) { setSignupError('Date of birth is required.'); return; }
    if (calcAge < 18) { setSignupError('You must be at least 18 years old.'); return; }
    if (!password.trim()) { setSignupError('Please create a password.'); return; }

    setSignupError('');
    setSignupLoading(true);
    const countryObj = AFRICAN_COUNTRIES.find((c) => c.name === country);
    const res = await signupUser({
      name: name.trim(),
      contactNumber: contact.trim(),
      phone: contact.trim(),
      email: email.trim() || undefined,
      dob,
      dateOfBirth: dob,
      age: calcAge,
      password,
      gender,
      showMe,
      country,
      countryCode: countryObj?.code || 'ZA',
      countryFlag: countryObj?.flag || '🇿🇦',
      city: city.trim() || 'Johannesburg',
      bio: bio.trim() || `Excited to meet genuine people across ${country}!`,
      datingGoal: 'Long-term relationship',
    });
    setSignupLoading(false);
    if (!res.success) setSignupError(res.error || 'Registration failed.');
    else showToast('Account Created!', 'Welcome to Fiffy\'s Match Making!', 'success');
  };

  return (
    <LinearGradient colors={['#1a0b2e', '#050208']} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoBox}>
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.appName}>Fiffy's Match Making</Text>
              <Text style={styles.tagline}>Connecting African & Diaspora singles with intention</Text>
            </View>

            {/* Tab switcher */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tabBtn, tab === 'login' && styles.tabActive]}
                onPress={() => { setTab('login'); setLoginError(''); }}
              >
                {tab === 'login' ? (
                  <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.tabGrad}>
                    <Text style={styles.tabTextActive}>Sign In</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabText}>Sign In</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, tab === 'signup' && styles.tabActive]}
                onPress={() => { setTab('signup'); setSignupError(''); }}
              >
                {tab === 'signup' ? (
                  <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.tabGrad}>
                    <Text style={styles.tabTextActive}>Create Account</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <View style={styles.form}>
                {!!loginError && <View style={styles.errorBox}><Text style={styles.errorText}>{loginError}</Text></View>}

                <Text style={styles.label}>Email or Contact Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. lerato.khumalo@fiffys.com"
                  placeholderTextColor={Colors.purpleDim}
                  value={loginId}
                  onChangeText={setLoginId}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.purpleDim}
                  value={loginPass}
                  onChangeText={setLoginPass}
                  secureTextEntry
                />

                <GradientButton
                  title={loginLoading ? '' : 'Sign In'}
                  loading={loginLoading}
                  onPress={handleLogin}
                  style={styles.submitBtn}
                />

                {/* Demo accounts */}
                <View style={styles.demoSection}>
                  <Text style={styles.demoLabel}>DEMO ACCOUNTS — 1-TAP LOGIN</Text>
                  {[
                    { id: 'lerato.khumalo@fiffys.com', name: '🇿🇦 Lerato Khumalo', sub: 'Johannesburg, South Africa' },
                    { id: 'amara.okafor@demo.fiffys.com', name: '🇳🇬 Amara Okafor', sub: 'Lagos, Nigeria' },
                    { id: 'thabo.ndlovu@demo.fiffys.com', name: '🇿🇦 Thabo Ndlovu', sub: 'Sandton, South Africa' },
                    { id: 'kwame.mensah@demo.fiffys.com', name: '🇬🇭 Kwame Mensah', sub: 'Accra, Ghana' },
                  ].map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      style={styles.demoBtn}
                      onPress={() => handleDemoLogin(d.id, 'password123')}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.demoBtnName}>{d.name}</Text>
                      <Text style={styles.demoBtnSub}>{d.sub}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* ── SIGNUP FORM ── */}
            {tab === 'signup' && (
              <View style={styles.form}>
                {!!signupError && <View style={styles.errorBox}><Text style={styles.errorText}>{signupError}</Text></View>}

                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Zola Dlamini"
                  placeholderTextColor={Colors.purpleDim}
                  value={name}
                  onChangeText={setName}
                />

                <View style={styles.row}>
                  <View style={styles.halfCol}>
                    <Text style={styles.label}>Date of Birth *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={Colors.purpleDim}
                      value={dob}
                      onChangeText={setDob}
                      keyboardType="numbers-and-punctuation"
                    />
                    {dob.length === 10 && (
                      <Text style={styles.ageBadge}>Age: {calcAge > 0 ? calcAge : '--'}</Text>
                    )}
                  </View>
                  <View style={styles.halfCol}>
                    <Text style={styles.label}>Contact Number *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="+27 82 000 0000"
                      placeholderTextColor={Colors.purpleDim}
                      value={contact}
                      onChangeText={setContact}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <Text style={styles.label}>Email (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@domain.com"
                  placeholderTextColor={Colors.purpleDim}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Text style={styles.label}>Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.purpleDim}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                {/* Gender */}
                <Text style={styles.label}>I am a</Text>
                <View style={styles.chipRow}>
                  {(['woman', 'man', 'non-binary'] as const).map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGender(g)}
                      style={[styles.chip, gender === g && styles.chipActive]}
                    >
                      {gender === g ? (
                        <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chipGrad}>
                          <Text style={styles.chipTextActive}>{g.charAt(0).toUpperCase() + g.slice(1)}</Text>
                        </LinearGradient>
                      ) : (
                        <Text style={styles.chipText}>{g.charAt(0).toUpperCase() + g.slice(1)}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Show Me */}
                <Text style={styles.label}>Show Me</Text>
                <View style={styles.chipRow}>
                  {(['men', 'women', 'everyone'] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setShowMe(s)}
                      style={[styles.chip, showMe === s && styles.chipActive]}
                    >
                      {showMe === s ? (
                        <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chipGrad}>
                          <Text style={styles.chipTextActive}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                        </LinearGradient>
                      ) : (
                        <Text style={styles.chipText}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Country */}
                <Text style={styles.label}>Country *</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setCountryPickerOpen(!countryPickerOpen)}
                >
                  <Text style={{ color: Colors.white, fontSize: 13 }}>
                    {AFRICAN_COUNTRIES.find((c) => c.name === country)?.flag} {country}
                  </Text>
                </TouchableOpacity>
                {countryPickerOpen && (
                  <View style={styles.pickerDropdown}>
                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                      {AFRICAN_COUNTRIES.map((c) => (
                        <TouchableOpacity
                          key={c.code}
                          style={styles.pickerOption}
                          onPress={() => {
                            setCountry(c.name);
                            setCity(c.majorCities[0] || '');
                            setCountryPickerOpen(false);
                          }}
                        >
                          <Text style={styles.pickerOptionText}>
                            {c.flag} {c.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Text style={styles.label}>City / Area *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Cape Town, Sandton"
                  placeholderTextColor={Colors.purpleDim}
                  value={city}
                  onChangeText={setCity}
                />

                <Text style={styles.label}>About You</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="What excites you, your favourite music, what connection you seek..."
                  placeholderTextColor={Colors.purpleDim}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <GradientButton
                  title={signupLoading ? '' : '✨  Create Account & Start Matching'}
                  loading={signupLoading}
                  onPress={handleSignup}
                  style={styles.submitBtn}
                />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 32, paddingBottom: 24 },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#0c051a',
    borderWidth: 1.5,
    borderColor: 'rgba(236,72,153,0.3)',
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  appName: { fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  tagline: { fontSize: 12, color: Colors.purpleText, marginTop: 4, textAlign: 'center' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    marginBottom: 24,
  },
  tabBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  tabActive: {},
  tabGrad: { paddingVertical: 10, alignItems: 'center', borderRadius: 14 },
  tabText: { color: Colors.purpleText, fontSize: 13, fontWeight: '600', textAlign: 'center', paddingVertical: 10 },
  tabTextActive: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  form: { gap: 4 },
  label: { color: Colors.purpleText, fontSize: 11, fontWeight: '700', marginBottom: 5, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.white,
    fontSize: 13,
  },
  textarea: { minHeight: 72, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 10 },
  halfCol: { flex: 1 },
  ageBadge: {
    color: Colors.pinkLight, fontSize: 11, fontWeight: '700',
    marginTop: 4, alignSelf: 'flex-end',
    backgroundColor: 'rgba(236,72,153,0.15)',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20,
  },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  chip: {
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', backgroundColor: Colors.bgInput,
  },
  chipActive: { borderColor: Colors.pinkLight },
  chipGrad: { paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { color: Colors.purpleText, fontSize: 12, fontWeight: '600', paddingHorizontal: 14, paddingVertical: 8 },
  chipTextActive: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  pickerDropdown: {
    backgroundColor: '#1e1338',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    zIndex: 100,
  },
  pickerOption: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pickerOptionText: { color: Colors.white, fontSize: 13 },
  submitBtn: { marginTop: 20 },
  errorBox: {
    backgroundColor: 'rgba(244,63,94,0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.35)',
    padding: 12,
    marginBottom: 8,
  },
  errorText: { color: '#fca5a5', fontSize: 12 },
  demoSection: { marginTop: 24, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 20 },
  demoLabel: { color: Colors.purpleDim, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  demoBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
  },
  demoBtnName: { color: Colors.pinkLight, fontSize: 13, fontWeight: '700' },
  demoBtnSub: { color: Colors.purpleDim, fontSize: 11, marginTop: 2 },
});
