import React, { useRef, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  Pressable
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRegisterViewModel } from "../viewmodel/RegisterViewModel";
import { container } from "../di/container";
import { colors, typography } from "./theme/theme";
import { Input } from "./components/Input";
import { Button } from "./components/Button";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const viewModel = useRegisterViewModel(
    container.getRegisterUseCase(),
    container.getResendVerificationEmailUseCase(),
    container.getCheckEmailVerificationUseCase(),
    container.getCurrentUserProfileUseCase()
  );
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    if (viewModel.verificationSent) {
      const interval = setInterval(() => {
        viewModel.checkVerification();
      }, 120000);
      return () => clearInterval(interval);
    }
  }, [viewModel.verificationSent]);

  // Animation values
  const strengthAnim = useRef(new Animated.Value(0)).current;

  // Calculate numeric strength (0-4) based on rules passed
  const rulesMet = useMemo(() => {
    const { length, upper, lower, number } = viewModel.passwordRules;
    return [length, upper, lower, number].filter(Boolean).length;
  }, [viewModel.passwordRules]);

  useEffect(() => {
    Animated.timing(strengthAnim, {
      toValue: rulesMet,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [rulesMet]);

  const barColor = strengthAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [colors.border, colors.status.error, colors.status.warning, "#87D37C", colors.status.success]
  });

  const barWidth = strengthAnim.interpolate({
    inputRange: [0, 4],
    outputRange: ["0%", "100%"]
  });

  const renderRequirementIcon = (met: boolean, icon: keyof typeof Ionicons.glyphMap, label: string) => (
    <Pressable 
      onPress={() => setShowTooltip(label)}
      style={({ pressed }) => [styles.reqIcon, { opacity: pressed ? 0.7 : 1, backgroundColor: met ? colors.status.success + '20' : colors.status.error + '10' }]}
    >
      <Ionicons name={icon} size={16} color={met ? colors.status.success : colors.status.error} />
    </Pressable>
  );

  if (viewModel.verificationSent) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={[styles.scrollContent, { alignItems: 'center' }]}>
           <Ionicons name="mail-unread-outline" size={80} color={colors.primary} style={{ marginBottom: 24 }} />
           <Text style={styles.welcomeText}>Verifique seu e-mail</Text>
           <Text style={[styles.actionText, { textAlign: 'center', marginBottom: 24 }]}>
             Enviamos um link de confirmação para{'\n'}
             <Text style={{ fontWeight: 'bold' }}>{viewModel.email}</Text>
           </Text>
           
           <Text style={{ textAlign: 'center', color: colors.text.secondary, marginBottom: 32 }}>
             Para continuar, clique no link enviado. Verifique sua caixa de e-mail ou spam.
           </Text>

           {!!viewModel.errorMessage && (
             <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
           )}

           <Button
             title={viewModel.resendCooldown > 0 ? `Reenviar em ${viewModel.resendCooldown}s` : "Reenviar e-mail"}
             onPress={viewModel.handleResendEmail}
             disabled={viewModel.resendCooldown > 0}
             loading={viewModel.isLoading}
             variant="outline"
             style={{ width: '100%', marginBottom: 16 }}
           />
           
           <Button
             title="Já verifiquei"
             onPress={viewModel.checkVerification}
             loading={viewModel.isLoading}
             style={{ width: '100%' }}
           />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Seja Bem-vindo!</Text>

          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/logoMesaOn.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.actionText}>Faça seu cadastro</Text>
        </View>

        <View style={styles.form}>
          <Input
            testID="name-input"
            accessibilityLabel="name-input"
            placeholder="Nome"
            value={viewModel.name}
            onChangeText={viewModel.setName}
            autoCapitalize="words"
          />

          <Input
            testID="email-input"
            accessibilityLabel="email-input"
            placeholder="Email"
            value={viewModel.email}
            onChangeText={viewModel.setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            testID="password-input"
            accessibilityLabel="password-input"
            placeholder="Senha"
            value={viewModel.password}
            onChangeText={viewModel.setPassword}
            isPassword
          />
          {!!viewModel.passwordError && (
            <Text style={styles.errorText}>{viewModel.passwordError}</Text>
          )}
          
          <View style={styles.strengthContainer}>
            <View style={styles.strengthHeader}>
              <Text style={styles.strengthLabel}>Força da senha</Text>
              <Text style={[styles.strengthValue, { color: rulesMet === 4 ? colors.status.success : rulesMet > 2 ? colors.status.warning : colors.status.error }]}>
                {rulesMet === 4 ? 'Forte' : rulesMet > 2 ? 'Média' : 'Fraca'}
              </Text>
            </View>
            
            <View style={styles.progressBarBg}>
              <Animated.View style={[styles.progressBarFill, { width: barWidth, backgroundColor: barColor }]} />
            </View>
          </View>

          <Input
            testID="confirm-password-input"
            accessibilityLabel="confirm-password-input"
            placeholder="Confirmar senha"
            value={viewModel.confirmPassword}
            onChangeText={viewModel.setConfirmPassword}
            isPassword
          />

          {!!viewModel.errorMessage && (
            <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
          )}

          <Button
            testID="register-submit-button"
            accessibilityLabel="register-submit-button"
            title="Confirmar cadastro"
            onPress={viewModel.handleRegister}
            loading={viewModel.isLoading}
            style={styles.registerButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta?</Text>
          <Button
            testID="login-link"
            accessibilityLabel="login-link"
            title="Faça login"
            variant="text"
            onPress={viewModel.navigateToLogin}
            style={styles.loginButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: typography.size.xl,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 24,
    textAlign: "center",
  },
  logoContainer: {
    width: 150,
    height: 150,
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  actionText: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  form: {
    width: "100%",
  },
  errorText: {
    color: colors.status.error,
    textAlign: "center",
    marginBottom: 16,
  },
  strengthContainer: { marginTop: -5, marginBottom: 10 },
  strengthHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  strengthLabel: { fontSize: typography.size.sm, color: colors.text.secondary },
  strengthValue: { fontSize: typography.size.sm, fontWeight: 'bold' },
  progressBarBg: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', borderRadius: 2 },
  requirementsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  reqIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tooltipText: { marginTop: 8, fontSize: typography.size.sm, color: colors.text.secondary, textAlign: 'center', fontStyle: 'italic' },
  registerButton: {
    marginTop: 16,
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
  },
  loginButton: {
    marginTop: 4,
    height: 30,
    fontWeight: '800',
  },
});
