import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLoginViewModel } from "../viewmodel/LoginViewModel";
import { container } from "../di/container";
import { colors, typography } from "./theme/theme";
import { Input } from "./components/Input";
import { Button } from "./components/Button";
import { Link, useRouter } from "expo-router";
import { useAppState } from "./state/AppState";
import { computeNextRoute } from "../usecase/computeNextRoute";

export default function LoginScreen() {
  const viewModel = useLoginViewModel(container.getLoginUseCase());
  const router = useRouter();
  const { hydrated, isAuthenticated, accessCode, autoVerifyEnabled } = useAppState();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string>("");
  const [verifyError, setVerifyError] = useState<string>("");
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startOverlay = (message: string) => {
    setVerifyMessage(message);
    setIsVerifying(true);
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    timeoutRef.current = setTimeout(() => {
      setVerifyError("Falha ao recuperar acesso. Tente novamente.");
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setIsVerifying(false);
      });
      Alert.alert("Tempo excedido", "Não foi possível verificar as credenciais no tempo esperado.");
    }, 6000);
  };

  const stopOverlay = () => {
    if (!isVerifying) return;
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsVerifying(false);
      setVerifyMessage("");
    });
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    let mounted = true;
    const checkAndMaybeOverlay = async () => {
      try {
        if (!hydrated) {
          setVerifyError("");
          // Consulta backend: exibe overlay apenas se há usuário e verificação habilitada
          const user = await container.getAuthService().getCurrentUser();
          if (mounted && user && autoVerifyEnabled) {
            startOverlay("Recuperando acesso...");
          }
        } else {
          stopOverlay();
        }
      } catch (e) {
        // Falha backend: não exibir overlay e mostrar erro discreto
        setVerifyError("Não foi possível verificar credenciais no momento.");
      }
    };
    checkAndMaybeOverlay();
    return () => {
      mounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [hydrated, autoVerifyEnabled]);

  useEffect(() => {
    let mounted = true;
    const verifyAndRoute = async () => {
      if (!hydrated) return;
      try {
        const user = await container.getAuthService().getCurrentUser();
        if (mounted && user && autoVerifyEnabled) {
          startOverlay("Verificando credenciais...");
        }
        const next = computeNextRoute({ isAuthenticated, accessCode });
        if (next !== '/') {
          stopOverlay();
          router.replace(next);
        }
        if (next === '/') {
          stopOverlay();
        }
      } catch (e) {
        // Falha backend: evitar overlay e seguir com UI
        stopOverlay();
        setVerifyError("Erro ao consultar credenciais. Por favor, continue o login.");
      }
    };
    verifyAndRoute();
    return () => { mounted = false; };
  }, [hydrated, isAuthenticated, accessCode, router, autoVerifyEnabled]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />
      {isVerifying && (
        <Animated.View
          style={[styles.overlay, { opacity: overlayOpacity }]}
          pointerEvents="none"
          accessibilityLiveRegion="polite"
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.overlayText}>{verifyMessage}</Text>
        </Animated.View>
      )}
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

          <Text style={styles.actionText}>Faça seu login</Text>
        </View>

        {!!verifyError && <Text style={styles.errorText}>{verifyError}</Text>}

        <View style={styles.form}>
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

          <View style={styles.forgotPasswordContainer}>
            <Link href="/recover-password" asChild>
              <Text testID="forgot-password-link" accessibilityLabel="forgot-password-link" style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
            </Link>
          </View>

          {!!viewModel.errorMessage && (
            <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
          )}

          <Button
            testID="login-button"
            accessibilityLabel="login-button"
            title="Entrar"
            onPress={viewModel.handleLogin}
            loading={viewModel.isLoading}
            style={styles.loginButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem conta ainda?</Text>
          <Button
            testID="register-button"
            accessibilityLabel="register-button"
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
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.75)",
    zIndex: 10,
  },
  overlayText: {
    marginTop: 12,
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: "600",
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
