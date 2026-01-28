import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Image, Pressable, useWindowDimensions, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { colors, typography } from '../../theme/theme'
import { container } from '../../../di/container'
import { useCollaboratorCodeViewModel } from '../../../viewmodel/CollaboratorCodeViewModel'
import { useAppState } from '../../state/AppState'
import { router } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { Ionicons } from '@expo/vector-icons'

export default function CollaboratorCodeStandalone() {
  const vm = useCollaboratorCodeViewModel(
    container.getValidateAccessCodeUseCase(),
    container.getGenerateAccessCodeUseCase()
  )
  const { isAuthenticated, accessCode, setAccessCode } = useAppState()
  const { width } = useWindowDimensions()
  const scale = Math.min(Math.max(width / 375, 0.85), 1.15)

  const title = 'Código de acesso'
  const helper =
    vm.status === 'success'
      ? 'Código validado com sucesso!'
      : vm.status === 'invalid'
      ? 'Código inválido ou inexistente.'
      : 'Digite o código gerado pela organização'

  const onConfirm = async () => {
    if (vm.status !== 'success') return
    setAccessCode(vm.codeInput)
    router.replace('/(authenticated)/(tabs)/dashboard')
  }
  const onGenerate = async () => {
    await vm.generateCode()
    if (vm.generatedCode) {
      setAccessCode(vm.generatedCode)
    }
  }
  const onCopy = async () => {
    const c = vm.codeInput
    if (!c) return
    // Copia somente dígitos para área de transferência
    await Clipboard.setStringAsync(c.replace(/\D/g, ''))
  }

  useEffect(() => {
    // Se já autenticado e há código persistido, evita exibir esta tela
    if (isAuthenticated && accessCode) {
      router.replace('/(authenticated)/(tabs)/dashboard')
    }
  }, [isAuthenticated, accessCode])

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { paddingHorizontal: 24 * scale }]}>
      <View style={styles.header}>
        {/* Logomarca central conforme mock */}
        <Image
          source={require('../../../../assets/logoMesaOn.png')}
          style={[styles.logo, { width: 200 * scale, height: 140 * scale }]}
          resizeMode="contain"
        />
      </View>

      {/* Título principal conforme mock */}
      <Text style={[styles.title, { fontSize: typography.size.lg }]}>{title}</Text>

      {/* Campo de código com botão de copiar à direita */}
      <View style={[styles.inputContainer, { height: 52 * scale, borderRadius: 10 * scale }]}>
        <TextInput
          testID="access-code-input"
          accessibilityLabel="access-code-input"
          value={vm.codeInput}
          onChangeText={vm.onChange}
          placeholder="Digite o código aqui"
          placeholderTextColor={colors.text.placeholder}
          keyboardType="numeric"
          maxLength={9}
          style={[styles.input, { paddingHorizontal: 16 * scale }]}
        />
        <Pressable onPress={onCopy} style={({ pressed }) => [styles.copyBtn, { opacity: pressed ? 0.8 : 1 }]}>
          <Ionicons name="copy-outline" size={20} color={colors.text.primary} />
        </Pressable>
      </View>
      {!!vm.errorMessage || vm.status === 'success' ? (
        <Text style={[styles.statusText, vm.status === 'success' ? styles.successText : styles.errorText]}>{helper}</Text>
      ) : (
        <Text style={[styles.statusText]}>{helper}</Text>
      )}

      {/* Botões de ação conforme mock: Gerar (outline) e Confirmar (primário) */}
      <View style={[styles.actions, { gap: 12 * scale }]}>
        <Pressable
          testID="generate-code-button"
          accessibilityLabel="generate-code-button"
          onPress={onGenerate}
          disabled={vm.isLoading}
          style={({ pressed }) => [
            styles.secondaryBtn,
            { borderRadius: 28 * scale, height: 48 * scale, opacity: vm.isLoading ? 0.7 : pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={[styles.secondaryBtnText, { fontSize: typography.size.md }]}>Gerar Código</Text>
        </Pressable>
        <Pressable
          testID="confirm-code-button"
          accessibilityLabel="confirm-code-button"
          onPress={onConfirm}
          disabled={vm.status !== 'success' || vm.isLoading}
          style={({ pressed }) => [
            styles.primaryBtn,
            { borderRadius: 28 * scale, height: 48 * scale, opacity: vm.isLoading ? 0.7 : 1, backgroundColor: vm.status !== 'success' ? '#FFB87A' : pressed ? '#E67E22' : colors.primary },
          ]}
        >
          <Text style={[styles.primaryBtnText, { fontSize: typography.size.md }]}>Confirmar</Text>
        </Pressable>
      </View>

    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 16 },
  logo: { width: 200, height: 140 },
  title: { color: colors.text.primary, marginBottom: 26 },
  inputContainer: { width: '100%', backgroundColor: '#EDEAE4', borderColor: colors.border, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { flex: 1, color: colors.text.primary, fontSize: typography.size.md },
  copyBtn: { paddingHorizontal: 12 },
  statusText: { width: '100%', textAlign: 'left', color: colors.text.secondary, marginTop: 8 },
  successText: { color: colors.status.success },
  errorText: { color: colors.status.error },
  actions: { width: '100%', marginTop: 16, flexDirection: 'row' },
  secondaryBtn: { flex: 1, borderWidth: 1, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  secondaryBtnText: { color: colors.primary, fontWeight: 'bold' },
  primaryBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: colors.text.inverted, fontWeight: 'bold' },
})
