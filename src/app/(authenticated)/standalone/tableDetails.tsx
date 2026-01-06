import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { colors, typography } from "../../theme/theme";
import { useAppState } from "../../state/AppState";
import { container } from "../../../di/container";
import { useTableDetailsViewModel } from "../../../viewmodel/TableDetailsViewModel";
import { ProductCategory } from "../../../model/entities/Product";
import { Picker } from "@react-native-picker/picker";

export default function TableDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessCode } = useAppState();
  const vm = useTableDetailsViewModel(
    container.getGetTableByIdUseCase(),
    container.getUpdateTableUseCase(),
    container.getDeleteTableUseCase(),
    container.getListProductsByCodeUseCase(),
    String(id),
    accessCode
  );
  const [selectedProductId, setSelectedProductId] = useState<
    string | undefined
  >(undefined);
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | "Todos"
  >("Todos");
  const [quantity, setQuantity] = useState(1);
  const categories: (ProductCategory | "Todos")[] = useMemo(
    () => ["Todos", "Bebidas", "Pizzas", "Pratos", "Petiscos", "Sobremesas"],
    []
  );
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Todos") return vm.products;
    return vm.products.filter((p) => (p as any).category === selectedCategory);
  }, [vm.products, selectedCategory]);
  const canAdd = useMemo(
    () => !!selectedProductId && quantity >= 1,
    [selectedProductId, quantity]
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>{vm.table?.name || "Mesa"}</Text>
        <View style={{ width: 24 }} />
      </View>

      {vm.errorMessage ? (
        <Text style={styles.error}>{vm.errorMessage}</Text>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pedidos</Text>
        <Pressable
          onPress={() => vm.setShowAddModal(true)}
          style={({ pressed }) => [
            styles.addBtn,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="add" size={20} color={colors.text.inverted} />
          <Text style={styles.addBtnText}>Adicionar pedido</Text>
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 4, paddingTop: 8 }}>
        <Pressable
          onPress={vm.release}
          style={({ pressed }) => [
            styles.secondaryBtn,
            {
              borderColor: colors.primary,
              backgroundColor: "#FFF",
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>
            Liberar Mesa
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {vm.orders.length === 0 ? (
          <Text style={styles.empty}>Nenhum pedido adicionado</Text>
        ) : (
          vm.orders.map((o) => (
            <View key={o.id} style={styles.orderCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderTitle}>{o.name}</Text>
                <Text style={styles.orderSubtitle}>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(o.price)}
                </Text>
              </View>
              <View style={styles.qtyBox}>
                <Pressable
                  onPress={() =>
                    vm.updateQuantity(o.id, Math.max(1, o.quantity - 1))
                  }
                  style={styles.qtyBtn}
                >
                  <Ionicons
                    name="remove"
                    size={16}
                    color={colors.text.primary}
                  />
                </Pressable>
                <Text style={styles.qtyValue}>{o.quantity}</Text>
                <Pressable
                  onPress={() => vm.updateQuantity(o.id, o.quantity + 1)}
                  style={styles.qtyBtn}
                >
                  <Ionicons name="add" size={16} color={colors.text.primary} />
                </Pressable>
              </View>
              <Pressable
                onPress={() => vm.removeOrder(o.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash" size={18} color={colors.text.inverted} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(vm.total)}
          </Text>
        </View>
        <Pressable
          onPress={async () => {
            await vm.removeTable();
            router.replace("/(authenticated)/(tabs)/dashboard");
          }}
          style={({ pressed }) => [
            styles.dangerBtn,
            { backgroundColor: pressed ? "#9F1F17" : "#B3261E" },
          ]}
        >
          <Text style={styles.dangerBtnText}>Excluir mesa</Text>
        </Pressable>
        <Pressable
          onPress={async () => {
            await vm.save();
            router.replace("/(authenticated)/(tabs)/dashboard");
          }}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: pressed ? "#E67E22" : colors.primary },
          ]}
        >
          <Text style={styles.primaryBtnText}>Salvar</Text>
        </Pressable>
      </View>

      <Modal
        visible={vm.showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => vm.setShowAddModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => vm.setShowAddModal(false)} />
          <View style={styles.modalCard}>
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
              <Text style={styles.modalTitle}>Adicionar pedido</Text>
            </View>
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 16,
              }}
            >
              <View style={{ paddingTop: 8 }}>
                <Text style={styles.label}>Categoria</Text>
                <View style={styles.selectBox}>
                  <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(value) => {
                      setSelectedCategory(value as any);
                      setSelectedProductId(undefined);
                    }}
                    mode="dropdown"
                    dropdownIconColor={colors.text.secondary}
                    style={{ height: 48, width: '100%', color: colors.text.primary }}
                    itemStyle={{ fontSize: typography.size.md }}
                  >
                    {categories.map(c => (
                      <Picker.Item key={String(c)} label={String(c)} value={c} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={{ paddingTop: 8 }}>
                <Text style={styles.label}>Produto</Text>
                <View style={styles.selectBox}>
                  <Picker
                    selectedValue={selectedProductId || ''}
                    onValueChange={(value) => setSelectedProductId(value || undefined)}
                    mode="dropdown"
                    dropdownIconColor={colors.text.secondary}
                    style={{ height: 48, width: '100%', color: colors.text.primary }}
                    itemStyle={{ fontSize: typography.size.md }}
                  >
                    <Picker.Item label="Selecione um produto" value="" />
                    {(selectedCategory === 'Todos' ? vm.products : filteredProducts).map(p => (
                      <Picker.Item key={p.id} label={p.name} value={p.id} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={{ paddingTop: 8 }}>
                <Text style={styles.label}>Quantidade</Text>
                <View style={styles.qtyControl}>
                  <Pressable
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={({ pressed }) => [
                      styles.qtyCtrlBtn,
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={colors.text.primary}
                    />
                  </Pressable>
                  <Text style={styles.qtyCtrlValue}>{quantity}</Text>
                  <Pressable
                    onPress={() => setQuantity((q) => q + 1)}
                    style={({ pressed }) => [
                      styles.qtyCtrlBtn,
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <Ionicons
                      name="add"
                      size={18}
                      color={colors.text.primary}
                    />
                  </Pressable>
                </View>
              </View>
              <View style={styles.modalFooter}>
                <Pressable
                  onPress={() => vm.setShowAddModal(false)}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    {
                      borderColor: colors.primary,
                      backgroundColor: "#FFF",
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[styles.secondaryBtnText, { color: colors.primary }]}
                  >
                    Cancelar
                  </Text>
                </Pressable>
                <Pressable
                  disabled={!canAdd}
                  onPress={() => {
                    if (selectedProductId) {
                      vm.addOrder(selectedProductId, quantity);
                      setSelectedProductId(undefined);
                      setQuantity(1);
                      vm.setShowAddModal(false);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: pressed ? "#E67E22" : colors.primary,
                      opacity: canAdd ? 1 : 0.7,
                    },
                  ]}
                >
                  <Text style={styles.primaryBtnText}>Adicionar</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 50,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: "600",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: colors.text.inverted, fontWeight: "bold" },
  listContainer: { paddingTop: 8, paddingBottom: 88 },
  empty: { color: colors.text.secondary, textAlign: "center", marginTop: 16 },
  orderCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderTitle: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: "600",
  },
  orderSubtitle: { color: colors.text.secondary },
  qtyBox: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    color: colors.text.primary,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B3261E",
  },
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  totalLabel: { color: colors.text.secondary },
  totalValue: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: "700",
  },
  primaryBtn: { borderRadius: 24, paddingHorizontal: 50, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', },
  primaryBtnText: { color: colors.text.inverted, fontWeight: "bold" },
  dangerBtn: { borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10 },
  dangerBtnText: { color: colors.text.inverted, fontWeight: "bold" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  label: { color: colors.text.secondary, marginBottom: 6 },
  inputBox: {
    backgroundColor: "#EDEAE4",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.text.primary,
    fontSize: typography.size.md,
  },
  selectBox: {
    backgroundColor: "#EDEAE4",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  selectChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: "#DDD9D2",
  },
  selectChipActive: { backgroundColor: "#C7BBA5" },
  selectChipText: { color: colors.text.primary },
  selectChipTextActive: { color: colors.text.inverted },
  error: { color: colors.status.error, textAlign: "center", marginTop: 8 },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
  },
  secondaryBtnText: { fontSize: typography.size.md, fontWeight: "bold" },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 8,
  },
  qtyCtrlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyCtrlValue: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
});
