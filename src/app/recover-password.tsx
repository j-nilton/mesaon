import React from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { colors, typography } from './theme/theme'
import { Input } from './components/Input'
import { Button } from './components/Button'
import { container } from '../di/container'
import { useRecoverPasswordViewModel } from '../viewmodel/RecoverPasswordViewModel'
import { router } from 'expo-router'

export default function RecoverPasswordScreen() {
  const vm = useRecoverPasswordViewModel(container.getRecoverPasswordUseCase())

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Recuperar senha</Text>
        <Text style={styles.subtitle}>Informe seu e-mail para receber o link de recuperação</Text>
        <Input
          placeholder="Email"
          value={vm.email}
          onChangeText={vm.setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {!!vm.errorMessage && <Text style={styles.error}>{vm.errorMessage}</Text>}
        <Button
          title="Enviar e-mail"
          onPress={async () => {
            const ok = await vm.submit()
            if (ok) {
              Alert.alert('E-mail enviado', 'Verifique sua caixa de entrada para redefinir a senha.', [
                { text: 'OK', onPress: () => router.replace('/') }
              ])
            }
          }}
          loading={vm.isLoading}
          disabled={!vm.canSubmit}
          style={{ marginTop: 12 }}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  content: { flex: 1, justifyContent: 'center', gap: 12 },
  title: { fontSize: typography.size.lg, fontWeight: 'bold', color: colors.text.primary, textAlign: 'center' },
  subtitle: { color: colors.text.secondary, textAlign: 'center', marginBottom: 8 },
  error: { color: colors.status.error, textAlign: 'center', marginTop: 8 },
})
