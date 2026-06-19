/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Printer,
  Barcode,
  Sparkles,
  CreditCard,
  XCircle,
  Pencil
} from "lucide-react";
import { PharmacyMeds, OpticsProduct, TransactionJournal } from "../mockErpData";

interface PosRetailTerminalProps {
  language: "en" | "ar";
  pharmatechStock: PharmacyMeds[];
  opticsCatalog: OpticsProduct[];
  onCheckoutSuccess: (
    updatedMeds: PharmacyMeds[],
    updatedOptics: OpticsProduct[],
    newLedgerEntry: TransactionJournal
  ) => void;
  onClose: () => void;
  appType?: "pharmacy" | "optics";
}

export default function PosRetailTerminal({
  language,
  pharmatechStock,
  opticsCatalog,
  onCheckoutSuccess,
  onClose,
  appType = "pharmacy"
}: PosRetailTerminalProps) {
  const posTab = appType === "optics" ? "optics" : "pharmacy";
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ id: string; name: string; quantity: number; price: number; maxStock: number }[]>([]);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "INSURANCE_SPLIT">("CASH");
  const [receipt, setReceipt] = useState<{
    id: string;
    timestamp: string;
    items: typeof cart;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
  } | null>(null);

  // Filter items in grid
  const filteredMeds = useMemo(() => {
    return pharmatechStock.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.catalogCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pharmatechStock, searchQuery]);

  const filteredOptics = useMemo(() => {
    return opticsCatalog.filter(
      (o) =>
        o.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.model.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [opticsCatalog, searchQuery]);

  const addToCart = (id: string, name: string, price: number, maxStock: number) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === id);
      if (exists) {
        if (exists.quantity >= maxStock) return prev;
        return prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { id, name, price, quantity: 1, maxStock }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.maxStock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as typeof cart
    );
  };

  const startEditPrice = (id: string, currentPrice: number) => {
    setEditingPriceId(id);
    setEditingPriceValue(currentPrice.toFixed(2));
  };

  const confirmEditPrice = (id: string) => {
    const newPrice = parseFloat(editingPriceValue);
    if (!isNaN(newPrice) && newPrice >= 0) {
      setCart(prev => prev.map(item => item.id === id ? { ...item, price: newPrice } : item));
    }
    setEditingPriceId(null);
  };

  const salesSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const salesTax = salesSubtotal * 0.15; // 15% standard hospital sales tax
  const salesTotal = salesSubtotal + salesTax;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // 1. Decrement inventory
    const nextMeds = pharmatechStock.map((m) => {
      const cartItem = cart.find((c) => c.id === m.id);
      if (cartItem) {
        return { ...m, stock: Math.max(0, m.stock - cartItem.quantity) };
      }
      return m;
    });

    const nextOptics = opticsCatalog.map((o) => {
      const cartItem = cart.find((c) => c.id === o.id);
      if (cartItem) {
        return { ...o, showroomStock: Math.max(0, o.showroomStock - cartItem.quantity) };
      }
      return o;
    });

    // 2. Generate transaction chronicle
    const receiptNum = `POS-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const timeFormatted = now.toTimeString().split(" ")[0];

    // Total sales outline description
    const summary = cart.map((c) => `${c.name} (x${c.quantity})`).join(", ");
    const journalEntry: TransactionJournal = {
      id: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: timeFormatted,
      narrative: `POS checkout ${receiptNum}: Retail sale [${summary}]`,
      category: "Revenue",
      debit: salesTotal,
      credit: 0,
      wallet: paymentMethod === "CASH" ? "Main Safe" : "Standard Chartered Bank",
      verifiedBy: posTab === "pharmacy" ? "Licensed Chemist Vance" : "Optician Giles",
      debitAccountCode: "ACC-1110-CASH",
      creditAccountCode: posTab === "pharmacy" ? "ACC-4300-REV-PHARM" : "ACC-4400-REV-OPTICAL",
      costCenter: posTab === "pharmacy" ? "PHARMACY" : "OPTICS"
    };

    // 3. Set receipt payload for printer viewport
    setReceipt({
      id: receiptNum,
      timestamp: now.toLocaleString(),
      items: [...cart],
      subtotal: salesSubtotal,
      tax: salesTax,
      total: salesTotal,
      paymentMethod
    });

    // 4. Pass back stock decrements and accounting lines
    onCheckoutSuccess(nextMeds, nextOptics, journalEntry);
    setCart([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-[#090b10]/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="bg-[var(--clr-bg-main)] w-full max-w-5xl h-[95vh] sm:h-[85vh] rounded-3xl shadow-2xl border border-[#EAE6DF] dark:border-[var(--clr-border-light)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* POS Header Bar - Dual Themed */}
        <div className="bg-white dark:bg-[#0E1019] text-[#0F172A] dark:text-white px-6 py-4 flex items-center justify-between border-b border-[#EAE6DF] dark:border-[#2BBFFF]/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF841A]/10 text-[#FF841A] rounded-xl flex items-center justify-center font-bold shadow-xs">
              <Barcode className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-sans font-black text-sm sm:text-base tracking-wide flex items-center gap-2 text-neutral-800 dark:text-[#F8FAFC]">
                {language === "ar" ? "محطة نقاط البيع السريعة" : "OPERATIONAL CHECKOUT POS TERMINAL"}
                <span className="text-[9px] bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/35 px-1.5 py-0.5 rounded uppercase font-mono tracking-widest font-extrabold animate-pulse">
                  FAST TABLET GATEWAY
                </span>
              </h2>
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-300">
                Immutably pipes instant cash revenue logs straight to Ledger cost-centers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-white/15 flex items-center justify-center transition text-neutral-400 dark:text-neutral-300 hover:text-neutral-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Outer Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Panel: Inventory Grid Selection (7/12 screen) */}
          <div className="flex-1 md:w-3/5 p-4 flex flex-col gap-3 overflow-hidden bg-[var(--clr-sidebar-bg)] border-r border-[var(--clr-border-light)]">
            
            {/* Control Bar: Terminal Division & Search bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black font-mono uppercase text-[var(--clr-brand-blue)] bg-[var(--clr-brand-blue)]/10 dark:bg-[#151824] px-3.5 py-1.5 rounded-lg border border-indigo-150 dark:border-neutral-800">
                  {posTab === "pharmacy" 
                    ? (language === "ar" ? "💊 صيدلية الدواء" : "💊 Rx Pharmacy Terminal") 
                    : (language === "ar" ? "🕶️ نظارات العيون" : "🕶️ Optical Store Terminal")}
                </span>
              </div>

              <div className="relative w-full sm:max-w-xs flex-1 sm:flex-none">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    posTab === "pharmacy"
                      ? language === "ar" ? "بحث عن علاج صيدلي..." : "Search dosage, Rx code..."
                      : language === "ar" ? "بحث عن علامة تجارية أو طراز نظارة..." : "Search brands, lens styles..."
                  }
                  className="w-full bg-white dark:bg-neutral-900 border border-[var(--clr-border-light)] pl-9 pr-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-[#2BBFFF]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Grid Container */}
            <div className="flex-1 overflow-y-auto pr-1">
              {posTab === "pharmacy" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredMeds.map((med) => {
                    const quantityInCart = cart.find((i) => i.id === med.id)?.quantity || 0;
                    return (
                      <button
                        key={med.id}
                        onClick={() => addToCart(med.id, med.name, med.pricePerUnit, med.stock)}
                        disabled={med.stock <= 0}
                        className={`p-3 bg-[var(--clr-bg-card)] rounded-2xl border ${
                          quantityInCart > 0
                            ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10"
                            : "border-[var(--clr-border-light)]"
                        } hover:border-[var(--clr-brand-blue)]/40 text-left transition flex flex-col justify-between h-28 relative hover:shadow-md cursor-pointer`}
                      >
                        {quantityInCart > 0 && (
                          <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-white font-mono text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                            {quantityInCart}
                          </span>
                        )}
                        <div>
                          <span className="text-[8px] font-mono font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">
                            {med.catalogCode}
                          </span>
                          <span className="font-bold text-xs text-neutral-800 dark:text-white line-clamp-1">
                            {med.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 line-clamp-1 block mt-0.5">
                            {med.drugClass}
                          </span>
                        </div>
                        <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-dashed border-[var(--clr-border-light)]/80">
                          <span className="text-sm font-black font-mono text-[var(--clr-brand-blue)]">
                            ${med.pricePerUnit.toFixed(2)}
                          </span>
                          <span className={`text-[9px] font-bold ${med.stock < 50 ? "text-rose-500" : "text-neutral-400"}`}>
                            {med.stock > 0 ? `${med.stock} ${med.unit}s` : "OUT OF STOCK"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredOptics.map((opt) => {
                    const quantityInCart = cart.find((i) => i.id === opt.id)?.quantity || 0;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => addToCart(opt.id, `${opt.brand} - ${opt.model}`, opt.price, opt.showroomStock)}
                        disabled={opt.showroomStock <= 0}
                        className={`p-3 bg-[var(--clr-bg-card)] rounded-2xl border ${
                          quantityInCart > 0
                            ? "border-emerald-500 bg-emerald-50/20"
                            : "border-[var(--clr-border-light)]"
                        } hover:border-[var(--clr-brand-blue)]/40 text-left transition flex flex-col justify-between h-28 relative hover:shadow-md cursor-pointer`}
                      >
                        {quantityInCart > 0 && (
                          <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-white font-mono text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                            {quantityInCart}
                          </span>
                        )}
                        <div>
                          <span className="text-[8px] font-mono font-bold text-neutral-400 uppercase tracking-widest block mb-0.5 animate-pulse">
                            {opt.lensType}
                          </span>
                          <span className="font-bold text-xs text-neutral-800 dark:text-white line-clamp-1">
                            {opt.brand} {opt.model}
                          </span>
                          <span className="text-[9px] text-neutral-400 line-clamp-1 block">
                            {opt.frameStyle} ({opt.material})
                          </span>
                        </div>
                        <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-dashed border-[var(--clr-border-light)]">
                          <span className="text-sm font-black font-mono text-[var(--clr-brand-blue)]">
                            ${opt.price.toFixed(2)}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase">
                            Stk: {opt.showroomStock} units
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Panel: Shopping Basket Cart Summary & Checkouts */}
          <div className="w-full md:w-2/5 border-t md:border-t-0 md:border-l border-[var(--clr-border-light)] p-4 flex flex-col bg-[var(--clr-bg-card)] relative">
            <div className="flex items-center justify-between pb-3 border-b mb-3">
              <span className="font-black text-xs text-neutral-800 dark:text-white uppercase flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-[var(--clr-brand-blue)]" />
                {language === "ar" ? "سلة الشراء الحالية" : "Active Checkout Cart"}
              </span>
              <button
                onClick={() => setCart([])}
                disabled={cart.length === 0}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 disabled:opacity-40 uppercase"
              >
                Clear Cart
              </button>
            </div>

            {/* Cart listing scroll zone */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400 font-medium">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-300 font-bold text-lg mb-2">
                    🛒
                  </div>
                  <p className="text-xs">
                    {language === "ar" ? "اضغط على العناصر المراد بيعها" : "Basket is currently empty. Tap products to add them to checkout state."}
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-[var(--clr-border-light)] dark:border-[#1D2132] flex items-center justify-between gap-3 shrink-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-neutral-800 dark:text-white truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {editingPriceId === item.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-neutral-400">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingPriceValue}
                              onChange={(e) => setEditingPriceValue(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") confirmEditPrice(item.id); }}
                              onBlur={() => confirmEditPrice(item.id)}
                              className="w-16 text-[10px] font-mono font-bold bg-white dark:bg-neutral-800 border border-[var(--clr-brand-blue)] rounded px-1 py-0.5 outline-none"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <>
                            <span className="text-[10px] font-mono text-neutral-400">
                              ${item.price.toFixed(2)} each
                            </span>
                            <button
                              onClick={() => startEditPrice(item.id, item.price)}
                              className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition cursor-pointer"
                              title={language === "ar" ? "تعديل السعر" : "Edit price"}
                            >
                              <Pencil className="w-2.5 h-2.5 text-neutral-400 hover:text-[var(--clr-brand-blue)]" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-[#EEEDE8] dark:bg-neutral-800 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center hover:bg-white dark:hover:bg-neutral-700 rounded transition text-xs font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono text-xs font-bold text-neutral-800 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center hover:bg-white dark:hover:bg-neutral-700 rounded transition text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="w-16 text-right font-mono text-xs font-black text-neutral-800 dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Controls payment type */}
            <div className="space-y-3 pt-3 border-t">
              <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                Billing Method
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
                {(["CASH", "CARD", "INSURANCE_SPLIT"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition ${
                      paymentMethod === method
                        ? "bg-[#0F1E46] text-[#2BBFFF] shadow-xs"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {method === "CASH" && "💵 Cash"}
                    {method === "CARD" && "💳 Card"}
                    {method === "INSURANCE_SPLIT" && "🛡️ Split Pay"}
                  </button>
                ))}
              </div>

              {/* Subtotal summaries */}
              <div className="bg-[#EEEDE8]/50 dark:bg-neutral-900/60 p-3 rounded-2xl border text-xs space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-neutral-400">Cart Subtotal:</span>
                  <span className="font-mono text-neutral-800 dark:text-neutral-300">
                    ${salesSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-neutral-400">Sales Tax (15%):</span>
                  <span className="font-mono text-neutral-800 dark:text-neutral-300">
                    ${salesTax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black border-t pt-1.5 mt-1">
                  <span>Payable Total:</span>
                  <span className="font-mono text-[var(--clr-brand-blue)]">
                    ${salesTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Purchase Trigger */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-extrabold uppercase tracking-widest transition shadow-lg active:scale-95 duration-100 cursor-pointer"
              >
                📥 Checkout & Post to ledger
              </button>
            </div>

            {/* Thermal Slip Preview Frame */}
            {receipt && (
              <div className="absolute inset-0 bg-[#0F1E46]/95 text-white z-20 p-5 flex flex-col justify-between animate-in fade-in duration-200">
                <div className="overflow-y-auto space-y-4 font-mono select-text text-left">
                  <div className="text-center border-b border-dashed border-white/20 pb-4">
                    <h4 className="font-sans font-black tracking-widest text-[#2BBFFF] uppercase">
                      {posTab === "pharmacy" ? "* AL JAWARIH RX PHARMACY *" : "* AL JAWARIH OPTICAL STORE *"}
                    </h4>
                    <p className="text-[10px] text-neutral-300">AL ALAMA HEALTH SECTOR CO.</p>
                    <p className="text-[9px] text-neutral-400">POS CHECKOUT REPLICA - AMMAN, JOR</p>
                  </div>

                  <div className="text-[10px] space-y-1 border-b border-dashed border-white/10 pb-2">
                    <div className="flex justify-between">
                      <span>STATION TERM ID:</span>
                      <span>TERM-009A</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RECEIPT NO:</span>
                      <span className="text-yellow-400 font-bold">{receipt.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TIMESTAMP:</span>
                      <span>{receipt.timestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>BILLPAY BY:</span>
                      <span>{receipt.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-yellow-400">
                      <span>VERIFIED AS:</span>
                      <span>IMMUTABLE ACCOUNTING SYNCED</span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="text-[10px] space-y-1 border-b border-dashed border-white/10 pb-2">
                    <p className="font-bold underline mb-1">DISPENSED DISCHARGES:</p>
                    {receipt.items.map((it) => (
                      <div key={it.id} className="flex justify-between">
                        <span>
                          {it.name} (x{it.quantity})
                        </span>
                        <span>${(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="text-right text-xs font-bold space-y-1">
                    <div className="flex justify-between text-[10px] font-normal text-neutral-300">
                      <span>SUBTOTAL:</span>
                      <span>${receipt.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-normal text-neutral-300">
                      <span>G.S.T TAX 15%:</span>
                      <span>${receipt.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 text-sm border-t border-dashed border-white/20 pt-2 font-black mt-1">
                      <span>NET REMITTANCE:</span>
                      <span>${receipt.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Mock ESC/POS command outputs */}
                  <div className="bg-black/40 p-3 rounded border border-white/10 font-mono text-[8px] text-teal-300 text-left space-y-1 opacity-80 leading-tight">
                    <p className="text-white font-bold text-[9px] mb-1 uppercase tracking-wider text-center">
                      🤖 ESC/POS HARDWARE COMMAND FEED
                    </p>
                    <p>[ESC '@'] Initialize thermal head buffer</p>
                    <p>[ESC 't' 0x00] Set Char table standard codepage</p>
                    <p>[GS 'V' 66 0] Paper cut command triggered</p>
                    <p>[GS 'h' 80] GS Barcode print: {receipt.id}</p>
                    <p>[FEED 5 LINES] Transmit raw stream via BT-2.2 Protocol</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#0F1E46] text-xs font-black uppercase rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> Print Ticket
                  </button>
                  <button
                    onClick={() => setReceipt(null)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold text-xs"
                    title="Dismiss"
                  >
                    Close Slip
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
