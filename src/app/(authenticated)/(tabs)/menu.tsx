import { View, Text, StyleSheet, TextInput, useWindowDimensions, Pressable, Modal, ScrollView, Alert, Animated, Easing, Platform, ToastAndroid } from 'react-native'
import { colors, typography } from '../../theme/theme'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { container } from '../../../di/container'
import { useAppState } from '../../state/AppState'
import { useMenuViewModel } from '../../../viewmodel/MenuViewModel'
import { ProductCategory } from '../../../model/entities/Product'
import * as Clipboard from 'expo-clipboard'
import { Picker } from '@react-native-picker/picker'
import { router, usePathname } from 'expo-router'

export default function MenuScreen() {
  const { accessCode, role, setAccessCode, setRole } = useAppState()
  const [showMenu, setShowMenu] = useState(false)
  const vm = useMenuViewModel(
    container.getListProductsByCodeUseCase(),
    container.getCreateProductUseCase(),
    container.getUpdateProductUseCase(),
    container.getDeleteProductUseCase(),
    accessCode,
    role
  )
  const { width } = useWindowDimensions()
  const scale = Math.min(Math.max(width / 375, 0.9), 1.1)
  const categories: ProductCategory[] = useMemo(() => ['Bebidas', 'Pizzas', 'Pratos', 'Petiscos', 'Sobremesas'], [])
  const formattedCode = useMemo(() => (accessCode ? `${accessCode.slice(0,3)} - ${accessCode.slice(3,6)} - ${accessCode.slice(6,9)}` : undefined), [accessCode])
  const copyAnim = useRef(new Animated.Value(1)).current
  const pathname = usePathname()
  const copyCode = async () => {
    if (!accessCode) return
    // Copia somente dígitos para área de transferência
    await Clipboard.setStringAsync(accessCode.replace(/\D/g, ''))
    Animated.sequence([
      Animated.spring(copyAnim, { toValue: 0.96, useNativeDriver: true, speed: 20, bounciness: 6 }),
      Animated.spring(copyAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }),
    ]).start()
    if (Platform.OS === 'android') {
      ToastAndroid.show('Código copiado para área de transferência', ToastAndroid.SHORT)
    } else {
      Alert.alert('Copiado', 'Código copiado para área de transferência')
    }
  }
  useEffect(() => {
    setShowMenu(false)
  }, [pathname])

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingHorizontal: 16, marginTop: 32 }]}>
        <View style={[styles.search, { height: 44 * scale, borderRadius: 22 * scale, paddingHorizontal: 16 }]}>
          <Ionicons name="search" size={18 * scale} color={colors.text.secondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Pesquise o produto aqui..."
            placeholderTextColor={colors.text.secondary}
            value={vm.query}
            onChangeText={vm.setQuery}
            style={{ flex: 1, color: colors.text.primary, fontSize: typography.size.md }}
          />
        </View>
        <Pressable onPress={() => setShowMenu(v => !v)}>
          <Ionicons name="person-circle-outline" size={36 * scale} color={colors.text.secondary} />
        </Pressable>
        {showMenu && (
          <View style={styles.menu}>
            <Pressable
              onPress={() => {
                Alert.alert('Sair', 'Deseja realmente sair?', [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                      await container.getAuthService().logout()
                      setAccessCode(undefined)
                      setRole(undefined)
                      router.replace('/')
                    },
                  },
                ])
              }}
            >
              <Text style={styles.menuItem}>Sair</Text>
            </Pressable>
          </View>
        )}
        {showMenu ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowMenu(false)} />
        ) : null}
      </View>
      {formattedCode && (
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Animated.View style={{ transform: [{ scale: copyAnim }] }}>
            <Pressable onPress={copyCode} style={({ pressed }) => [styles.codePill, { opacity: pressed ? 0.9 : 1, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
              <Ionicons name="clipboard-outline" size={16} color={colors.text.primary} />
              <Text style={styles.codePillText}>Código de acesso: {formattedCode}</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}

      <View style={[styles.tabs, { paddingHorizontal: 16 }]}>
        {categories.map(c => (
          <Pressable key={c} onPress={() => vm.setCategory(c)} style={({ pressed }) => [styles.tabItem, vm.category === c ? styles.tabItemActive : null, pressed ? { opacity: 0.8 } : null]}>
            <Text style={[styles.tabText, vm.category === c ? styles.tabTextActive : null]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      {vm.loading ? (
        <Text style={styles.empty}>Carregando...</Text>
      ) : vm.products.length === 0 ? (
        <Text style={styles.empty}>Sem produtos cadastrados</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 16 }}>
          {vm.products
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
            .map(p => (
            <View key={p.id} style={[styles.card, { justifyContent: 'space-between', minHeight: 56 }]}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.productTitle}>{p.name}</Text>
                <Text style={styles.productPrice}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                </Text>
                {p.description ? (
                  <Text style={{ color: colors.text.secondary, marginTop: 2 }}>{p.description}</Text>
                ) : null}
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => vm.openForm(p)}
                  style={({ pressed }) => [
                    { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#3F6F56' },
                    pressed ? { opacity: 0.8 } : null,
                  ]}
                >
                  <Ionicons name="pencil" size={18} color={colors.text.inverted} />
                </Pressable>
                <Pressable
                  onPress={() => {
                    Alert.alert('Remover produto', `Deseja remover "${p.name}"?`, [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Remover', style: 'destructive', onPress: () => vm.remove(p.id) },
                    ])
                  }}
                  style={({ pressed }) => [
                    { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#B3261E' },
                    pressed ? { opacity: 0.8 } : null,
                  ]}
                >
                  <Ionicons name="trash" size={18} color={colors.text.inverted} />
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Pressable
        accessibilityRole="button"
        disabled={!vm.fabEnabled}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: pressed ? '#E67E22' : colors.primary,
            shadowOpacity: 0.2,
            opacity: vm.fabEnabled ? 1 : 0.6,
          },
        ]}
        onPress={() => vm.openForm()}
      >
        <Ionicons name="add" size={24} color={colors.text.inverted} />
      </Pressable>

      {!vm.fabEnabled && vm.fabDisabledReason ? (
        <View style={styles.fabTip}>
          <Text style={styles.fabTipText}>{vm.fabDisabledReason}</Text>
        </View>
      ) : null}

      <Modal visible={vm.formOpen} transparent animationType="fade" onRequestClose={vm.closeForm}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={vm.closeForm} />
          {(() => {
            const anim = useRef(new Animated.Value(0)).current
            useEffect(() => {
              Animated.timing(anim, {
                toValue: vm.formOpen ? 1 : 0,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }).start()
            }, [vm.formOpen])
            const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] })
            const opacity = anim
            return (
              <Animated.View style={[styles.modalCard, { transform: [{ translateY }], opacity }]}>
                <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                  <Text style={styles.modalTitle}>Cadastro de Produtos</Text>
                </View>
                <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                  <Text style={styles.label}>Categoria</Text>
                  <View style={[styles.selectBox, { paddingVertical: 8 }]}>
                    <Picker
                      selectedValue={vm.form.category}
                      onValueChange={(itemValue) => vm.setField('category', itemValue as ProductCategory)}
                      style={{ height: 56, width: '100%', color: colors.text.primary }}
                      itemStyle={{ fontSize: typography.size.md }}
                      dropdownIconColor={colors.text.secondary}
                      mode="dropdown"
                    >
                      {categories.map(c => (
                        <Picker.Item key={c} label={c} value={c} />
                      ))}
                    </Picker>
                  </View>
                </View>
                <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                  <Text style={styles.label}>Nome do Produto</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      placeholder="Digite o nome do produto"
                      placeholderTextColor={colors.text.secondary}
                      value={vm.form.name}
                      onChangeText={v => vm.setField('name', v)}
                      style={styles.input}
                    />
                  </View>
                </View>
                <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                  <Text style={styles.label}>Preço do Produto</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      placeholder="Preço (exemplo: 10.50)"
                      placeholderTextColor={colors.text.secondary}
                      value={vm.form.price}
                      onChangeText={v => vm.setField('price', v)}
                      keyboardType="decimal-pad"
                      style={styles.input}
                    />
                  </View>
                </View>
                <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                  <Text style={styles.label}>Descrição</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      placeholder="Descrição opcional"
                      placeholderTextColor={colors.text.secondary}
                      value={vm.form.description || ''}
                      onChangeText={v => vm.setField('description', v)}
                      style={styles.input}
                    />
                  </View>
                </View>
                {vm.errorMessage ? <Text style={[styles.error]}>{vm.errorMessage}</Text> : null}
                <View style={styles.modalFooter}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.secondaryBtn,
                      { borderColor: colors.primary, backgroundColor: '#FFF', opacity: pressed ? 0.8 : 1 },
                    ]}
                    onPress={vm.closeForm}
                  >
                    <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      { backgroundColor: pressed ? '#E67E22' : colors.primary },
                    ]}
                    onPress={vm.submit}
                  >
                    <Text style={styles.primaryBtnText}>{vm.editing ? 'Salvar' : 'Adicionar Produto'}</Text>
                  </Pressable>
                </View>
              </Animated.View>
            )
          })()}
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 12, },
  empty: { color: colors.text.secondary, fontSize: typography.size.md, textAlign: 'center', marginTop: 32 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, gap: 10 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFEAE2' },
  avatar: { backgroundColor: '#DDD9D2' },
  tabs: { flexDirection: 'row', gap: 16, marginTop: 16 },
  tabItem: { paddingBottom: 8 },
  tabText: { color: colors.text.secondary, fontWeight: '600' },
  tabItemActive: { borderBottomWidth: 2, borderColor: '#C7BBA5' },
  tabTextActive: { color: '#A38C5D' },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  productTitle: { color: colors.text.primary, fontSize: typography.size.md, marginBottom: 4 },
  productPrice: { color: '#3A8F3A' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 3,
  },
  fabTip: {
    position: 'absolute',
    right: 16,
    bottom: 144,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: 280,
  },
  fabTipText: { color: colors.text.secondary, fontSize: typography.size.sm },
  // estilos duplicados removidos
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 16 },
  modalTitle: { fontSize: typography.size.lg, fontWeight: 'bold', color: colors.text.primary },
  label: { color: colors.text.secondary, marginBottom: 6 },
  inputBox: { backgroundColor: '#EDEAE4', borderColor: colors.border, borderWidth: 1, borderRadius: 8 },
  input: { paddingHorizontal: 12, paddingVertical: 12, color: colors.text.primary, fontSize: typography.size.md },
  selectBox: { backgroundColor: '#EDEAE4', borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 8 },
  selectChip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, marginRight: 8, backgroundColor: '#DDD9D2' },
  selectChipActive: { backgroundColor: '#C7BBA5' },
  selectChipText: { color: colors.text.primary },
  selectChipTextActive: { color: colors.text.inverted },
  modalFooter: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12 },
  secondaryBtn: { flex: 1, borderWidth: 1, borderRadius: 24, justifyContent: 'center', alignItems: 'center', height: 48 },
  secondaryBtnText: { fontSize: typography.size.md, fontWeight: 'bold' },
  primaryBtn: { flex: 1, borderRadius: 24, justifyContent: 'center', alignItems: 'center', height: 48 },
  primaryBtnText: { color: colors.text.inverted, fontSize: typography.size.md, fontWeight: 'bold' },
  error: { color: colors.status.error, paddingHorizontal: 16, marginTop: 8 },
  codePill: { backgroundColor: '#EFEAE2', borderColor: colors.border, borderWidth: 1, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 },
  codePillText: { color: colors.text.primary, fontSize: typography.size.sm },
  menu: {
    position: 'absolute',
    top: 56,
    right: 16,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  menuItem: { color: colors.text.primary, paddingVertical: 6 },
})
