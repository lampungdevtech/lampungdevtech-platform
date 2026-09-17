import { ReceiptData } from '../types/pos';

export class EscPosBuilder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  public init(): this {
    this.buffer.push(0x1B, 0x40); // ESC @ (Initialize printer)
    return this;
  }

  public alignLeft(): this {
    this.buffer.push(0x1B, 0x61, 0x00);
    return this;
  }

  public alignCenter(): this {
    this.buffer.push(0x1B, 0x61, 0x01);
    return this;
  }

  public alignRight(): this {
    this.buffer.push(0x1B, 0x61, 0x02);
    return this;
  }

  public setBold(enabled: boolean): this {
    this.buffer.push(0x1B, 0x45, enabled ? 0x01 : 0x00);
    return this;
  }

  public setDoubleSize(enabled: boolean): this {
    this.buffer.push(0x1D, 0x21, enabled ? 0x11 : 0x00);
    return this;
  }

  public text(str: string): this {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  public textLine(str: string = ''): this {
    this.text(str + '\n');
    return this;
  }

  public separator(char: string = '-', length: number = 32): this {
    this.textLine(char.repeat(length));
    return this;
  }

  public lineItem(left: string, right: string, totalWidth: number = 32): this {
    const available = totalWidth - right.length;
    let truncatedLeft = left;
    if (left.length > available - 1) {
      truncatedLeft = left.substring(0, Math.max(1, available - 2)) + ' ';
    }
    const spaces = ' '.repeat(Math.max(1, totalWidth - truncatedLeft.length - right.length));
    this.textLine(`${truncatedLeft}${spaces}${right}`);
    return this;
  }

  public feed(lines: number = 3): this {
    this.buffer.push(0x1B, 0x64, lines);
    return this;
  }

  public cut(): this {
    this.feed(3);
    this.buffer.push(0x1D, 0x56, 0x41, 0x10); // GS V 65 16 (Full / partial cut)
    return this;
  }

  public build(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

/**
 * Generate binary ESC/POS commands for printing Cashier Customer Receipt
 */
export function buildCustomerReceipt(data: ReceiptData): Uint8Array {
  const p = new EscPosBuilder();

  // Header Toko
  p.alignCenter()
    .setDoubleSize(true)
    .textLine(data.storeName)
    .setDoubleSize(false)
    .textLine(data.branchName)
    .textLine(data.branchAddress)
    .separator('=')
    .alignLeft();

  // Transaksi Info
  p.lineItem('No. Order', `#${data.orderId.slice(-8)}`)
    .lineItem('Waktu', data.date)
    .lineItem('Kasir', data.cashierName);

  if (data.tableNumber) {
    p.lineItem('Nomor Meja', data.tableNumber);
  }
  if (data.customerName) {
    p.lineItem('Pelanggan', data.customerName);
  }

  p.separator('-');

  // Daftar Item
  for (const item of data.items) {
    const qtyPrice = `${item.qty}x Rp${item.price.toLocaleString('id-ID')}`;
    const subtotal = `Rp${(item.qty * item.price).toLocaleString('id-ID')}`;
    p.textLine(item.name);
    p.lineItem(`  ${qtyPrice}`, subtotal);
    if (item.notes) {
      p.textLine(`  * ${item.notes}`);
    }
  }

  p.separator('-');

  // Total & Pembayaran
  p.lineItem('Subtotal', `Rp${data.subtotal.toLocaleString('id-ID')}`);
  if (data.taxAmount > 0) {
    p.lineItem('Pajak (PB1 10%)', `Rp${data.taxAmount.toLocaleString('id-ID')}`);
  }
  if (data.discountAmount > 0) {
    p.lineItem('Diskon', `-Rp${data.discountAmount.toLocaleString('id-ID')}`);
  }

  p.setBold(true)
    .lineItem('TOTAL TAGIHAN', `Rp${data.total.toLocaleString('id-ID')}`)
    .setBold(false)
    .separator('-');

  p.lineItem('Metode Bayar', data.paymentMethod);
  if (data.cashGiven !== undefined) {
    p.lineItem('Uang Diterima', `Rp${data.cashGiven.toLocaleString('id-ID')}`);
  }
  if (data.change !== undefined) {
    p.lineItem('Kembalian', `Rp${data.change.toLocaleString('id-ID')}`);
  }

  // Footer Struk
  p.separator('=')
    .alignCenter()
    .textLine('Terima Kasih Telah Berkunjung!')
    .textLine('LampungDev Cafe POS Platform')
    .cut();

  return p.build();
}

/**
 * Generate binary ESC/POS commands for Kitchen Order Ticket (KOT) / Barista Order
 */
export function buildKitchenOrderTicket(data: ReceiptData): Uint8Array {
  const p = new EscPosBuilder();

  p.alignCenter()
    .setDoubleSize(true)
    .setBold(true)
    .textLine('** TIKET DAPUR / BAR **')
    .setDoubleSize(false)
    .setBold(false)
    .separator('=')
    .alignLeft();

  p.setBold(true)
    .lineItem('MEJA', data.tableNumber ? `MEJA #${data.tableNumber}` : 'TAKEAWAY')
    .lineItem('ORDER', `#${data.orderId.slice(-8)}`)
    .setBold(false)
    .lineItem('WAKTU', data.date)
    .lineItem('KASIR', data.cashierName);

  if (data.customerName) {
    p.lineItem('ATAS NAMA', data.customerName);
  }

  p.separator('=');

  // Item list with large font for kitchen readability
  for (const item of data.items) {
    p.setBold(true)
      .textLine(`[ ] ${item.qty}x ${item.name.toUpperCase()}`)
      .setBold(false);

    if (item.notes) {
      p.textLine(`    NOTE: >>> ${item.notes.toUpperCase()} <<<`);
    }
    p.separator('-', 24);
  }

  p.alignCenter()
    .textLine('Segera sajikan setelah siap')
    .cut();

  return p.build();
}
