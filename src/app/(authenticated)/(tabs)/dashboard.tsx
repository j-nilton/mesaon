import { View, Text, StyleSheet, TextInput, useWindowDimensions, Pressable, Alert, Modal, Animated, Easing, ScrollView, Platform, ToastAndroid } from 'react-native'
import { colors, typography } from '../../theme/theme'
import { container } from '../../../di/container'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router, usePathname } from 'expo-router'
import { useAppState } from '../../state/AppState'
import * as Clipboard from 'expo-clipboard'
import { useTablesViewModel } from '../../../viewmodel/TablesViewModel'
import { useCreateTableViewModel } from '../../../viewmodel/CreateTableViewModel'

export default function DashboardScreen() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | undefined>(undefined)
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | undefined>(undefined)
  const [showFab, setShowFab] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState<string | undefined>(undefined)
  const [editName, setEditName] = useState('')
  const [editWaiter, setEditWaiter] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const { width } = useWindowDimensions()
  const scale = Math.min(Math.max(width / 375, 0.9), 1.1)
  const { accessCode, setAccessCode, setRole } = useAppState()
  const copyAnim = React.useRef(new Animated.Value(1)).current
  const modalAnim = React.useRef(new Animated.Value(0)).current
  const pathname = usePathname()
  const vm = useTablesViewModel(
    container.getListTablesByCodeUseCase(),
    container.getCreateTableUseCase(),
    container.getUpdateTableUseCase(),
    container.getDeleteTableUseCase(),
    accessCode,
    container.getSubscribeTablesByCodeUseCase()
  )
  const createVM = useCreateTableViewModel(container.getCreateTableUseCase(), accessCode)
  const formattedCode = accessCode ? `${accessCode.slice(0,3)} - ${accessCode.slice(3,6)} - ${accessCode.slice(6,9)}` : undefined
  const copyCode = async () => {
    if (!accessCode) return
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
    const load = async () => {
      setLoading(true)
      const p = await container.getCurrentUserProfileUseCase().execute()
      setProfile(p)
      setLoading(false)
    }
    load()
  }, [])
  useEffect(() => {
    Animated.timing(modalAnim, {
      toValue: createVM.isOpen ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [createVM.isOpen])
  const queryDebounce = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingClear = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    setShowMenu(false)
    if (pendingClear.current) {
      clearTimeout(pendingClear.current)
      pendingClear.current = null
    }
    pendingClear.current = setTimeout(() => {
      setQuery('')
    }, 250)
  }, [pathname])
  const onQueryChange = (text: string) => {
    if (queryDebounce.current) clearTimeout(queryDebounce.current)
    queryDebounce.current = setTimeout(() => {
      setQuery(text)
    }, 120)
  }

  const role = profile?.role
  return (
    <View style={[styles.container]}>
      <View style={[styles.topBar, { paddingHorizontal: 16, marginTop: 32 }]}>
        <View style={[styles.search, { height: 44 * scale, borderRadius: 24 * scale, paddingHorizontal: 16 }]}>
          <Ionicons name="search" size={18 * scale} color={colors.text.secondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Pesquise a mesa aqui..."
            placeholderTextColor={colors.text.secondary}
            value={query}
            onChangeText={onQueryChange}
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
      {loading || (vm.loading && vm.tables.length === 0) ? (
        <Text style={styles.empty}>Carregando...</Text>
      ) : (
        <View>
          <Text style={styles.title}>Mesas</Text>
          {vm.errorMessage ? <Text style={styles.error}>{vm.errorMessage}</Text> : null}
          {vm.tables
            .filter(t => {
              const q = query.trim().toLowerCase()
              if (!q) return true
              const fields = [t.name, t.waiterName || '', t.notes || '']
              return fields.some(f => f.toLowerCase().includes(q))
            }).length === 0 ? (
            <Text style={styles.empty}>Nenhuma mesa cadastrada</Text>
          ) : (
            <ScrollView contentContainerStyle={[styles.list, { paddingBottom: 180 }]} onScroll={(e) => {
              const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent
              const nearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 24
              setShowFab(!nearBottom)
            }} scrollEventThrottle={16}>
              {vm.tables
                .filter(t => {
                  const q = query.trim().toLowerCase()
                  if (!q) return true
                  const fields = [t.name, t.waiterName || '', t.notes || '']
                  return fields.some(f => f.toLowerCase().includes(q))
                })
                .map((t, idx) => {
                const badge = String(idx + 1).padStart(2, '0')
                const occupied = (t.orders?.length || 0) > 0 || (t.total || 0) > 0
                const color = occupied ? '#B3261E' : '#3F6F56'
                return (
                  <Pressable key={t.id} style={[styles.tableCard, { shadowOpacity: 0.15 }]} onPress={() => router.push(`/(authenticated)/standalone/tableDetails?id=${t.id}`)}>
                    <View style={[styles.tableRow]}>
                      <View style={[styles.badge, { backgroundColor: color }]}>
                        <Text style={styles.badgeText}>{badge}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tableTitle}>{t.name}</Text>
                        {t.waiterName ? <Text style={styles.tableSubtitle}>{t.waiterName}</Text> : null}
                        {t.notes ? <Text style={styles.tableNotes}>{t.notes}</Text> : null}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={styles.totalPill}>
                          <Text style={styles.totalPillText}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.total || 0)}
                          </Text>
                        </View>
                        <Pressable onPress={(e) => {
                          const { pageX, pageY } = e.nativeEvent
                          setMenuPosition({ top: pageY, right: width - pageX })
                          setOpenMenuId(prev => (prev === t.id ? undefined : t.id))
                        }}>
                          <Ionicons name="ellipsis-vertical" size={18} color={colors.text.secondary} />
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                )
              })}
            </ScrollView>
          )}
        </View>
      )}
      {openMenuId && (
        <>
          <Pressable style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 2000 }} onPress={() => setOpenMenuId(undefined)} />
          <View style={[styles.kebabMenu, { zIndex: 2001, top: menuPosition?.top, right: menuPosition?.right }]}>
            <Pressable
              onPress={() => {
                const t = vm.tables.find(tbl => tbl.id === openMenuId)
                if (!t) return
                setEditId(t.id)
                setEditName(t.name)
                setEditWaiter(t.waiterName || '')
                setEditNotes(t.notes || '')
                setOpenMenuId(undefined)
                setEditOpen(true)
              }}
              style={({ pressed }) => [{ paddingVertical: 8 }, pressed ? { opacity: 0.8 } : null]}
            >
              <Text style={styles.kebabItem}>Editar dados da mesa</Text>
            </Pressable>
            <Pressable
              disabled={!vm.tables.find(t => t.id === openMenuId)?.total}
              onPress={() => {
                const t = vm.tables.find(tbl => tbl.id === openMenuId)
                if (!t) return
                Alert.alert('Liberar mesa', `Deseja liberar "${t.name}"?`, [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Liberar', onPress: () => vm.release(t.id) },
                ])
                setOpenMenuId(undefined)
              }}
              style={({ pressed }) => [{ paddingVertical: 8, opacity: !vm.tables.find(t => t.id === openMenuId)?.total ? 0.5 : 1 }, pressed ? { opacity: 0.8 } : null]}
            >
              <Text style={styles.kebabItem}>Liberar mesa</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                const t = vm.tables.find(tbl => tbl.id === openMenuId)
                if (!t) return
                Alert.alert('Excluir mesa', `Excluir "${t.name}"?`, [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Excluir', style: 'destructive', onPress: () => vm.remove(t.id) },
                ])
                setOpenMenuId(undefined)
              }}
              style={({ pressed }) => [{ paddingVertical: 8 }, pressed ? { opacity: 0.8 } : null]}
            >
              <Text style={[styles.kebabItem, { color: '#B3261E' }]}>Excluir mesa</Text>
            </Pressable>
          </View>
        </>
      )}
      {(() => {
        const fabEnabled = !!accessCode && /^\d{9}$/.test(accessCode)
        return (
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: pressed ? '#E67E22' : colors.primary,
            shadowOpacity: 0.2,
            opacity: fabEnabled ? 1 : 0.6,
            display: showFab ? 'flex' : 'none',
          },
        ]}
        disabled={!fabEnabled}
        onPress={createVM.open}
      >
        <Ionicons name="add" size={24} color={colors.text.inverted} />
      </Pressable>
        )
      })()}
      <Modal visible={createVM.isOpen} transparent animationType="fade" onRequestClose={createVM.close}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={createVM.close} />
          <Animated.View style={[
            styles.modalCard,
            { 
              transform: [{ translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
              opacity: modalAnim,
            }
          ]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
              <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                <Text style={styles.modalTitle}>Nova Mesa</Text>
              </View>
                  <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                    <Text style={styles.label}>Nome da mesa</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        placeholder="Digite o nome da mesa"
                        placeholderTextColor={colors.text.secondary}
                        value={createVM.name}
                        onChangeText={createVM.setName}
                        style={styles.input}
                      />
                    </View>
                  </View>
                  <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                    <Text style={styles.label}>Nome do garçom</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        placeholder="Informe o nome do garçom"
                        placeholderTextColor={colors.text.secondary}
                        value={createVM.waiterName}
                        onChangeText={createVM.setWaiterName}
                        style={styles.input}
                      />
                    </View>
                  </View>
                  <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                    <Text style={styles.label}>Observações</Text>
                    <View style={[styles.inputBox, { minHeight: 96 }]}>
                      <TextInput
                        placeholder="Adicione observações sobre a mesa"
                        placeholderTextColor={colors.text.secondary}
                        value={createVM.notes}
                        onChangeText={createVM.setNotes}
                        style={[styles.input, { minHeight: 96 }]}
                        multiline
                      />
                    </View>
                  </View>
                  {createVM.errorMessage ? <Text style={[styles.error, { paddingHorizontal: 16 }]}>{createVM.errorMessage}</Text> : null}
                  <View style={styles.modalFooter}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.secondaryBtn,
                        { borderColor: colors.primary, backgroundColor: '#FFF', opacity: pressed ? 0.8 : 1 },
                      ]}
                      onPress={createVM.close}
                    >
                      <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Cancelar</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.primaryBtn,
                        { backgroundColor: pressed ? '#E67E22' : colors.primary, opacity: createVM.canSubmit ? 1 : 0.7 },
                      ]}
                      disabled={!createVM.canSubmit || createVM.isLoading}
                      onPress={async () => {
                        const created = await createVM.submit()
                        if (created) {
                          vm.refresh()
                        }
                      }}
                    >
                      <Text style={styles.primaryBtnText}>Salvar</Text>
                    </Pressable>
                  </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditOpen(false)} />
          <Animated.View style={[styles.modalCard]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
              <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                <Text style={styles.modalTitle}>Editar Mesa</Text>
              </View>
              <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                <Text style={styles.label}>Nome da mesa</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    placeholder="Digite o nome da mesa"
                    placeholderTextColor={colors.text.secondary}
                    value={editName}
                    onChangeText={setEditName}
                    style={styles.input}
                  />
                </View>
              </View>
              <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                <Text style={styles.label}>Nome do garçom</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    placeholder="Informe o nome do garçom"
                    placeholderTextColor={colors.text.secondary}
                    value={editWaiter}
                    onChangeText={setEditWaiter}
                    style={styles.input}
                  />
                </View>
              </View>
              <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                <Text style={styles.label}>Observações</Text>
                <View style={[styles.inputBox, { minHeight: 96 }]}>
                  <TextInput
                    placeholder="Adicione observações sobre a mesa"
                    placeholderTextColor={colors.text.secondary}
                    value={editNotes}
                    onChangeText={setEditNotes}
                    style={[styles.input, { minHeight: 96 }]}
                    multiline
                  />
                </View>
              </View>
              <View style={styles.modalFooter}>
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    { borderColor: colors.primary, backgroundColor: '#FFF', opacity: pressed ? 0.8 : 1 },
                  ]}
                  onPress={() => setEditOpen(false)}
                >
                  <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { backgroundColor: pressed ? '#E67E22' : colors.primary, opacity: editName.trim() ? 1 : 0.7 },
                  ]}
                  disabled={!editName.trim()}
                  onPress={async () => {
                    if (!editId) return
                    await container.getUpdateTableUseCase().execute(editId, {
                      name: editName.trim(),
                      waiterName: editWaiter.trim() || undefined,
                      notes: editNotes.trim() || undefined,
                    } as any)
                    setEditOpen(false)
                    setEditId(undefined)
                    setEditName('')
                    setEditWaiter('')
                    setEditNotes('')
                    vm.refresh()
                  }}
                >
                  <Text style={styles.primaryBtnText}>Salvar</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 12 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, gap: 10 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFEAE2' },
  avatar: { backgroundColor: '#DDD9D2' },
  empty: { color: colors.text.secondary, fontSize: typography.size.md, textAlign: 'center', marginTop: 32 },
  title: { fontSize: typography.size.lg, fontWeight: 'bold', color: colors.text.primary, marginTop: 14, marginBottom: 8 },
  helper: { color: colors.text.secondary },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12, marginVertical: 12 },
  statLabel: { color: colors.text.secondary, marginBottom: 6 },
  statValue: { color: colors.text.primary, fontSize: typography.size.md, marginBottom: 6 },
  link: { color: colors.primary },
  list: { marginTop: 8 },
  tableCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 4,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6
  },
  tableRow: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 12 },
  badge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.text.inverted, fontWeight: 'bold' },
  tableTitle: { color: colors.text.primary, fontSize: typography.size.md, fontWeight: '600' },
  tableSubtitle: { color: colors.text.secondary },
  tableStatus: { marginTop: 2, fontSize: typography.size.sm, fontWeight: '600' },
  tableNotes: { color: colors.text.secondary, marginTop: 2 },
  totalPill: { marginTop: 2, backgroundColor: '#E6F3E6', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, alignSelf: 'flex-end' },
  totalPillText: { color: '#3A8F3A', fontWeight: '700' },
  inputBox: { backgroundColor: '#EDEAE4', borderColor: colors.border, borderWidth: 1, borderRadius: 8 },
  input: { paddingHorizontal: 12, paddingVertical: 12, color: colors.text.primary, fontSize: typography.size.md },
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
  kebabMenu: {
    position: 'absolute',
    right: 16,
    top: 8,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    zIndex: 2000,
    elevation: 2,
  },
  kebabItem: { color: colors.text.primary },
  menu: {
    position: 'absolute',
    top: 56,
    right: 16,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 1000,
    elevation: 3,
  },
  menuItem: { color: colors.text.primary, paddingVertical: 6 },
  codePill: { backgroundColor: '#EFEAE2', borderColor: colors.border, borderWidth: 1, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 },
  codePillText: { color: colors.text.primary, fontSize: typography.size.sm },
  error: { color: colors.status.error, textAlign: 'center', marginTop: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitle: { fontSize: typography.size.lg, fontWeight: 'bold', color: colors.text.primary },
  label: { color: colors.text.secondary, marginBottom: 6 },
  modalFooter: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  secondaryBtn: { flex: 1, borderWidth: 1, borderRadius: 24, justifyContent: 'center', alignItems: 'center', height: 48 },
  secondaryBtnText: { fontSize: typography.size.md, fontWeight: 'bold' },
  primaryBtn: { flex: 1, borderRadius: 24, justifyContent: 'center', alignItems: 'center', height: 48 },
  primaryBtnText: { color: colors.text.inverted, fontSize: typography.size.md, fontWeight: 'bold' },
})
