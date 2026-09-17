import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Product, CartItem, OrderRecord } from './src/types/pos';
import { INITIAL_PRODUCTS, LocalRepository } from './src/database/repository';
import { useAuthStore } from './src/stores/auth-store';
import { useShiftStore } from './src/stores/shift-store';
import { useCartStore } from './src/stores/cart-store';
import { getULID } from './src/utils/ulid';
import { buildCustomerReceipt, buildKitchenOrderTicket } from './src/utils/escpos';
import { SyncEngine } from './src/services/sync-engine';

export default function App() {
  // Navigation tabs: 'pos' | 'kds' | 'reports'
  const [activeTab, setActiveTab] = useState<'pos' | 'kds' | 'reports'>('pos');
  const [isOnline, setIsOnline] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);

  // Auth & Shift Stores
  const { session, isAuthenticated, login, logout } = useAuthStore();
  const { activeShift, openShift, recordSale, closeShift } = useShiftStore();
  const cart = useCartStore();

  // Form states for login
  const [loginEmail, setLoginEmail] = useState('kasir@kopitemu.com');
  const [loginPin, setLoginPin] = useState('123456');

  // Modal states
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [initialFloatInput, setInitialFloatInput] = useState('200000');

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'CARD'>('CASH');
  const [cashTendered, setCashTendered] = useState('50000');

  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [actualCashInput, setActualCashInput] = useState('');

  const [printLog, setPrintLog] = useState<string | null>(null);

  useEffect(() => {
    loadLocalData();
  }, []);

  const loadLocalData = async () => {
    const loadedProducts = await LocalRepository.getProducts();
    setProducts(loadedProducts);
    const loadedOrders = await LocalRepository.getOrders();
    setRecentOrders(loadedOrders);
  };

  // 1. Alur Login Kasir
  const handleLogin = () => {
    if (loginPin.length < 4) {
      Alert.alert('PIN Invalid', 'Masukkan PIN kasir 6-digit');
      return;
    }

    login({
      staffId: 'STF-' + loginPin.slice(-4),
      name: 'Ahmad Fauzi (Kasir)',
      email: loginEmail,
      role: 'CASHIER',
      branchId: 'BR-01',
      branchName: 'Kopi Ruang Temu - Cabang Utama',
      merchantId: 'MCH-01',
      token: 'jwt-mock-staff-token',
    });

    // Jika belum ada shift aktif, paksa buka shift dengan modal awal kas
    if (!activeShift) {
      setShowOpenShiftModal(true);
    }
  };

  // 2. Alur Pembukaan Shift Kasir (Modal Kas Awal)
  const handleOpenShift = async () => {
    const floatAmount = parseInt(initialFloatInput, 10) || 0;
    const shift = openShift('STF-DEMO', 'BR-01', 'MCH-01', floatAmount);
    await LocalRepository.saveShift(shift);
    setShowOpenShiftModal(false);
    Alert.alert('Shift Dimulai', `Modal kas awal Rp ${floatAmount.toLocaleString('id-ID')} tercatat.`);
  };

  // 3. Alur Checkout & Pembayaran
  const handleCheckoutSubmit = async () => {
    if (cart.items.length === 0) return;

    const total = cart.getTotal();
    const tendered = parseInt(cashTendered, 10) || total;

    if (paymentMethod === 'CASH' && tendered < total) {
      Alert.alert('Uang Kurang', 'Jumlah uang tunai yang dimasukkan kurang dari total tagihan.');
      return;
    }

    const orderId = getULID();
    const newOrder: OrderRecord = {
      id: orderId,
      shiftId: activeShift?.id || 'SHIFT-DEMO',
      branchId: session?.branchId || 'BR-01',
      cashierStaffId: session?.staffId || 'STF-DEMO',
      tableNumber: cart.tableNumber,
      customerName: cart.customerName || 'Pelanggan Meja ' + cart.tableNumber,
      subtotal: cart.getSubtotal(),
      taxAmount: cart.getTaxAmount(),
      discountAmount: 0,
      totalAmount: total,
      paymentMethod,
      paymentStatus: 'PAID',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      isSynced: isOnline,
      items: cart.items.map((ci) => ({
        id: getULID(),
        orderId,
        productId: ci.product.id,
        productName: ci.product.name,
        quantity: ci.quantity,
        unitPrice: ci.product.price,
        subtotal: ci.quantity * ci.product.price,
        notes: ci.notes,
      })),
    };

    // Simpan ke SQLite lokal
    await LocalRepository.saveOrder(newOrder);

    // Update shift record
    recordSale(total, paymentMethod === 'CASH');

    // Generate ESC/POS Printer Commands (Bluetooth)
    const receiptData = {
      storeName: 'KOPI RUANG TEMU',
      branchName: session?.branchName || 'Cabang Utama',
      branchAddress: 'Jl. ZA. Pagar Alam No. 42, Bandar Lampung',
      orderId,
      cashierName: session?.name || 'Kasir',
      tableNumber: cart.tableNumber,
      customerName: cart.customerName,
      items: cart.items.map((i) => ({
        name: i.product.name,
        qty: i.quantity,
        price: i.product.price,
        notes: i.notes,
      })),
      subtotal: cart.getSubtotal(),
      taxAmount: cart.getTaxAmount(),
      discountAmount: 0,
      total,
      cashGiven: paymentMethod === 'CASH' ? tendered : undefined,
      change: paymentMethod === 'CASH' ? tendered - total : undefined,
      paymentMethod,
      date: new Date().toLocaleTimeString('id-ID'),
    };

    const customerBytes = buildCustomerReceipt(receiptData);
    const kitchenBytes = buildKitchenOrderTicket(receiptData);

    setPrintLog(
      `[ESC/POS BLE DRIVER]\nStruk Kasir: ${customerBytes.byteLength} bytes terkirim ke Thermal 58mm\nTiket Dapur: ${kitchenBytes.byteLength} bytes terkirim ke KDS Printer`
    );

    // Update state order
    setRecentOrders([newOrder, ...recentOrders]);
    cart.clearCart();
    setShowCheckoutModal(false);

    if (isOnline) {
      SyncEngine.syncPending(session?.token);
    }

    Alert.alert(
      'Transaksi Berhasil!',
      `Order #${orderId.slice(-6)} sukses.\nKembalian: Rp ${Math.max(0, tendered - total).toLocaleString('id-ID')}`
    );
  };

  // 4. Alur Penutupan Shift Kasir (Close Shift & Rekonsiliasi Kas)
  const handleCloseShiftSubmit = async () => {
    const actualCash = parseInt(actualCashInput, 10) || 0;
    try {
      const { variance, shift } = closeShift(actualCash);
      await LocalRepository.saveShift(shift);
      setShowCloseShiftModal(false);

      const varianceText =
        variance === 0
          ? 'PAS (Tidak ada selisih)'
          : variance > 0
          ? `SURPLUS +Rp ${variance.toLocaleString('id-ID')}`
          : `MINUS -Rp ${Math.abs(variance).toLocaleString('id-ID')}`;

      Alert.alert(
        'Shift Ditutup (Z-Report)',
        `Total Penjualan: Rp ${shift.totalCashSales + shift.totalNonCash}\nUang Fisik Kasir: Rp ${actualCash.toLocaleString(
          'id-ID'
        )}\nStatus Selisih: ${varianceText}`
      );
      setActualCashInput('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Tampilan belum login
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.darkContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loginCard}>
          <View style={styles.badgeRow}>
            <View style={styles.greenBadge}>
              <Text style={styles.greenBadgeText}>● Offline-First Terminal</Text>
            </View>
          </View>
          <Text style={styles.brandTitle}>LampungDev POS</Text>
          <Text style={styles.brandSubtitle}>
            Aplikasi Kasir Tablet & Mobile untuk Entrepreneur Kafe
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Staf Kasir</Text>
            <TextInput
              style={styles.input}
              value={loginEmail}
              onChangeText={setLoginEmail}
              placeholder="kasir@kopitemu.com"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kode PIN Kasir (6-Digit)</Text>
            <TextInput
              style={[styles.input, styles.pinInput]}
              value={loginPin}
              onChangeText={setLoginPin}
              placeholder="123456"
              placeholderTextColor="#64748b"
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Masuk ke Kasir POS</Text>
          </TouchableOpacity>

          <Text style={styles.loginHint}>
            Demo Mode: Gunakan PIN default 123456 untuk simulasi kasir.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Filter kategori
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.categoryId === selectedCategory);

  return (
    <SafeAreaView style={styles.darkContainer}>
      <StatusBar barStyle="light-content" />

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brandTextSmall}>LampungDev POS</Text>
          <View style={styles.branchPill}>
            <Text style={styles.branchPillText}>{session?.branchName}</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'pos' && styles.activeTabButton]}
            onPress={() => setActiveTab('pos')}
          >
            <Text style={[styles.tabText, activeTab === 'pos' && styles.activeTabText]}>
              Kasir POS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'kds' && styles.activeTabButton]}
            onPress={() => setActiveTab('kds')}
          >
            <Text style={[styles.tabText, activeTab === 'kds' && styles.activeTabText]}>
              KDS Dapur
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'reports' && styles.activeTabButton]}
            onPress={() => setActiveTab('reports')}
          >
            <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
              Shift & Struk
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Koneksi & Staf Info */}
        <View style={styles.topRight}>
          <TouchableOpacity
            style={[styles.netPill, isOnline ? styles.onlinePill : styles.offlinePill]}
            onPress={() => setIsOnline(!isOnline)}
          >
            <Text style={styles.netPillText}>{isOnline ? '● Online' : '○ Offline Mode'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shiftPill}
            onPress={() => setShowCloseShiftModal(true)}
          >
            <Text style={styles.shiftPillText}>
              Shift: {activeShift ? `Rp ${activeShift.expectedCashEnd.toLocaleString('id-ID')}` : 'Tutup'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutPill} onPress={logout}>
            <Text style={styles.logoutText}>Keluar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN CONTENT BASED ON TAB */}
      {activeTab === 'pos' && (
        <View style={styles.mainSplit}>
          {/* SISI KIRI: KATALOG MENU */}
          <View style={styles.catalogPane}>
            {/* Kategori Bar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
              {[
                { id: 'all', label: 'Semua Menu' },
                { id: 'espresso', label: 'Espresso' },
                { id: 'milk', label: 'Milk Based' },
                { id: 'signature', label: 'Signature' },
                { id: 'manual', label: 'Manual Brew' },
                { id: 'pastry', label: 'Pastry & Snack' },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryPill, selectedCategory === cat.id && styles.activeCategoryPill]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      selectedCategory === cat.id && styles.activeCategoryPillText,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Grid Produk */}
            <FlatList
              data={filteredProducts}
              numColumns={3}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.productGrid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.productCard}
                  activeOpacity={0.8}
                  onPress={() => cart.addItem(item)}
                >
                  <View style={styles.productIconBox}>
                    <Text style={styles.productIconText}>☕</Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    Rp {item.price.toLocaleString('id-ID')}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* SISI KANAN: KERANJANG & CHECKOUT */}
          <View style={styles.cartPane}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Pesanan Meja #{cart.tableNumber}</Text>
              <TextInput
                style={styles.tableInput}
                value={cart.tableNumber}
                onChangeText={cart.setTableNumber}
                placeholder="Meja"
                placeholderTextColor="#64748b"
                maxLength={4}
              />
            </View>

            <TextInput
              style={styles.customerInput}
              value={cart.customerName}
              onChangeText={cart.setCustomerName}
              placeholder="Nama Pelanggan (opsional)"
              placeholderTextColor="#64748b"
            />

            {/* List Item Keranjang */}
            <ScrollView style={styles.cartList}>
              {cart.items.length === 0 ? (
                <View style={styles.emptyCart}>
                  <Text style={styles.emptyCartText}>Keranjang masih kosong</Text>
                  <Text style={styles.emptyCartSub}>Pilih menu di samping untuk menambahkan</Text>
                </View>
              ) : (
                cart.items.map((item) => (
                  <View key={item.product.id} style={styles.cartItemRow}>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.product.name}</Text>
                      <Text style={styles.cartItemPrice}>
                        Rp {item.product.price.toLocaleString('id-ID')}
                      </Text>
                    </View>

                    <View style={styles.qtyControl}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => cart.updateQuantity(item.product.id, -1)}
                      >
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => cart.updateQuantity(item.product.id, 1)}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Ringkasan & Tombol Bayar */}
            <View style={styles.cartFooter}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  Rp {cart.getSubtotal().toLocaleString('id-ID')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>PB1 (10%)</Text>
                <Text style={styles.summaryValue}>
                  Rp {cart.getTaxAmount().toLocaleString('id-ID')}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalValue}>
                  Rp {cart.getTotal().toLocaleString('id-ID')}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.checkoutBtn, cart.items.length === 0 && styles.disabledBtn]}
                disabled={cart.items.length === 0}
                onPress={() => {
                  setCashTendered(cart.getTotal().toString());
                  setShowCheckoutModal(true);
                }}
              >
                <Text style={styles.checkoutBtnText}>Bayar & Cetak Struk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* TAB KDS (KITCHEN DISPLAY SYSTEM) */}
      {activeTab === 'kds' && (
        <ScrollView contentContainerStyle={styles.kdsContainer}>
          <View style={styles.kdsHeader}>
            <Text style={styles.kdsTitle}>Kitchen Display System (KDS)</Text>
            <Text style={styles.kdsSubtitle}>
              Pesanan baru otomatis berdering & auto-print tiket pesanan barista
            </Text>
          </View>

          <View style={styles.kdsGrid}>
            {recentOrders.length === 0 ? (
              <Text style={styles.kdsEmpty}>Belum ada pesanan aktif di dapur</Text>
            ) : (
              recentOrders.map((order, idx) => (
                <View key={order.id} style={styles.kdsCard}>
                  <View style={styles.kdsCardTop}>
                    <Text style={styles.kdsTable}>MEJA #{order.tableNumber || '-'}</Text>
                    <Text style={styles.kdsTimer}>#{order.id.slice(-6)}</Text>
                  </View>
                  <Text style={styles.kdsCustomer}>Atas Nama: {order.customerName}</Text>
                  <View style={styles.kdsDivider} />
                  {order.items.map((it) => (
                    <View key={it.id} style={styles.kdsItemRow}>
                      <Text style={styles.kdsItemQty}>{it.quantity}x</Text>
                      <Text style={styles.kdsItemName}>{it.productName}</Text>
                    </View>
                  ))}
                  <View style={styles.kdsStatusRow}>
                    <View style={styles.kdsStatusPill}>
                      <Text style={styles.kdsStatusText}>SEDANG DISIAPKAN</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* TAB REPORTS & REKAP SHIFT */}
      {activeTab === 'reports' && (
        <ScrollView style={styles.reportsContainer}>
          <Text style={styles.reportsTitle}>Rekap Shift & Transaksi Kasir</Text>
          {activeShift && (
            <View style={styles.reportBox}>
              <Text style={styles.reportSubtitle}>Sesi Shift Berjalan</Text>
              <View style={styles.reportRow}>
                <Text style={styles.reportLabel}>Modal Kas Awal</Text>
                <Text style={styles.reportVal}>
                  Rp {activeShift.cashFloatInitial.toLocaleString('id-ID')}
                </Text>
              </View>
              <View style={styles.reportRow}>
                <Text style={styles.reportLabel}>Penjualan Tunai</Text>
                <Text style={styles.reportVal}>
                  Rp {activeShift.totalCashSales.toLocaleString('id-ID')}
                </Text>
              </View>
              <View style={styles.reportRow}>
                <Text style={styles.reportLabel}>Penjualan Non-Tunai</Text>
                <Text style={styles.reportVal}>
                  Rp {activeShift.totalNonCash.toLocaleString('id-ID')}
                </Text>
              </View>
              <View style={styles.reportRow}>
                <Text style={styles.reportLabel}>Total Transaksi</Text>
                <Text style={styles.reportVal}>{activeShift.totalOrdersCount} Order</Text>
              </View>
              <View style={[styles.reportRow, styles.expectedRow]}>
                <Text style={styles.expectedLabel}>Uang Kas Harus Ada di Laci</Text>
                <Text style={styles.expectedVal}>
                  Rp {activeShift.expectedCashEnd.toLocaleString('id-ID')}
                </Text>
              </View>
            </View>
          )}

          {printLog && (
            <View style={styles.printerLogBox}>
              <Text style={styles.printerLogTitle}>Thermal Bluetooth Driver Status</Text>
              <Text style={styles.printerLogContent}>{printLog}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* MODAL 1: BUKA SHIFT & MODAL AWAL */}
      <Modal visible={showOpenShiftModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Buka Shift Kasir Baru</Text>
            <Text style={styles.modalSub}>
              Wajib mengisi modal awal kas di laci kasir sebelum melayani pesanan.
            </Text>

            <Text style={styles.label}>Modal Kas Laci Awal (Cash Float)</Text>
            <TextInput
              style={styles.input}
              value={initialFloatInput}
              onChangeText={setInitialFloatInput}
              keyboardType="number-pad"
              placeholder="Rp 200.000"
              placeholderTextColor="#64748b"
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleOpenShift}>
              <Text style={styles.primaryButtonText}>Mulai Shift Kasir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: CHECKOUT & METODE PEMBAYARAN */}
      <Modal visible={showCheckoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pembayaran Kasir</Text>
            <Text style={styles.checkoutTotalAmount}>
              Rp {cart.getTotal().toLocaleString('id-ID')}
            </Text>

            <View style={styles.methodToggleRow}>
              {(['CASH', 'QRIS', 'CARD'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.methodBtn, paymentMethod === m && styles.activeMethodBtn]}
                  onPress={() => setPaymentMethod(m)}
                >
                  <Text style={[styles.methodBtnText, paymentMethod === m && styles.activeMethodBtnText]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {paymentMethod === 'CASH' && (
              <View style={styles.cashInputSection}>
                <Text style={styles.label}>Uang Diterima dari Pelanggan</Text>
                <TextInput
                  style={styles.input}
                  value={cashTendered}
                  onChangeText={setCashTendered}
                  keyboardType="number-pad"
                />
                <View style={styles.quickCashRow}>
                  {[50000, 100000, 150000].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={styles.quickCashBtn}
                      onPress={() => setCashTendered(amt.toString())}
                    >
                      <Text style={styles.quickCashText}>Rp {amt / 1000}k</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowCheckoutModal(false)}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmCheckoutBtn}
                onPress={handleCheckoutSubmit}
              >
                <Text style={styles.confirmCheckoutBtnText}>Selesaikan Transaksi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: TUTUP SHIFT & REKONSILIASI KAS */}
      <Modal visible={showCloseShiftModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tutup Shift Kasir (End of Day)</Text>
            <Text style={styles.modalSub}>
              Hitung uang fisik di laci kasir dan masukkan ke form ini untuk mendeteksi selisih kas.
            </Text>

            {activeShift && (
              <View style={styles.reconcileBox}>
                <Text style={styles.reconcileText}>
                  Uang Kas Diharapkan: Rp {activeShift.expectedCashEnd.toLocaleString('id-ID')}
                </Text>
              </View>
            )}

            <Text style={styles.label}>Total Uang Fisik Kasir</Text>
            <TextInput
              style={styles.input}
              value={actualCashInput}
              onChangeText={setActualCashInput}
              keyboardType="number-pad"
              placeholder="Contoh: 450000"
              placeholderTextColor="#64748b"
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowCloseShiftModal(false)}
              >
                <Text style={styles.cancelBtnText}>Kembali</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dangerBtn}
                onPress={handleCloseShiftSubmit}
              >
                <Text style={styles.dangerBtnText}>Tutup & Cetak Z-Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  darkContainer: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  loginCard: {
    margin: 24,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginTop: 60,
  },
  badgeRow: {
    marginBottom: 12,
  },
  greenBadge: {
    backgroundColor: '#064e3b',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  greenBadgeText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '600',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#cbd5e1',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 15,
  },
  pinInput: {
    letterSpacing: 6,
    fontSize: 18,
  },
  primaryButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  loginHint: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },

  // TOP BAR
  topBar: {
    height: 56,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTextSmall: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 16,
  },
  branchPill: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  branchPillText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 3,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#059669',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  netPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlinePill: {
    backgroundColor: '#064e3b',
  },
  offlinePill: {
    backgroundColor: '#7f1d1d',
  },
  netPillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  shiftPill: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  shiftPillText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 12,
  },

  // MAIN SPLIT PANE
  mainSplit: {
    flex: 1,
    flexDirection: 'row',
  },
  catalogPane: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
  },
  categoryBar: {
    maxHeight: 48,
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    marginRight: 8,
    justifyContent: 'center',
  },
  activeCategoryPill: {
    backgroundColor: '#10b981',
  },
  categoryPillText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeCategoryPillText: {
    color: '#ffffff',
  },
  productGrid: {
    padding: 12,
  },
  productCard: {
    flex: 1 / 3,
    backgroundColor: '#1e293b',
    margin: 6,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  productIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productIconText: {
    fontSize: 20,
  },
  productName: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 13,
    minHeight: 34,
  },
  productPrice: {
    color: '#34d399',
    fontWeight: '700',
    fontSize: 13,
    marginTop: 4,
  },

  // CART PANE
  cartPane: {
    width: 320,
    backgroundColor: '#0b1120',
    display: 'flex',
    flexDirection: 'column',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  cartTitle: {
    color: '#f8fafc',
    fontWeight: 'bold',
    fontSize: 15,
  },
  tableInput: {
    width: 60,
    backgroundColor: '#1e293b',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#f8fafc',
    fontSize: 13,
    textAlign: 'center',
  },
  customerInput: {
    backgroundColor: '#111827',
    margin: 12,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    color: '#f8fafc',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cartList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  emptyCart: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyCartText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyCartSub: {
    color: '#475569',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '500',
  },
  cartItemPrice: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    color: '#f8fafc',
    fontWeight: 'bold',
  },
  qtyText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 13,
  },
  cartFooter: {
    padding: 12,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  summaryValue: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    marginBottom: 12,
  },
  totalLabel: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutBtn: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#334155',
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },

  // KDS TAB
  kdsContainer: {
    padding: 16,
  },
  kdsHeader: {
    marginBottom: 16,
  },
  kdsTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
  },
  kdsSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
  },
  kdsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  kdsEmpty: {
    color: '#64748b',
    fontSize: 14,
    paddingVertical: 32,
  },
  kdsCard: {
    width: 260,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  kdsCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  kdsTable: {
    color: '#f8fafc',
    fontWeight: 'bold',
    fontSize: 15,
  },
  kdsTimer: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '600',
  },
  kdsCustomer: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  kdsDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 8,
  },
  kdsItemRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  kdsItemQty: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 13,
  },
  kdsItemName: {
    color: '#f8fafc',
    fontSize: 13,
  },
  kdsStatusRow: {
    marginTop: 12,
  },
  kdsStatusPill: {
    backgroundColor: '#78350f',
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  kdsStatusText: {
    color: '#fde68a',
    fontSize: 11,
    fontWeight: '700',
  },

  // REPORTS TAB
  reportsContainer: {
    padding: 20,
  },
  reportsTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reportBox: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reportSubtitle: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  reportLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  reportVal: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  expectedRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  expectedLabel: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  expectedVal: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  printerLogBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  printerLogTitle: {
    color: '#a855f7',
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 6,
  },
  printerLogContent: {
    color: '#e2e8f0',
    fontSize: 11,
    fontFamily: 'Courier',
  },

  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalSub: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 16,
  },
  checkoutTotalAmount: {
    color: '#10b981',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
  },
  methodToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  methodBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeMethodBtn: {
    backgroundColor: '#059669',
  },
  methodBtnText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 13,
  },
  activeMethodBtnText: {
    color: '#ffffff',
  },
  cashInputSection: {
    marginBottom: 16,
  },
  quickCashRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickCashBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickCashText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  confirmCheckoutBtn: {
    flex: 2,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmCheckoutBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  reconcileBox: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reconcileText: {
    color: '#38bdf8',
    fontWeight: '600',
  },
  dangerBtn: {
    flex: 2,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
