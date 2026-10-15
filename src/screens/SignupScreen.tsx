import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { signupUser } from '../services/firebase';
import { SignupScreenNavigationProp } from '../types/navigationTypes';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const SignupScreen = ({ navigation }: { navigation: SignupScreenNavigationProp }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      Alert.alert('Invalid Name', 'Please enter your name.');
      return;
    }

    if (!trimmedEmail) {
      Alert.alert('Invalid Email', 'Please enter your email address.');
      return;
    }

    if (!password) {
      Alert.alert('Invalid Password', 'Please enter a password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Password and confirm password do not match.');
      return;
    }

    try {
      setLoading(true);
      await signupUser(trimmedEmail, password);
      Alert.alert('Account Created', 'Your account has been created successfully.',
        [{ text: 'Okay'}],
      );
    } catch (error) {
      Alert.alert('Signup Failed', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive">

        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🛍️</Text>
          </View>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Create your account to continue</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#9A9EAA"
                autoCapitalize="words"
                autoCorrect={false}
                style={styles.input}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📧</Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#9A9EAA"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9A9EAA"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                returnKeyType="next"
              />

              <TouchableOpacity
                style={styles.passwordButton}
                onPress={() => setShowPassword(prev => !prev)}
                activeOpacity={0.7}>
                <Text style={styles.passwordButtonText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔐</Text>

              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor="#9A9EAA"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                returnKeyType="done"
              />

              <TouchableOpacity
                style={styles.passwordButton}
                onPress={() => setShowConfirmPassword(prev => !prev)}
                activeOpacity={0.7}>
                <Text style={styles.passwordButtonText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleSignup}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.signupButtonText}>Create Account</Text>
                <Text style={styles.signupArrow}>→</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.replace('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  logoCircle: {
    width: 82,
    height: 82,
    borderRadius: 27,
    backgroundColor: '#E9EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoIcon: {
    fontSize: 38,
  },

  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#181A20',
  },

  subtitle: {
    marginTop: 7,
    fontSize: 13,
    color: '#858A98',
  },

  formContainer: {
    width: '100%',
  },

  inputContainer: {
    marginBottom: 17,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#20222A',
    marginBottom: 8,
  },

  inputWrapper: {
    height: 56,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7ED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  inputIcon: {
    fontSize: 17,
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#20222A',
  },

  passwordButton: {
    paddingHorizontal: 5,
    paddingVertical: 8,
  },

  passwordButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4263EB',
  },

  signupButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#4263EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
    shadowColor: '#4263EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },

  signupButtonDisabled: {
    opacity: 0.7,
  },

  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  signupArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    marginLeft: 10,
    marginTop: -2,
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  loginText: {
    fontSize: 13,
    color: '#858A98',
  },

  loginLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4263EB',
  },
});

export default SignupScreen;
