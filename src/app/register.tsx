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
          <Text style={styles.welcomeText}>Seja Bem-vindo ao MesaOn!</Text>

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
    fontSize: typography.size.lg,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 24,
    textAlign: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
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
    marginBottom: 8,
  },
  form: {
    width: "100%",
  },
  errorText: {
    color: colors.status.error,
    textAlign: "center",
    marginBottom: 16,
  },
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
});
