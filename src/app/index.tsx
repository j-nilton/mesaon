import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLoginViewModel } from "../viewmodel/LoginViewModel";
import { container } from "../di/container";
import { colors, typography } from "./theme/theme";
import { Input } from "./components/Input";
import { Button } from "./components/Button";
import { Link } from "expo-router";

export default function LoginScreen() {
  const viewModel = useLoginViewModel(container.getLoginUseCase());

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
            {/* Placeholder para a logo - na prática usaríamos require('../assets/logoMesaOn.png') */}
            <Image
              source={require("../../assets/logoMesaOn.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.actionText}>Faça seu login</Text>
        </View>

        <View style={styles.form}>
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

          <View style={styles.forgotPasswordContainer}>
            <Link href="/recover-password" asChild>
              <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
            </Link>
          </View>

          {!!viewModel.errorMessage && (
            <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
          )}

          <Button
            title="Entrar"
            onPress={viewModel.handleLogin}
            loading={viewModel.isLoading}
            style={styles.loginButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem conta ainda?</Text>
          <Button
            title="Cadastre-se"
            variant="text"
            onPress={viewModel.navigateToRegister}
            style={styles.registerButton}
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
  forgotPasswordContainer: {
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
  },
  errorText: {
    color: colors.status.error,
    textAlign: "center",
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
  },
  registerButton: {
    marginTop: 4,
    height: 30,
    fontWeight: '800',
  },
});
