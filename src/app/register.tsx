import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRegisterViewModel } from "../viewmodel/RegisterViewModel";
import { container } from "../di/container";
import { colors, typography } from "./theme/theme";
import { Input } from "./components/Input";
import { Button } from "./components/Button";

export default function RegisterScreen() {
  const viewModel = useRegisterViewModel(container.getRegisterUseCase());

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
            placeholder="Nome"
            value={viewModel.name}
            onChangeText={viewModel.setName}
            autoCapitalize="words"
          />

          <Input
            placeholder="Email"
            value={viewModel.email}
            onChangeText={viewModel.setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            placeholder="Senha"
            value={viewModel.password}
            onChangeText={viewModel.setPassword}
            isPassword
          />
          <View style={{ marginTop: 8 }}>
            <Text style={[styles.passwordHint, viewModel.passwordRules.length ? styles.passOk : styles.passBad]}>• Mínimo de 8 caracteres</Text>
            <Text style={[styles.passwordHint, viewModel.passwordRules.upper ? styles.passOk : styles.passBad]}>• Contém letra maiúscula</Text>
            <Text style={[styles.passwordHint, viewModel.passwordRules.lower ? styles.passOk : styles.passBad]}>• Contém letra minúscula</Text>
            <Text style={[styles.passwordHint, viewModel.passwordRules.number ? styles.passOk : styles.passBad]}>• Contém número</Text>
            <Text style={styles.strengthText}>Força da senha: {viewModel.strength}</Text>
          </View>

          <Input
            placeholder="Confirmar senha"
            value={viewModel.confirmPassword}
            onChangeText={viewModel.setConfirmPassword}
            isPassword
          />

          {!!viewModel.errorMessage && (
            <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
          )}

          <Button
            title="Confirmar cadastro"
            onPress={viewModel.handleRegister}
            loading={viewModel.isLoading}
            style={styles.registerButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta?</Text>
          <Button
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
    marginBottom: 32,
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
  passwordHint: { fontSize: typography.size.sm, color: colors.text.secondary },
  passOk: { color: colors.status.success },
  passBad: { color: colors.status.error },
  strengthText: { marginTop: 4, fontWeight: '600', color: colors.text.primary },
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