// src/components/SupportAI.js
import React, { useState, useRef, useEffect } from "react";
import "./SupportChat.css";

const SupportAI = ({
  onClose,
  user,
  apiBase,
  messages,
  setMessages,
  openRouterApiKey,
}) => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // OpenRouter API key
  const OPENROUTER_API_KEY =
    openRouterApiKey ||
    "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";
  const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
  const MODEL = "meta-llama/llama-3.3-70b-instruct";

  // Admin check
  const isAdmin =
    user &&
    (user.email === "sabbirmolla801@gmail.com" || user.role === "admin");

  // State for fraud notifications
  const [fraudAlertShown, setFraudAlertShown] = useState(false);

  // ---------- FETCH FUNCTIONS ----------
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${apiBase}/products`);
      return await res.json();
    } catch {
      return [];
    }
  };

  const fetchUserOrders = async () => {
    if (!user) return [];
    try {
      const res = await fetch(`${apiBase}/user/orders/${user.email}`);
      const orders = await res.json();
      // Sort by date descending (most recent first)
      return orders.sort(
        (a, b) =>
          new Date(b.date || b.createdAt || 0) -
          new Date(a.date || a.createdAt || 0),
      );
    } catch {
      return [];
    }
  };

  const fetchAllUsers = async () => {
    if (!isAdmin) return [];
    try {
      const res = await fetch(`${apiBase}/users`);
      return await res.json();
    } catch {
      return [];
    }
  };

  const fetchAllOrders = async () => {
    if (!isAdmin) return [];
    try {
      const res = await fetch(`${apiBase}/admin/orders`);
      const orders = await res.json();
      // Sort by date descending (most recent first)
      return orders.sort(
        (a, b) =>
          new Date(b.date || b.createdAt || 0) -
          new Date(a.date || a.createdAt || 0),
      );
    } catch {
      return [];
    }
  };

  const fetchAdminStats = async () => {
    if (!isAdmin) return null;
    try {
      const res = await fetch(`${apiBase}/admin/stats`);
      return await res.json();
    } catch {
      return null;
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiBase}/categories`);
      return await res.json();
    } catch {
      return [];
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${apiBase}/settings`);
      return await res.json();
    } catch {
      return {};
    }
  };

  // ---------- ADMIN ACTION FUNCTIONS ----------
  const addProduct = async (productData) => {
    if (!isAdmin) return { success: false, message: "Admin only" };
    try {
      const res = await fetch(`${apiBase}/add-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      return await res.json();
    } catch {
      return { success: false, message: "Failed to add product" };
    }
  };

  const editProduct = async (id, productData) => {
    if (!isAdmin) return { success: false, message: "Admin only" };
    try {
      const res = await fetch(`${apiBase}/edit-product/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      return await res.json();
    } catch {
      return { success: false, message: "Failed to edit product" };
    }
  };

  const deleteProduct = async (id) => {
    if (!isAdmin) return { success: false, message: "Admin only" };
    try {
      const res = await fetch(`${apiBase}/delete-product/${id}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch {
      return { success: false, message: "Failed to delete product" };
    }
  };

  const addCategory = async (categoryName) => {
    if (!isAdmin) return { success: false, message: "Admin only" };
    const categories = await fetchCategories();
    if (categories.includes(categoryName))
      return { success: false, message: "Category already exists" };
    const newCats = [...categories, categoryName];
    try {
      const res = await fetch(`${apiBase}/update-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCats),
      });
      return await res.json();
    } catch {
      return { success: false, message: "Failed to add category" };
    }
  };

  const editCategory = async (oldName, newName) => {
    if (!isAdmin) return { success: false, message: "Admin only" };
    const categories = await fetchCategories();
    const index = categories.indexOf(oldName);
    if (index === -1) return { success: false, message: "Category not found" };
    categories[index] = newName;
    try {
      const res = await fetch(`${apiBase}/update-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categories),
      });
      return await res.json();
    } catch {
      return { success: false, message: "Failed to edit category" };
    }
  };

  const deleteCategory = async (categoryName) => {
    if (!isAdmin) return { success: false, message: "Admin only" };
    if (categoryName === "Home")
      return { success: false, message: "Cannot delete Home category" };
    const categories = await fetchCategories();
    const newCats = categories.filter((c) => c !== categoryName);
    try {
      const res = await fetch(`${apiBase}/update-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCats),
      });
      return await res.json();
    } catch {
      return { success: false, message: "Failed to delete category" };
    }
  };

  const updateUserRole = async (email, newRole) => {
    if (!isAdmin) return { success: false, message: "Admin only" };
    try {
      const res = await fetch(`${apiBase}/users/${email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      return await res.json();
    } catch {
      return { success: false, message: "Failed to update user role" };
    }
  };

  const deleteUser = async (email) => {
    if (!isAdmin) return { success: false, message: "Admin only" };
    try {
      const res = await fetch(`${apiBase}/users/${email}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch {
      return { success: false, message: "Failed to delete user" };
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!isAdmin) return { success: false, message: "Admin only" };
    try {
      const res = await fetch(`${apiBase}/admin/update-order/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      return await res.json();
    } catch {
      return { success: false, message: "Failed to update order" };
    }
  };

  const deleteOrder = async (orderId) => {
    if (!isAdmin) return { success: false, message: "Admin only" };
    try {
      const res = await fetch(`${apiBase}/admin/order/${orderId}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch {
      return { success: false, message: "Failed to delete order" };
    }
  };

  const updateSiteSettings = async (newSettings) => {
    if (!isAdmin) return { success: false, message: "Admin only" };
    try {
      const res = await fetch(`${apiBase}/update-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      return await res.json();
    } catch {
      return { success: false, message: "Failed to update settings" };
    }
  };

  // ================== ENHANCED FRAUD DETECTION ==================

  // Define high-risk categories (you can modify this list)
  const HIGH_RISK_CATEGORIES = [
    "electronics",
    "fashion",
    "mobile",
    "laptop",
    "watch",
    "jewelry",
  ];

  // Valid BD phone number prefixes
  const BD_PHONE_PREFIXES = ["013", "014", "015", "016", "017", "018", "019"];

  // Helper: validate Bangladeshi phone number
  const isValidBDPhone = (phone) => {
    if (!phone || typeof phone !== "string") return false;
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, "");
    // Check length (11 digits for BD mobile numbers)
    if (digits.length !== 11) return false;
    // Check prefix
    const prefix = digits.substring(0, 3);
    return BD_PHONE_PREFIXES.includes(prefix);
  };

  // Helper: validate address (basic)
  const isValidAddress = (address) => {
    if (!address || typeof address !== "string") return false;
    if (address.length < 15) return false; // too short
    // Check for at least one meaningful keyword
    const keywords = [
      "রোড",
      "সড়ক",
      "লেন",
      "বাড়ি",
      "এপার্টমেন্ট",
      "হাউজিং",
      "আবাসিক",
      "রাস্তা",
      "গলি",
      "রোড",
      "স্ট্রিট",
      "এভিনিউ",
      "লেন",
      "ব্লক",
      "সেক্টর",
    ];
    const hasKeyword = keywords.some((keyword) => address.includes(keyword));
    // Also check if it contains at least two words (to avoid single gibberish)
    const words = address.split(/\s+/).filter((w) => w.length > 1);
    return hasKeyword && words.length >= 2;
  };

  // Helper: check for rapid successive orders (within 1 minute)
  const hasRapidOrders = (timestamps) => {
    if (timestamps.length < 2) return false;
    const sorted = [...timestamps].sort((a, b) => new Date(a) - new Date(b));
    for (let i = 1; i < sorted.length; i++) {
      const diff = new Date(sorted[i]) - new Date(sorted[i - 1]);
      if (diff < 60000) return true; // less than 1 minute
    }
    return false;
  };

  // ========== FRAUD SCORE CALCULATION (starts from 100) ==========
  const calculateFraudScore = (data) => {
    let score = 100;
    const {
      total,
      returned,
      codCount,
      codCancelled,
      uniqueAddresses,
      hasRapidOrders,
      highRiskCount,
      invalidAddressCount,
      invalidPhone,
      maxEmailPhones,
      maxIPPhones,
      maxAddressPhones,
      hasEmailWith5Plus,
      maxLocationPhones,
      maxDevicePhones,
      maxBrowserPhones,
      maxOSPhones,
      maxScreenPhones,
    } = data;

    // 1. Returned/cancelled count
    if (returned >= 3) score -= 15;
    else if (returned === 2) score -= 10;
    else if (returned === 1) score -= 5;

    // 2. COD percentage (only if total >= 3)
    if (total >= 3) {
      const codPercentage = (codCount / total) * 100;
      if (codPercentage > 80) score -= 8;
      else if (codPercentage > 60) score -= 5;
    }

    // 3. COD cancellation rate
    if (codCount > 0) {
      const codCancelRate = (codCancelled / codCount) * 100;
      if (codCancelRate > 50) score -= 8;
      else if (codCancelRate > 30) score -= 5;
    }

    // 4. Unique addresses
    if (uniqueAddresses > 5) score -= 8;
    else if (uniqueAddresses === 5) score -= 5;

    // 5. Rapid orders
    if (hasRapidOrders) score -= 8;

    // 6. High-risk category orders
    if (total > 0) {
      const highRiskPercentage = (highRiskCount / total) * 100;
      if (highRiskPercentage > 50) score -= 8;
      else if (highRiskPercentage > 30) score -= 5;
    }

    // 7. Invalid address count
    if (total > 0) {
      const invalidAddrPercentage = (invalidAddressCount / total) * 100;
      if (invalidAddrPercentage > 50) score -= 10;
      else if (invalidAddrPercentage > 33) score -= 5;
    }

    // 8. Invalid phone number - deduct 50 points
    if (invalidPhone) score -= 50;

    // 9. Same email multiple phones (>3)
    if (maxEmailPhones > 3) score -= 8;

    // 10. Same IP multiple phones (>3)
    if (maxIPPhones > 3) score -= 8;

    // 11. Same address multiple phones
    if (maxAddressPhones > 5) score -= 10;
    else if (maxAddressPhones >= 3) score -= 8;
    else if (maxAddressPhones === 2) score -= 5;

    // 12. Same email with 5+ phones (special)
    if (hasEmailWith5Plus) score -= 25;

    // 13. Same location (city/area) multiple phones (>3)
    if (maxLocationPhones > 3) score -= 8;

    // 14. Same device fingerprint multiple phones (>2) – because device sharing is less common
    if (maxDevicePhones > 2) score -= 10;
    else if (maxDevicePhones === 2) score -= 5;

    // 15. Same browser multiple phones (>3)
    if (maxBrowserPhones > 3) score -= 8;

    // 16. Same OS multiple phones (>3)
    if (maxOSPhones > 3) score -= 8;

    // 17. Same screen size multiple phones (>3) – optional, can be less strict
    if (maxScreenPhones > 3) score -= 5;

    return score;
  };

  // Enhanced fraud detection function (returns suspicious phone numbers with score)
  const getFraudulentOrders = async () => {
    const orders = await fetchAllOrders();
    const phoneMap = new Map();
    const emailToPhones = new Map(); // email -> Set of phones
    const ipToPhones = new Map(); // ip -> Set of phones
    const addressToPhones = new Map(); // address -> Set of phones
    const locationToPhones = new Map(); // location -> Set of phones
    const deviceToPhones = new Map(); // device fingerprint -> Set of phones
    const browserToPhones = new Map(); // browser -> Set of phones
    const osToPhones = new Map(); // os -> Set of phones
    const screenToPhones = new Map(); // screen size -> Set of phones

    orders.forEach((order) => {
      const phone = order.userPhone;
      if (!phone) return;

      if (!phoneMap.has(phone)) {
        phoneMap.set(phone, {
          total: 0,
          returned: 0,
          codCount: 0,
          codCancelled: 0,
          addresses: new Set(),
          timestamps: [],
          orders: [],
          highRiskCount: 0,
          invalidAddressCount: 0,
          emails: new Set(),
          ips: new Set(),
          locations: new Set(),
          devices: new Set(),
          browsers: new Set(),
          os: new Set(),
          screens: new Set(),
        });
      }

      const data = phoneMap.get(phone);
      data.total++;
      data.orders.push(order);
      if (order.userEmail) data.emails.add(order.userEmail);
      if (order.userIP) data.ips.add(order.userIP);
      if (order.userLocation) data.locations.add(order.userLocation);
      if (order.userDevice) data.devices.add(order.userDevice);
      if (order.userBrowser) data.browsers.add(order.userBrowser);
      if (order.userOS) data.os.add(order.userOS);
      if (order.userScreenSize) data.screens.add(order.userScreenSize);

      if (order.userAddress) {
        data.addresses.add(order.userAddress);
        if (!isValidAddress(order.userAddress)) {
          data.invalidAddressCount++;
        }
        // Build addressToPhones
        if (!addressToPhones.has(order.userAddress)) {
          addressToPhones.set(order.userAddress, new Set());
        }
        addressToPhones.get(order.userAddress).add(phone);
      }

      if (order.date) data.timestamps.push(order.date);

      if (order.status === "Returned" || order.status === "Cancelled") {
        data.returned++;
      }

      if (order.paymentMethod === "COD") {
        data.codCount++;
        if (order.status === "Cancelled" || order.status === "Returned") {
          data.codCancelled++;
        }
      }

      // Check high-risk categories
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const product = item.product || item;
          if (
            product.category &&
            HIGH_RISK_CATEGORIES.includes(product.category.toLowerCase())
          ) {
            data.highRiskCount++;
          }
        });
      }

      // Build cross-phone maps
      if (order.userEmail) {
        if (!emailToPhones.has(order.userEmail))
          emailToPhones.set(order.userEmail, new Set());
        emailToPhones.get(order.userEmail).add(phone);
      }
      if (order.userIP) {
        if (!ipToPhones.has(order.userIP))
          ipToPhones.set(order.userIP, new Set());
        ipToPhones.get(order.userIP).add(phone);
      }
      if (order.userLocation) {
        if (!locationToPhones.has(order.userLocation))
          locationToPhones.set(order.userLocation, new Set());
        locationToPhones.get(order.userLocation).add(phone);
      }
      if (order.userDevice) {
        if (!deviceToPhones.has(order.userDevice))
          deviceToPhones.set(order.userDevice, new Set());
        deviceToPhones.get(order.userDevice).add(phone);
      }
      if (order.userBrowser) {
        if (!browserToPhones.has(order.userBrowser))
          browserToPhones.set(order.userBrowser, new Set());
        browserToPhones.get(order.userBrowser).add(phone);
      }
      if (order.userOS) {
        if (!osToPhones.has(order.userOS))
          osToPhones.set(order.userOS, new Set());
        osToPhones.get(order.userOS).add(phone);
      }
      if (order.userScreenSize) {
        if (!screenToPhones.has(order.userScreenSize))
          screenToPhones.set(order.userScreenSize, new Set());
        screenToPhones.get(order.userScreenSize).add(phone);
      }
    });

    const suspicious = [];
    for (const [phone, data] of phoneMap.entries()) {
      const total = data.total;
      const returned = data.returned;
      const codCount = data.codCount;
      const codCancelled = data.codCancelled;
      const uniqueAddresses = data.addresses.size;
      const hasRapid = hasRapidOrders(data.timestamps);
      const highRiskCount = data.highRiskCount;
      const invalidAddrCount = data.invalidAddressCount;
      const invalidPhone = !isValidBDPhone(phone);

      // Compute cross‑phone stats
      let maxEmailPhones = 0;
      let hasEmailWith5Plus = false;
      for (const email of data.emails) {
        const phones = emailToPhones.get(email);
        if (phones) {
          const count = phones.size;
          if (count > maxEmailPhones) maxEmailPhones = count;
          if (count >= 5) hasEmailWith5Plus = true;
        }
      }

      let maxIPPhones = 0;
      for (const ip of data.ips) {
        const phones = ipToPhones.get(ip);
        if (phones) {
          const count = phones.size;
          if (count > maxIPPhones) maxIPPhones = count;
        }
      }

      let maxAddressPhones = 0;
      for (const addr of data.addresses) {
        const phones = addressToPhones.get(addr);
        if (phones) {
          const count = phones.size;
          if (count > maxAddressPhones) maxAddressPhones = count;
        }
      }

      let maxLocationPhones = 0;
      for (const loc of data.locations) {
        const phones = locationToPhones.get(loc);
        if (phones) {
          const count = phones.size;
          if (count > maxLocationPhones) maxLocationPhones = count;
        }
      }

      let maxDevicePhones = 0;
      for (const dev of data.devices) {
        const phones = deviceToPhones.get(dev);
        if (phones) {
          const count = phones.size;
          if (count > maxDevicePhones) maxDevicePhones = count;
        }
      }

      let maxBrowserPhones = 0;
      for (const br of data.browsers) {
        const phones = browserToPhones.get(br);
        if (phones) {
          const count = phones.size;
          if (count > maxBrowserPhones) maxBrowserPhones = count;
        }
      }

      let maxOSPhones = 0;
      for (const os of data.os) {
        const phones = osToPhones.get(os);
        if (phones) {
          const count = phones.size;
          if (count > maxOSPhones) maxOSPhones = count;
        }
      }

      let maxScreenPhones = 0;
      for (const scr of data.screens) {
        const phones = screenToPhones.get(scr);
        if (phones) {
          const count = phones.size;
          if (count > maxScreenPhones) maxScreenPhones = count;
        }
      }

      const score = calculateFraudScore({
        total,
        returned,
        codCount,
        codCancelled,
        uniqueAddresses,
        hasRapidOrders: hasRapid,
        highRiskCount,
        invalidAddressCount: invalidAddrCount,
        invalidPhone,
        maxEmailPhones,
        maxIPPhones,
        maxAddressPhones,
        hasEmailWith5Plus,
        maxLocationPhones,
        maxDevicePhones,
        maxBrowserPhones,
        maxOSPhones,
        maxScreenPhones,
      });

      if (score <= 50) {
        suspicious.push({
          phone,
          total,
          returned,
          score,
          details: {
            returnedCount: returned,
            codPercentage: total ? ((codCount / total) * 100).toFixed(1) : 0,
            codCancelRate: codCount
              ? ((codCancelled / codCount) * 100).toFixed(1)
              : 0,
            uniqueAddresses,
            hasRapidOrders: hasRapid,
            highRiskPercentage: total
              ? ((highRiskCount / total) * 100).toFixed(1)
              : 0,
            invalidAddressCount: invalidAddrCount,
            invalidPhone,
            maxEmailPhones,
            maxIPPhones,
            maxAddressPhones,
            hasEmailWith5Plus,
            maxLocationPhones,
            maxDevicePhones,
            maxBrowserPhones,
            maxOSPhones,
            maxScreenPhones,
          },
        });
      }
    }

    return suspicious;
  };

  // Single phone fraud check (for "check fraud" command)
  const checkFraud = async (phone) => {
    const orders = await fetchAllOrders();
    const userOrders = orders.filter((o) => o.userPhone === phone);
    if (userOrders.length === 0)
      return { exists: false, message: "No orders found for this phone." };

    const returnedCount = userOrders.filter(
      (o) => o.status === "Returned" || o.status === "Cancelled",
    ).length;

    const addresses = new Set();
    const emails = new Set();
    const ips = new Set();
    const locations = new Set();
    const devices = new Set();
    const browsers = new Set();
    const osSet = new Set();
    const screens = new Set();
    let codCount = 0,
      codCancelled = 0,
      highRiskCount = 0,
      invalidAddr = 0;
    const timestamps = [];

    userOrders.forEach((o) => {
      if (o.userEmail) emails.add(o.userEmail);
      if (o.userIP) ips.add(o.userIP);
      if (o.userLocation) locations.add(o.userLocation);
      if (o.userDevice) devices.add(o.userDevice);
      if (o.userBrowser) browsers.add(o.userBrowser);
      if (o.userOS) osSet.add(o.userOS);
      if (o.userScreenSize) screens.add(o.userScreenSize);
      if (o.userAddress) {
        addresses.add(o.userAddress);
        if (!isValidAddress(o.userAddress)) invalidAddr++;
      }
      if (o.date) timestamps.push(o.date);
      if (o.paymentMethod === "COD") {
        codCount++;
        if (o.status === "Cancelled" || o.status === "Returned") codCancelled++;
      }
      if (o.items) {
        o.items.forEach((item) => {
          const product = item.product || item;
          if (
            product.category &&
            HIGH_RISK_CATEGORIES.includes(product.category.toLowerCase())
          ) {
            highRiskCount++;
          }
        });
      }
    });

    const uniqueAddresses = addresses.size;
    const total = userOrders.length;
    const hasRapid = hasRapidOrders(timestamps);
    const invalidPhone = !isValidBDPhone(phone);

    // Build maps from all orders for cross‑phone checks
    const emailToPhones = new Map();
    const ipToPhones = new Map();
    const addressToPhones = new Map();
    const locationToPhones = new Map();
    const deviceToPhones = new Map();
    const browserToPhones = new Map();
    const osToPhones = new Map();
    const screenToPhones = new Map();

    orders.forEach((o) => {
      if (o.userEmail) {
        if (!emailToPhones.has(o.userEmail))
          emailToPhones.set(o.userEmail, new Set());
        emailToPhones.get(o.userEmail).add(o.userPhone);
      }
      if (o.userIP) {
        if (!ipToPhones.has(o.userIP)) ipToPhones.set(o.userIP, new Set());
        ipToPhones.get(o.userIP).add(o.userPhone);
      }
      if (o.userAddress) {
        if (!addressToPhones.has(o.userAddress))
          addressToPhones.set(o.userAddress, new Set());
        addressToPhones.get(o.userAddress).add(o.userPhone);
      }
      if (o.userLocation) {
        if (!locationToPhones.has(o.userLocation))
          locationToPhones.set(o.userLocation, new Set());
        locationToPhones.get(o.userLocation).add(o.userPhone);
      }
      if (o.userDevice) {
        if (!deviceToPhones.has(o.userDevice))
          deviceToPhones.set(o.userDevice, new Set());
        deviceToPhones.get(o.userDevice).add(o.userPhone);
      }
      if (o.userBrowser) {
        if (!browserToPhones.has(o.userBrowser))
          browserToPhones.set(o.userBrowser, new Set());
        browserToPhones.get(o.userBrowser).add(o.userPhone);
      }
      if (o.userOS) {
        if (!osToPhones.has(o.userOS)) osToPhones.set(o.userOS, new Set());
        osToPhones.get(o.userOS).add(o.userPhone);
      }
      if (o.userScreenSize) {
        if (!screenToPhones.has(o.userScreenSize))
          screenToPhones.set(o.userScreenSize, new Set());
        screenToPhones.get(o.userScreenSize).add(o.userPhone);
      }
    });

    let maxEmailPhones = 0;
    let hasEmailWith5Plus = false;
    for (const email of emails) {
      const phones = emailToPhones.get(email);
      if (phones) {
        const count = phones.size;
        if (count > maxEmailPhones) maxEmailPhones = count;
        if (count >= 5) hasEmailWith5Plus = true;
      }
    }

    let maxIPPhones = 0;
    for (const ip of ips) {
      const phones = ipToPhones.get(ip);
      if (phones) {
        const count = phones.size;
        if (count > maxIPPhones) maxIPPhones = count;
      }
    }

    let maxAddressPhones = 0;
    for (const addr of addresses) {
      const phones = addressToPhones.get(addr);
      if (phones) {
        const count = phones.size;
        if (count > maxAddressPhones) maxAddressPhones = count;
      }
    }

    let maxLocationPhones = 0;
    for (const loc of locations) {
      const phones = locationToPhones.get(loc);
      if (phones) {
        const count = phones.size;
        if (count > maxLocationPhones) maxLocationPhones = count;
      }
    }

    let maxDevicePhones = 0;
    for (const dev of devices) {
      const phones = deviceToPhones.get(dev);
      if (phones) {
        const count = phones.size;
        if (count > maxDevicePhones) maxDevicePhones = count;
      }
    }

    let maxBrowserPhones = 0;
    for (const br of browsers) {
      const phones = browserToPhones.get(br);
      if (phones) {
        const count = phones.size;
        if (count > maxBrowserPhones) maxBrowserPhones = count;
      }
    }

    let maxOSPhones = 0;
    for (const os of osSet) {
      const phones = osToPhones.get(os);
      if (phones) {
        const count = phones.size;
        if (count > maxOSPhones) maxOSPhones = count;
      }
    }

    let maxScreenPhones = 0;
    for (const scr of screens) {
      const phones = screenToPhones.get(scr);
      if (phones) {
        const count = phones.size;
        if (count > maxScreenPhones) maxScreenPhones = count;
      }
    }

    const score = calculateFraudScore({
      total,
      returned: returnedCount,
      codCount,
      codCancelled,
      uniqueAddresses,
      hasRapidOrders: hasRapid,
      highRiskCount,
      invalidAddressCount: invalidAddr,
      invalidPhone,
      maxEmailPhones,
      maxIPPhones,
      maxAddressPhones,
      hasEmailWith5Plus,
      maxLocationPhones,
      maxDevicePhones,
      maxBrowserPhones,
      maxOSPhones,
      maxScreenPhones,
    });

    return {
      phone,
      totalOrders: total,
      returnedCount,
      suspicious: score <= 50,
      score,
      details: {
        returnedCount,
        codPercentage: total ? ((codCount / total) * 100).toFixed(1) : 0,
        codCancelRate: codCount
          ? ((codCancelled / codCount) * 100).toFixed(1)
          : 0,
        uniqueAddresses,
        hasRapidOrders: hasRapid,
        highRiskPercentage: total
          ? ((highRiskCount / total) * 100).toFixed(1)
          : 0,
        invalidAddressCount: invalidAddr,
        invalidPhone,
        maxEmailPhones,
        maxIPPhones,
        maxAddressPhones,
        hasEmailWith5Plus,
        maxLocationPhones,
        maxDevicePhones,
        maxBrowserPhones,
        maxOSPhones,
        maxScreenPhones,
      },
    };
  };

  const createFakeOrder = async () => {
    if (!isAdmin) return { success: false, message: "Admin only" };
    const products = await fetchProducts();
    if (products.length === 0)
      return { success: false, message: "No products to create fake order" };
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const testPhone = "01711111111";
    const fraudCheck = await checkFraud(testPhone);
    const fakeOrder = {
      userEmail: "test@example.com",
      userName: "Test User",
      userPhone: testPhone,
      userAddress: "123 Test Street",
      items: [{ product: randomProduct, quantity: 1 }],
      total: randomProduct.price,
      paymentMethod: "COD",
    };
    try {
      const res = await fetch(`${apiBase}/place-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fakeOrder),
      });
      const data = await res.json();
      const warning = fraudCheck.suspicious
        ? ` ⚠️ Warning: This phone has a fraud score of ${fraudCheck.score}.`
        : "";
      return { success: true, order: data.order, warning };
    } catch {
      return { success: false, message: "Failed to create fake order" };
    }
  };

  // ---------- ORDER LOOKUP ----------
  const getOrderById = async (orderId) => {
    try {
      const orders = isAdmin ? await fetchAllOrders() : await fetchUserOrders();
      return orders.find((o) => o.id === orderId);
    } catch {
      return null;
    }
  };

  // ---------- HELP MESSAGE ----------
  const getHelpMessage = () => {
    const common = `🔍 **প্রোডাক্ট খুঁজুন**  
• "প্রোডাক্ট দেখাও", "কি কি আছে", "products"  
• "শার্ট দেখাও", "প্যান্ট দেখাও" – নির্দিষ্ট ক্যাটাগরি বা নাম  
• "কি কি প্রোডাক্ট আছে?"

📦 **আপনার অর্ডার** (লগইন করা থাকতে হবে)  
• "আমার অর্ডার", "my orders", "অর্ডার দেখাও"  
• "অর্ডার স্ট্যাটাস", "সর্বশেষ অর্ডার"  
• "ORD-123456 এর স্ট্যাটাস কি?"

🔄 **রিটার্ন ও রিফান্ড**  
• "কিভাবে রিটার্ন করব?", "return policy"  
• "রিফান্ড পলিসি কি?"

🚚 **শিপিং ও পেমেন্ট**  
• "শিপিং কতদিন লাগে?", "shipping time"  
• "পেমেন্ট মেথড কি কি?", "payment methods"`;

    if (isAdmin) {
      return `আমি এডমিন হিসেবে সব কাজ করতে পারি:

🛠️ **Admin Control Commands**

👥 **User Management**  
• "সব ইউজার দেখাও" / "users list"  
• "ইউজার [ইমেইল] কে এডমিন বানাও"  
• "ইউজার [ইমেইল] ডিলিট কর"

📦 **Order Management**  
• "সব অর্ডার দেখাও" / "all orders" (সর্বশেষ প্রথম)  
• "ORD-123456 এর স্ট্যাটাস কি?"  
• "অর্ডার ORD-123456 এর স্ট্যাটাস শিপড করুন"  
• "ফেক অর্ডার তৈরি কর" (টেস্টিং)  
• "সন্দেহজনক অর্ডার দেখাও" / "fraud list" (স্কোর ≤৫০)  
• "fraud details [ফোন নম্বর]" – বিস্তারিত ফ্রড স্কোর

📊 **Stats & Analytics**  
• "স্ট্যাটস দেখাও" / "stats"

🛍️ **Product Management**  
• "নতুন প্রোডাক্ট যোগ [নাম] [দাম] [ক্যাটাগরি] [ছবির URL] [বিবরণ]"  
• "প্রোডাক্ট এডিট [আইডি] [ফিল্ড] [নতুন মান]" (ফিল্ড: name, price, category, img, description)  
• "প্রোডাক্ট ডিলিট [আইডি]"

🏷️ **Category Management**  
• "নতুন ক্যাটাগরি যোগ [নাম]"  
• "ক্যাটাগরি এডিট [পুরাতন নাম] থেকে [নতুন নাম]"  
• "ক্যাটাগরি ডিলিট [নাম]"

⚙️ **Website Settings**  
• "সাইটের নাম পরিবর্তন কর [নাম]"  
• "প্রাইমারি কালার [কোড] সেট কর"

🛡️ **Security Tools**  
• "ফোন [নম্বর] এর ফ্রড চেক কর" (বিস্তারিত স্কোর সহ)  
• "সন্দেহজনক অর্ডার দেখাও" (স্কোর ≤৫০)  
• "fraud details [ফোন]" – স্কোরের বিস্তারিত কারণ (IP, location, device, browser, OS, screen included)

🛒 **Customer Commands (সবার জন্য)**  

${common}`;
    } else {
      return `আমি আপনাকে নিম্নলিখিত বিষয়ে সাহায্য করতে পারি:\n\n${common}`;
    }
  };

  // ---------- FRAUD NOTIFICATION FUNCTION (AUTO NOTIFY ADMIN) ----------
  useEffect(() => {
    if (!isAdmin) return;

    const checkForFraud = async () => {
      const suspicious = await getFraudulentOrders();
      if (suspicious.length > 0 && !fraudAlertShown) {
        const summary = suspicious
          .slice(0, 5)
          .map(
            (s) =>
              `📞 ${s.phone} – Score: ${s.score} (Returns: ${s.returned}/${s.total})`,
          )
          .join("\n");
        const fraudMsg = `🚨 **Fraud Alert!** 🚨\n${suspicious.length} suspicious phone number(s) found (score ≤50).\n${summary}\nType "fraud list" for details.`;
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: fraudMsg, time: getCurrentTime() },
        ]);
        setFraudAlertShown(true);
      } else if (suspicious.length === 0) {
        setFraudAlertShown(false);
      }
    };

    checkForFraud();
    const interval = setInterval(checkForFraud, 60000); // every minute

    return () => clearInterval(interval);
  }, [isAdmin, fraudAlertShown]);

  // ---------- SYSTEM PROMPT ----------
  const getSystemPrompt = (contextData) => {
    return `You are a helpful support assistant for an e-commerce website. 
You have access to real-time data via context. Answer user queries politely and accurately.

Current user: ${user ? user.email : "Not logged in"}
User role: ${user ? user.role : "guest"}
Admin status: ${isAdmin ? "Admin" : "Not admin"}

Context data:
${contextData || "No additional context available."}

Keep responses concise and friendly. Use Bengali or English as appropriate.`;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sendHelpMessage = () => {
    setInput("/help");
    setTimeout(() => sendMessage(), 10);
  };

  // ---------- ENHANCED NORMALIZATION (Banglish support) ----------
  const normalizeInput = (text) => {
    const lower = text.toLowerCase().trim();

    // Common Bengali words and their Banglish equivalents -> English
    const wordMap = {
      // Bengali script
      অর্ডার: "order",
      দেখাও: "show",
      সব: "all",
      আমার: "my",
      কি: "what",
      কিভাবে: "how",
      রিটার্ন: "return",
      রিফান্ড: "refund",
      পলিসি: "policy",
      শিপিং: "shipping",
      পেমেন্ট: "payment",
      মেথড: "method",
      স্ট্যাটাস: "status",
      ফোন: "phone",
      নম্বর: "number",
      ফ্রড: "fraud",
      ডিটেলস: "details",
      চেক: "check",
      বানাও: "make",
      ডিলিট: "delete",
      এডিট: "edit",
      যোগ: "add",
      নতুন: "new",
      প্রোডাক্ট: "product",
      ক্যাটাগরি: "category",
      সাইট: "site",
      নাম: "name",
      কালার: "color",
      প্রাইমারি: "primary",
      সেট: "set",
      কর: "do",

      // Banglish variations (common misspellings)
      sob: "all",
      shob: "all",
      dekhao: "show",
      dekhau: "show",
      dekahu: "show",
      amar: "my",
      order: "order",
      products: "product",
      category: "category",
      settings: "setting",
      users: "user",
      fraud: "fraud",
      details: "details",
      check: "check",
      delete: "delete",
      edit: "edit",
      add: "add",
      new: "new",
      site: "site",
      name: "name",
      color: "color",
      primary: "primary",
      set: "set",
      status: "status",
      shipping: "shipping",
      payment: "payment",
      method: "method",
      return: "return",
      refund: "refund",
      policy: "policy",
      phone: "phone",
      number: "number",
    };

    // First, replace whole words using the map
    let normalized = lower;
    const words = lower.split(/\s+/);
    const replacedWords = words.map((word) => wordMap[word] || word);
    normalized = replacedWords.join(" ");

    // Additionally, replace common phrases
    const phraseMap = {
      "all orders": "all orders",
      "sob order": "all orders",
      "shob order": "all orders",
      "my orders": "my orders",
      "amar order": "my orders",
      "show orders": "show orders",
      "dekhao order": "show orders",
      "dekhau order": "show orders",
      "fraud list": "fraud list",
      "fraud details": "fraud details",
      "check fraud": "check fraud",
      "fake order": "fake order",
      "test order": "test order",
    };

    for (const [phrase, replacement] of Object.entries(phraseMap)) {
      const regex = new RegExp(phrase, "gi");
      normalized = normalized.replace(regex, replacement);
    }

    return normalized;
  };

  // ---------- MAIN SEND MESSAGE FUNCTION ----------
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input, time: getCurrentTime() };
    setMessages((prev) => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    // Normalize input for command matching
    const normalized = normalizeInput(userInput);
    const lowerInput = userInput.toLowerCase();

    // ---------- 1. HELP COMMAND ----------
    if (
      userInput === "/help" ||
      lowerInput.includes("help") ||
      lowerInput.includes("কি কি করতে পারেন") ||
      lowerInput.includes("কমান্ড") ||
      normalized.includes("help")
    ) {
      const helpText = getHelpMessage();
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: helpText, time: getCurrentTime() },
      ]);
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    // ---------- 2. ORDER ID LOOKUP ----------
    const orderIdMatch =
      userInput.match(/(ORD[-]?\d+)/i) || normalized.match(/order\s*(\d+)/i);
    if (orderIdMatch) {
      let orderId = orderIdMatch[1];
      if (!orderId.toUpperCase().startsWith("ORD-")) {
        orderId = "ORD-" + orderId;
      }
      const order = await getOrderById(orderId);
      if (order) {
        const itemsList = order.items
          .map((item) => {
            const product = item.product || item;
            return `${product.name} x${item.quantity}`;
          })
          .join(", ");
        const statusMsg = `📦 **অর্ডার ${order.id}**  
📅 তারিখ: ${order.date ? new Date(order.date).toLocaleString() : "N/A"}  
📦 স্ট্যাটাস: **${order.status}**  
🛒 আইটেম: ${itemsList}  
💰 মোট: $${order.total}  
💳 পেমেন্ট: ${order.paymentMethod}`;
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: statusMsg, time: getCurrentTime() },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `❌ অর্ডার **${orderId}** খুঁজে পাওয়া যায়নি। সঠিক আইডি যাচাই করুন।`,
            time: getCurrentTime(),
          },
        ]);
      }
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    // ---------- 3. AI‑POWERED DYNAMIC EDITING (admin only) ----------
    if (isAdmin) {
      const changeRequestMatch =
        userInput.match(
          /['"](.+?)['"]\s*(?:বদলে|পরিবর্তন করে|change to|থেকে)\s*['"](.+?)['"]/i,
        ) ||
        userInput.match(/এই টেক্সটটা ['"](.+?)['"] বদলে ['"](.+?)['"] দাও/i) ||
        userInput.match(/(.+?) কে (.+?) তে পরিবর্তন কর/i) ||
        normalized.match(/change (.+) to (.+)/i);

      if (changeRequestMatch) {
        let oldText, newText;
        if (changeRequestMatch.length === 3) {
          oldText = changeRequestMatch[1].trim();
          newText = changeRequestMatch[2].trim();
        } else {
          oldText = userInput;
          newText = "";
        }

        try {
          const [products, categories, settings] = await Promise.all([
            fetchProducts(),
            fetchCategories(),
            fetchSettings(),
          ]);

          const contextData = {
            products: products.slice(0, 20),
            categories,
            settings,
            userQuery: userInput,
          };

          const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": window.location.origin,
              "X-Title": "NoboDeal Support AI",
            },
            body: JSON.stringify({
              model: MODEL,
              messages: [
                {
                  role: "system",
                  content: `You are an AI assistant for an e-commerce admin panel.
The user wants to change some text on the website. You have access to the current products, categories, and settings.

Your job is to:
1. Understand what the user wants to change.
2. Find which item (product, category, or setting) contains the old text.
3. Determine what the new text should be.
4. Call the appropriate function to make the change.

Available functions:
- update_product_field(productId, field, newValue)
- update_category_name(oldName, newName)
- update_site_setting(settingName, newValue)

Respond with a function call in JSON format.`,
                },
                {
                  role: "user",
                  content: `Current data: ${JSON.stringify(contextData, null, 2)}\n\nUser request: ${userInput}`,
                },
              ],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "update_product_field",
                    description: "Update a specific field of a product",
                    parameters: {
                      type: "object",
                      properties: {
                        productId: {
                          type: "number",
                          description: "The ID of the product to update",
                        },
                        field: {
                          type: "string",
                          enum: [
                            "name",
                            "price",
                            "category",
                            "description",
                            "img",
                          ],
                        },
                        newValue: {
                          type: "string",
                          description: "The new value for the field",
                        },
                      },
                      required: ["productId", "field", "newValue"],
                    },
                  },
                },
                {
                  type: "function",
                  function: {
                    name: "update_category_name",
                    description: "Rename a category",
                    parameters: {
                      type: "object",
                      properties: {
                        oldName: {
                          type: "string",
                          description: "The current name of the category",
                        },
                        newName: {
                          type: "string",
                          description: "The new name for the category",
                        },
                      },
                      required: ["oldName", "newName"],
                    },
                  },
                },
                {
                  type: "function",
                  function: {
                    name: "update_site_setting",
                    description: "Update a site setting",
                    parameters: {
                      type: "object",
                      properties: {
                        settingName: {
                          type: "string",
                          enum: ["siteName", "primaryColor", "footerText"],
                        },
                        newValue: {
                          type: "string",
                          description: "The new value for the setting",
                        },
                      },
                      required: ["settingName", "newValue"],
                    },
                  },
                },
              ],
              tool_choice: "auto",
              temperature: 0.3,
              max_tokens: 1024,
            }),
          });

          if (!response.ok) throw new Error("API error");

          const data = await response.json();
          const message = data.choices[0].message;

          if (message.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0];
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            let result;

            if (functionName === "update_product_field") {
              const { productId, field, newValue } = args;
              const products = await fetchProducts();
              const product = products.find((p) => p.id === productId);
              if (!product) {
                setMessages((prev) => [
                  ...prev,
                  {
                    sender: "bot",
                    text: `❌ প্রোডাক্ট আইডি ${productId} পাওয়া যায়নি।`,
                    time: getCurrentTime(),
                  },
                ]);
                setIsTyping(false);
                return;
              }
              const updatedData = {
                ...product,
                [field]: field === "price" ? parseFloat(newValue) : newValue,
              };
              result = await editProduct(productId, updatedData);
              if (result.success) {
                setMessages((prev) => [
                  ...prev,
                  {
                    sender: "bot",
                    text: `✅ প্রোডাক্ট "${product.name}" এর ${field} আপডেট করে "${newValue}" করা হয়েছে।`,
                    time: getCurrentTime(),
                  },
                ]);
              } else {
                setMessages((prev) => [
                  ...prev,
                  {
                    sender: "bot",
                    text: `❌ আপডেট ব্যর্থ: ${result.message}`,
                    time: getCurrentTime(),
                  },
                ]);
              }
            } else if (functionName === "update_category_name") {
              const { oldName, newName } = args;
              result = await editCategory(oldName, newName);
              if (result.success) {
                setMessages((prev) => [
                  ...prev,
                  {
                    sender: "bot",
                    text: `✅ ক্যাটাগরি "${oldName}" এর নাম পরিবর্তন করে "${newName}" করা হয়েছে।`,
                    time: getCurrentTime(),
                  },
                ]);
              } else {
                setMessages((prev) => [
                  ...prev,
                  {
                    sender: "bot",
                    text: `❌ ক্যাটাগরি আপডেট ব্যর্থ: ${result.message}`,
                    time: getCurrentTime(),
                  },
                ]);
              }
            } else if (functionName === "update_site_setting") {
              const { settingName, newValue } = args;
              const settings = await fetchSettings();
              const updatedSettings = { ...settings, [settingName]: newValue };
              result = await updateSiteSettings(updatedSettings);
              if (result.success) {
                setMessages((prev) => [
                  ...prev,
                  {
                    sender: "bot",
                    text: `✅ সাইটের ${settingName} আপডেট করে "${newValue}" করা হয়েছে।`,
                    time: getCurrentTime(),
                  },
                ]);
              } else {
                setMessages((prev) => [
                  ...prev,
                  {
                    sender: "bot",
                    text: `❌ সেটিংস আপডেট ব্যর্থ।`,
                    time: getCurrentTime(),
                  },
                ]);
              }
            }
          } else {
            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text:
                  message.content ||
                  "আমি বুঝতে পারিনি। দয়া করে স্পষ্ট করে বলুন।",
                time: getCurrentTime(),
              },
            ]);
          }
        } catch (error) {
          console.error("AI function calling error:", error);
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "❌ প্রসেসিং এ সমস্যা হয়েছে।",
              time: getCurrentTime(),
            },
          ]);
        } finally {
          setIsTyping(false);
          setTimeout(() => inputRef.current?.focus(), 50);
        }
        return;
      }
    }

    // ---------- 4. ADMIN COMMANDS (STRUCTURED) ----------
    if (isAdmin) {
      // ---- User list ----
      if (
        lowerInput.includes("all users") ||
        lowerInput.includes("সব ইউজার") ||
        lowerInput.includes("user list") ||
        normalized.includes("all users") ||
        normalized.includes("show users") ||
        (normalized.includes("users") && normalized.includes("list"))
      ) {
        const users = await fetchAllUsers();
        if (users.length === 0) {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "No users found.", time: getCurrentTime() },
          ]);
        } else {
          const userList = users
            .slice(0, 10)
            .map((u) => `👤 ${u.name || "No name"} – ${u.email} (${u.role})`)
            .join("\n");
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `📋 **Recent Users (last 10):**\n${userList}`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- All orders ----
      if (
        lowerInput.includes("all orders") ||
        lowerInput.includes("সব অর্ডার") ||
        normalized.includes("all orders") ||
        normalized.includes("show orders") ||
        (normalized.includes("orders") && normalized.includes("all"))
      ) {
        const orders = await fetchAllOrders();
        if (orders.length === 0) {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "No orders found.", time: getCurrentTime() },
          ]);
        } else {
          const orderList = orders
            .slice(0, 10)
            .map(
              (o) =>
                `🆔 ${o.id} – ${o.status} – $${o.total} – ${o.userName || "Unknown"}`,
            )
            .join("\n");
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `📦 **Recent Orders (last 10):**\n${orderList}`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Stats ----
      if (
        lowerInput.includes("stats") ||
        lowerInput.includes("স্ট্যাটস") ||
        normalized.includes("stats") ||
        normalized.includes("statistics")
      ) {
        const stats = await fetchAdminStats();
        if (stats) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `📊 **System Stats:**\n👥 Users: ${stats.totalUsers}\n📦 Products: ${stats.totalProducts}\n🛒 Orders: ${stats.totalOrders}\n💰 Revenue: $${stats.totalRevenue}`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Unable to fetch stats.",
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Fraud list ----
      if (
        lowerInput.includes("suspicious orders") ||
        lowerInput.includes("fraud list") ||
        lowerInput.includes("সন্দেহজনক অর্ডার") ||
        normalized.includes("fraud list") ||
        (normalized.includes("suspicious") && normalized.includes("orders"))
      ) {
        const suspicious = await getFraudulentOrders();
        if (suspicious.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "✅ No suspicious orders found.",
              time: getCurrentTime(),
            },
          ]);
        } else {
          const list = suspicious
            .map(
              (s) =>
                `📞 ${s.phone} – Score: ${s.score} (Returns: ${s.returned}/${s.total})`,
            )
            .join("\n");
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `⚠️ **Suspicious Orders (score ≤50):**\n${list}\n\nType "fraud details [phone]" for more info.`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Fraud details for specific phone ----
      const fraudDetailsMatch =
        userInput.match(/fraud details (\d+)/i) ||
        userInput.match(/ফ্রড ডিটেলস (\d+)/i) ||
        normalized.match(/fraud details (\d+)/i) ||
        normalized.match(/details (\d+)/i);
      if (fraudDetailsMatch) {
        const phone = fraudDetailsMatch[1];
        const result = await checkFraud(phone);
        if (!result.exists) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `No orders found for ${phone}.`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          const details = result.details;
          const msg = `📞 **Phone ${phone}**  
📊 Score: ${result.score} (${result.suspicious ? "Suspicious" : "Normal"})  
📦 Total Orders: ${result.totalOrders}  
🔄 Returned/Cancelled: ${details.returnedCount}  
💳 COD Percentage: ${details.codPercentage}%  
❌ COD Cancel Rate: ${details.codCancelRate}%  
🏠 Unique Addresses: ${details.uniqueAddresses}  
⏱️ Rapid Orders: ${details.hasRapidOrders ? "Yes" : "No"}  
⚠️ High-Risk Category Orders: ${details.highRiskPercentage}%  
🚫 Invalid Addresses: ${details.invalidAddressCount}  
📞 Invalid Phone Number: ${details.invalidPhone ? "Yes" : "No"}  
👥 Same Email Multiple Phones: Max ${details.maxEmailPhones} phones  
🌐 Same IP Multiple Phones: Max ${details.maxIPPhones} phones  
🏘️ Same Address Multiple Phones: Max ${details.maxAddressPhones} phones  
📍 Same Location Multiple Phones: Max ${details.maxLocationPhones} phones  
📱 Same Device Multiple Phones: Max ${details.maxDevicePhones} phones  
🌍 Same Browser Multiple Phones: Max ${details.maxBrowserPhones} phones  
💻 Same OS Multiple Phones: Max ${details.maxOSPhones} phones  
📏 Same Screen Size Multiple Phones: Max ${details.maxScreenPhones} phones  
${details.hasEmailWith5Plus ? "⚠️ This email is used with 5+ phones!" : ""}`;
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: msg, time: getCurrentTime() },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Fraud check by phone ----
      const fraudMatch =
        userInput.match(/check fraud (\d+)/i) ||
        userInput.match(/ফোন (\d+) এর ফ্রড চেক কর/i) ||
        normalized.match(/check fraud (\d+)/i) ||
        normalized.match(/fraud check (\d+)/i) ||
        normalized.match(/check (\d+)/i);
      if (fraudMatch) {
        const phone = fraudMatch[1];
        const result = await checkFraud(phone);
        if (!result.exists) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `No orders found for ${phone}.`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          const status = result.suspicious ? "⚠️ Suspicious" : "✅ Normal";
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `${status} – Phone ${phone} has fraud score ${result.score}. Type "fraud details ${phone}" for details.`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Fake order ----
      if (
        lowerInput.includes("fake order") ||
        lowerInput.includes("ফেক অর্ডার") ||
        lowerInput.includes("test order") ||
        normalized.includes("fake order") ||
        normalized.includes("test order")
      ) {
        const result = await createFakeOrder();
        if (result.success) {
          let reply = `✅ Fake order created! ID: ${result.order.id}`;
          if (result.warning) reply += result.warning;
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: reply, time: getCurrentTime() },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ ${result.message}`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Update order status ----
      const updateMatch =
        userInput.match(/update order (ORD-\d+) to (\w+)/i) ||
        userInput.match(/অর্ডার (ORD-\d+) (?:এর )?স্ট্যাটাস (\w+) করুন/i) ||
        normalized.match(/update order (ord-\d+) to (\w+)/i) ||
        normalized.match(/order (ord-\d+) status (\w+)/i);
      if (updateMatch) {
        const orderId = updateMatch[1];
        const newStatus = updateMatch[2];
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `✅ Order ${orderId} status updated to ${newStatus}`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ Failed to update order.`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Delete order ----
      const deleteOrderMatch =
        userInput.match(/delete order (ORD-\d+)/i) ||
        userInput.match(/অর্ডার ডিলিট (ORD-\d+)/i) ||
        normalized.match(/delete order (ord-\d+)/i);
      if (deleteOrderMatch) {
        const orderId = deleteOrderMatch[1];
        const result = await deleteOrder(orderId);
        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `✅ Order ${orderId} deleted.`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ Failed to delete order.`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Add product ----
      const addProductMatch =
        userInput.match(/add product (.+?) (\d+) (\w+) (.+?) (.+)/i) ||
        userInput.match(/নতুন প্রোডাক্ট যোগ (.+?) (\d+) (\w+) (.+?) (.+)/i) ||
        normalized.match(/add product (.+?) (\d+) (\w+) (.+?) (.+)/i);
      if (addProductMatch) {
        const name = addProductMatch[1];
        const price = parseFloat(addProductMatch[2]);
        const category = addProductMatch[3];
        const img = addProductMatch[4];
        const description = addProductMatch[5];
        const productData = {
          name,
          price,
          category,
          img,
          description,
          originalPrice: price,
          inStock: true,
        };
        const result = await addProduct(productData);
        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `✅ Product "${name}" added with ID ${result.product.id}.`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ Failed to add product: ${result.message}`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Edit product (structured) ----
      const editProductMatch =
        userInput.match(/edit product (\d+) (\w+) (.+)/i) ||
        userInput.match(/প্রোডাক্ট এডিট (\d+) (\w+) (.+)/i) ||
        normalized.match(/edit product (\d+) (\w+) (.+)/i);
      if (editProductMatch) {
        const productId = parseInt(editProductMatch[1]);
        const field = editProductMatch[2].toLowerCase();
        const newValue = editProductMatch[3].trim();

        const products = await fetchProducts();
        const product = products.find((p) => p.id === productId);
        if (!product) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ প্রোডাক্ট আইডি ${productId} পাওয়া যায়নি।`,
              time: getCurrentTime(),
            },
          ]);
          setIsTyping(false);
          return;
        }

        let fieldToUpdate;
        if (field === "name" || field === "নাম") fieldToUpdate = "name";
        else if (field === "price" || field === "দাম") fieldToUpdate = "price";
        else if (field === "category" || field === "ক্যাটাগরি")
          fieldToUpdate = "category";
        else if (field === "img" || field === "ছবি") fieldToUpdate = "img";
        else if (field === "description" || field === "বিবরণ")
          fieldToUpdate = "description";
        else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ ফিল্ড "${field}" সমর্থিত নয়। সমর্থিত ফিল্ড: name, price, category, img, description`,
              time: getCurrentTime(),
            },
          ]);
          setIsTyping(false);
          return;
        }

        const updatedData = {
          ...product,
          [fieldToUpdate]:
            fieldToUpdate === "price" ? parseFloat(newValue) : newValue,
        };
        const result = await editProduct(productId, updatedData);
        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `✅ প্রোডাক্ট ${productId} আপডেট করা হয়েছে।`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ প্রোডাক্ট এডিট করতে ব্যর্থ: ${result.message}`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Delete product ----
      const deleteProductMatch =
        lowerInput.match(/delete product (\d+)/i) ||
        lowerInput.match(/প্রোডাক্ট ডিলিট (\d+)/i) ||
        normalized.match(/delete product (\d+)/i);
      if (deleteProductMatch) {
        const productId = parseInt(deleteProductMatch[1]);
        const result = await deleteProduct(productId);
        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `✅ Product ${productId} deleted.`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ Failed to delete product.`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Add category ----
      const addCatMatch =
        userInput.match(/add category (.+)/i) ||
        userInput.match(/নতুন ক্যাটাগরি যোগ (.+)/i) ||
        normalized.match(/add category (.+)/i);
      if (addCatMatch) {
        const catName = addCatMatch[1].trim();
        const result = await addCategory(catName);
        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `✅ Category "${catName}" added.`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ ${result.message}`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Edit category ----
      const editCatMatch =
        userInput.match(/edit category (.+) to (.+)/i) ||
        userInput.match(/ক্যাটাগরি এডিট (.+) (?:থেকে|to) (.+)/i) ||
        normalized.match(/edit category (.+) to (.+)/i);
      if (editCatMatch) {
        const oldName = editCatMatch[1].trim();
        const newName = editCatMatch[2].trim();
        const result = await editCategory(oldName, newName);
        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `✅ Category renamed from "${oldName}" to "${newName}".`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ ${result.message}`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Delete category ----
      const deleteCatMatch =
        userInput.match(/delete category (.+)/i) ||
        userInput.match(/ক্যাটাগরি ডিলিট (.+)/i) ||
        normalized.match(/delete category (.+)/i);
      if (deleteCatMatch) {
        const catName = deleteCatMatch[1].trim();
        const result = await deleteCategory(catName);
        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `✅ Category "${catName}" deleted.`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ ${result.message}`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Update user role ----
      const roleMatch =
        userInput.match(/make user (.+) (admin|user)/i) ||
        userInput.match(/ইউজার (.+) কে (এডমিন|ইউজার) বানাও/i) ||
        normalized.match(/make user (.+) (admin|user)/i);
      if (roleMatch) {
        const email = roleMatch[1].trim();
        const newRole =
          roleMatch[2].toLowerCase() === "এডমিন" ? "admin" : "user";
        const result = await updateUserRole(email, newRole);
        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `✅ User ${email} is now ${newRole}.`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ Failed to update role.`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Delete user ----
      const deleteUserMatch =
        userInput.match(/delete user (.+)/i) ||
        userInput.match(/ইউজার ডিলিট (.+)/i) ||
        normalized.match(/delete user (.+)/i);
      if (deleteUserMatch) {
        const email = deleteUserMatch[1].trim();
        const result = await deleteUser(email);
        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `✅ User ${email} deleted.`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ Failed to delete user.`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Change site name ----
      const changeSiteNameMatch =
        userInput.match(/change site name to (.+)/i) ||
        userInput.match(/সাইটের নাম পরিবর্তন কর (.+)/i) ||
        normalized.match(/change site name to (.+)/i);
      if (changeSiteNameMatch) {
        const newName = changeSiteNameMatch[1].trim();
        const settings = await fetchSettings();
        const updatedSettings = { ...settings, siteName: newName };
        const result = await updateSiteSettings(updatedSettings);
        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `✅ সাইটের নাম পরিবর্তন করে "${newName}" করা হয়েছে।`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ সাইটের নাম পরিবর্তন করতে ব্যর্থ।`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // ---- Set primary color ----
      const setPrimaryColorMatch =
        userInput.match(/set primary color to (.+)/i) ||
        userInput.match(/প্রাইমারি কালার (.+) সেট কর/i) ||
        normalized.match(/set primary color to (.+)/i);
      if (setPrimaryColorMatch) {
        const newColor = setPrimaryColorMatch[1].trim();
        const settings = await fetchSettings();
        const updatedSettings = { ...settings, primaryColor: newColor };
        const result = await updateSiteSettings(updatedSettings);
        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `✅ প্রাইমারি কালার "${newColor}" সেট করা হয়েছে।`,
              time: getCurrentTime(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ কালার সেট করতে ব্যর্থ।`,
              time: getCurrentTime(),
            },
          ]);
        }
        setIsTyping(false);
        return;
      }
    }

    // ---------- 5. CUSTOMER HANDLERS (common) ----------
    // Return policy
    if (
      lowerInput.includes("কিভাবে রিটার্ন করব") ||
      lowerInput.includes("return policy") ||
      normalized.includes("how to return") ||
      normalized.includes("return policy")
    ) {
      const returnPolicy =
        "আপনি অর্ডার ডেলিভারির ৭ দিনের মধ্যে প্রোডাক্ট রিটার্ন করতে পারেন। প্রোডাক্ট অবশ্যই ইউজড বা ক্ষতিগ্রস্ত হবে না। রিটার্ন অনুরোধ করতে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।";
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: returnPolicy, time: getCurrentTime() },
      ]);
      setIsTyping(false);
      return;
    }

    // Shipping time
    if (
      lowerInput.includes("শিপিং কতদিন") ||
      lowerInput.includes("shipping time") ||
      normalized.includes("shipping time") ||
      normalized.includes("how long shipping")
    ) {
      const shippingTime =
        "সাধারণত অর্ডার কনফার্মেশনের ৩-৫ কর্মদিবসের মধ্যে পণ্য ডেলিভারি করা হয়।";
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: shippingTime, time: getCurrentTime() },
      ]);
      setIsTyping(false);
      return;
    }

    // Payment methods
    if (
      lowerInput.includes("পেমেন্ট মেথড") ||
      lowerInput.includes("payment method") ||
      normalized.includes("payment method") ||
      normalized.includes("payment options")
    ) {
      const paymentMethods =
        "আমরা নগদ (COD), বিকাশ, রকেট, এবং ক্রেডিট/ডেবিট কার্ড গ্রহণ করি।";
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: paymentMethods, time: getCurrentTime() },
      ]);
      setIsTyping(false);
      return;
    }

    // Product list / search
    if (
      lowerInput.includes("প্রোডাক্ট দেখাও") ||
      lowerInput.includes("কি কি প্রোডাক্ট আছে") ||
      lowerInput.includes("product list") ||
      normalized.includes("show products") ||
      normalized.includes("list products") ||
      (normalized.includes("what") && normalized.includes("product"))
    ) {
      const products = await fetchProducts();
      if (products.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "কোনো প্রোডাক্ট পাওয়া যায়নি।",
            time: getCurrentTime(),
          },
        ]);
      } else {
        const productList = products
          .slice(0, 10)
          .map((p) => `🛍️ **${p.name}** - ৳${p.price}`)
          .join("\n");
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `**আমাদের প্রোডাক্ট (প্রথম ১০টি):**\n${productList}`,
            time: getCurrentTime(),
          },
        ]);
      }
      setIsTyping(false);
      return;
    }

    // User orders
    if (
      user &&
      (lowerInput.includes("আমার অর্ডার") ||
        lowerInput.includes("my orders") ||
        normalized.includes("my orders") ||
        (normalized.includes("show") && normalized.includes("my orders")))
    ) {
      const orders = await fetchUserOrders(); // already sorted
      if (orders.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "আপনার কোনো অর্ডার নেই।",
            time: getCurrentTime(),
          },
        ]);
      } else {
        const orderList = orders
          .slice(0, 5)
          .map((o) => `📦 **${o.id}** – ${o.status} – $${o.total}`)
          .join("\n");
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `**আপনার অর্ডার (সর্বশেষ ৫টি):**\n${orderList}`,
            time: getCurrentTime(),
          },
        ]);
      }
      setIsTyping(false);
      return;
    }

    // ---------- 6. FALLBACK: AI WITH CONTEXT ----------
    let contextData = "";

    if (
      lowerInput.includes("product") ||
      lowerInput.includes("প্রোডাক্ট") ||
      lowerInput.includes("পণ্য")
    ) {
      const products = await fetchProducts();
      contextData +=
        "Available products:\n" +
        JSON.stringify(products.slice(0, 10), null, 2) +
        "\n\n";
    }

    if (user) {
      if (lowerInput.includes("order") || lowerInput.includes("অর্ডার")) {
        const orders = await fetchUserOrders();
        contextData +=
          "Your orders:\n" + JSON.stringify(orders, null, 2) + "\n\n";
      }
    } else {
      if (
        lowerInput.includes("order") ||
        lowerInput.includes("cart") ||
        lowerInput.includes("wishlist") ||
        lowerInput.includes("profile")
      ) {
        contextData +=
          "User is not logged in. Please log in to access your orders, cart, wishlist, or profile.\n\n";
      }
    }

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "NoboDeal Support AI",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: getSystemPrompt(contextData) },
            ...messages.map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text,
            })),
            { role: "user", content: userInput },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      const botReply = data.choices[0].message.content;
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply, time: getCurrentTime() },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "দুঃখিত, এখন সংযোগে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।",
          time: getCurrentTime(),
        },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="support-chat-container">
      <div className="chat-header">
        <div className="header-title">
          <span className="header-icon">🛍️</span>
          <h3>Support AI {isAdmin && "(Admin Mode)"}</h3>
        </div>
        <button onClick={onClose} className="close-btn">
          ✖
        </button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <div className="msg-avatar">
              {msg.sender === "user" ? (
                "👤"
              ) : (
                <img
                  className="AIimg"
                  src="https://img.freepik.com/premium-vector/chat-bot-logo-smiling-virtual-assistant-bot-smiles-icon-logo-robot-head-with-headphones_843540-91.jpg"
                  alt="Bot"
                />
              )}
            </div>
            <div className="bubble">
              <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>
              <div className="timestamp">{msg.time}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot">
            <div className="msg-avatar">
              <img
                className="AIimg"
                src="https://img.freepik.com/premium-vector/chat-bot-logo-smiling-virtual-assistant-bot-smiles-icon-logo-robot-head-with-headphones_843540-91.jpg"
                alt="Bot"
              />
            </div>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <div className="help-trigger" onClick={sendHelpMessage}>
          help?
        </div>
        <div className="input-row">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            disabled={isTyping}
          />
          <button onClick={sendMessage} disabled={isTyping}>
            {isTyping ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportAI;
