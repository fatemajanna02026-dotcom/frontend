import React, { useState, useEffect, useRef, useMemo } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import jsPDF from "jspdf";
import confetti from "canvas-confetti";
import autoTable from "jspdf-autotable";
import Admin from "./Admin";
import Login from "./login";
import SupportAI from "./SupportAI";
import ProductPage from "./ProductPage";
import "./App.css";

const firebaseConfig = {
  apiKey: "AIzaSyA90ImxNOiWsR5VAn-p1zHKSoqwhG8pZaQ",
  authDomain: "e-commerce-shop-site.firebaseapp.com",
  projectId: "e-commerce-shop-site",
  storageBucket: "e-commerce-shop-site.firebasestorage.app",
  messagingSenderId: "97870190376",
  appId: "1:97870190376:web:3de3ba20b58b63d51a621d",
  measurementId: "G-4DNX6CBYP0",
};

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function App() {
  const navigate = useNavigate();

  // Location, browser, notification states
  const [userLocation, setUserLocation] = useState(null);
  const [browserInfo, setBrowserInfo] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(
    Notification?.permission || "default",
  );
  const [checkoutLocation, setCheckoutLocation] = useState(null);

  // Support AI and contact states
  const [showSupportAI, setShowSupportAI] = useState(false);
  const [showSupportMenu, setShowSupportMenu] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your shopping assistant. How can I help you today?",
    },
  ]);

  const toggleSupportMenu = () => setShowSupportMenu(!showSupportMenu);
  const openChatAI = () => {
    setShowSupportAI(true);
    setShowSupportMenu(false);
  };
  const openWhatsApp = () =>
    window.open("https://wa.me/8801775113977", "_blank");
  const openMessenger = () =>
    window.open("https://m.me/lone.for.trust.issuee", "_blank");

  // Existing app states
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };
  const [products, setProducts] = useState([]);
  const [cat, setCat] = useState("Home");
  const [categories, setCategories] = useState([
    "Home",
    "Cloth",
    "Gadget",
    "Book",
  ]);
  const [isLocating, setIsLocating] = useState(false); // লোকেশন লোড হচ্ছে কিনা
  const [showAuth, setShowAuth] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [siteSettings, setSiteSettings] = useState({});
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [cart, setCart] = useState(user?.cart || []);
  const [wishlist, setWishlist] = useState(user?.wishlist || []);
  const [checkoutData, setCheckoutData] = useState({
    name: "",
    address: "",
    phone: "",
    paymentMethod: "COD",
  });
  const [navbarMaxVisible, setNavbarMaxVisible] = useState(5);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [sliderSettings, setSliderSettings] = useState({
    autoPlay: true,
    interval: 4500,
    showArrows: true,
    showDots: true,
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHoveringSlider, setIsHoveringSlider] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    currentPassword: "",
    newEmail: "",
    newPassword: "",
    confirmPassword: "",
    name: "",
    defaultAddress: "",
    defaultPhone: "",
    profilePicture: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [animatingHeart, setAnimatingHeart] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const productRefs = useRef([]);
  const observer = useRef(null);

  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity,
    0,
  );

  // Price filter states
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(Infinity);
  const [tempMin, setTempMin] = useState("");
  const [tempMax, setTempMax] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const priceFilterRef = useRef(null);

  // সর্বোচ্চ প্রোডাক্ট প্রাইস (স্লাইডারের max এর জন্য)
  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 10000;
    return Math.max(...products.map((p) => p.price), 10000);
  }, [products]);

  // ডেলিভারি চার্জের জন্য স্টেট
  const [deliveryZone, setDeliveryZone] = useState("inside"); // "inside" or "outside"
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Layout Builder state (default sections)
  const [layoutSections, setLayoutSections] = useState([
    {
      id: "featured",
      type: "featured",
      title: "Featured Products",
      enabled: true,
    },
    {
      id: "newArrivals",
      type: "newArrivals",
      title: "New Arrivals",
      enabled: true,
    },
    {
      id: "bestSellers",
      type: "bestSellers",
      title: "Best Sellers",
      enabled: true,
    },
    {
      id: "whyChoose",
      type: "whyChoose",
      title: "Why Choose AI Store?",
      enabled: true,
    },
    {
      id: "categories",
      type: "categories",
      title: "Shop by Category",
      enabled: true,
    },
  ]);

  // Page Builder state
  const [layout, setLayout] = useState([]);

  // Invoice states
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Computed data for homepage sections
  const newArrivals = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8);
  }, [products]);

  const bestSellers = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 8);
  }, [products]);

  const categoryList = categories.filter((c) => c !== "Home");

  // Apply category (from navbar) AND price filter
  const filtered = useMemo(() => {
    // 1. প্রাইস ফিল্টার ড্রপডাউনের ক্যাটাগরি অনুযায়ী বেস প্রোডাক্ট নির্বাচন
    let baseProducts;
    if (filterCategory === "All") {
      // "All Categories" সিলেক্ট থাকলে সব প্রোডাক্ট নেবে (navbar-এর ক্যাটাগরি ইগনোর)
      baseProducts = products;
    } else {
      // নির্দিষ্ট ক্যাটাগরি সিলেক্ট থাকলে শুধু সেই ক্যাটাগরির প্রোডাক্ট
      baseProducts = products.filter((p) => p.category === filterCategory);
    }

    // 2. প্রাইস ফিল্টার প্রয়োগ (যদি সক্রিয় থাকে)
    if (priceMin > 0 || priceMax !== Infinity) {
      baseProducts = baseProducts.filter(
        (p) => p.price >= priceMin && p.price <= priceMax,
      );
    }
    return baseProducts;
  }, [products, filterCategory, priceMin, priceMax]);
  // ========== Helper Functions ==========
const getCheckoutLocation = () => {
  if (!navigator.geolocation) {
    alert("আপনার ব্রাউজার জিওলোকেশন সাপোর্ট করে না।");
    return;
  }

  setIsLocating(true);

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      setCheckoutLocation({ latitude, longitude });
      const inside = isInsideDhaka(latitude, longitude);
      setDeliveryZone(inside ? "inside" : "outside");
      setIsLocating(false);
    },
    (error) => {
      setIsLocating(false);

      switch (error.code) {
        case 2:
          alert("📡 লোকেশন সিগন্যাল পাওয়া যাচ্ছে না।");
          break;
        case 3:
          alert("⏱️ সময় শেষ হয়ে গেছে। আবার চেষ্টা করুন।");
          break;
        default:
          alert("⚠️ লোকেশন নেওয়া যায়নি।");
      }
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
  );
};
  // ঢাকার সীমানা নির্ধারণ (৩০ কিমি)
  const isInsideDhaka = (lat, lng) => {
    const dhakaLat = 23.8103;
    const dhakaLng = 90.4125;
    const R = 6371;
    const dLat = ((lat - dhakaLat) * Math.PI) / 180;
    const dLng = ((lng - dhakaLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((dhakaLat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance <= 30;
  };

  // Apply price filter
  const applyPriceFilter = () => {
    const minVal = tempMin === "" ? 0 : Number(tempMin);
    const maxVal = tempMax === "" ? Infinity : Number(tempMax);
    if (minVal < 0 || maxVal < 0 || (minVal > maxVal && maxVal !== Infinity)) {
      alert("Invalid price range");
      return;
    }
    setPriceMin(minVal);
    setPriceMax(maxVal);
    if (filterCategory !== "All") {
      setCat(filterCategory);
      closeMobileMenu();
    }
    setShowPriceFilter(false);
  };

  const resetPriceFilter = () => {
    setPriceMin(0);
    setPriceMax(Infinity);
    setTempMin("");
    setTempMax("");
    setFilterCategory("All");
    setCat("Home"); // ← এটা যোগ করলে navbar Home এ চলে যাবে
    setShowPriceFilter(false);
  };

  // App.js-এর স্টেট অংশে (অন্যান্য useState-এর সাথে যোগ করুন)
  const [homepageSections, setHomepageSections] = useState([]);

  // useEffect যোগ করুন (যেখানে অন্যান্য ডাটা ফেচ করা হয়, সেখানে)
  useEffect(() => {
    fetch(`${API_BASE}/layout-sections`)
      .then((res) => res.json())
      .then((data) => setHomepageSections(data))
      .catch((err) => console.error("Failed to load layout sections", err));
  }, []);
  // Close filter dropdown when clicking outside
  // More dropdown বাইরে click করলে বন্ধ হবে
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".more-dropdown")) {
        setShowMoreDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ProductCard = ({ product }) => {
    const discount =
      product.originalPrice && product.originalPrice > product.price
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) *
              100,
          )
        : 0;
    const isInWishlist = wishlist.some((item) => item.id === product.id);
    const isAnimating = animatingHeart === product.id;

    return (
      <div className="product-card">
        <div className="product-badge">
          {discount > 0 && <span className="discount-badge">-{discount}%</span>}
          {product.sold > 0 && (
            <span className="sold-badge">Sold {product.sold}</span>
          )}
        </div>
        <div
          className={`wishlist-icon ${isInWishlist ? "active" : ""} ${
            isAnimating ? "pop" : ""
          }`}
          onClick={() => toggleWishlist(product)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <img
          src={product.img || "https://placehold.co/150x150"}
          alt={product.name}
          onClick={() => goToProductPage(product)}
        />
        <h3 onClick={() => goToProductPage(product)}>{product.name}</h3>
        <div className="price-section">
          {discount > 0 ? (
            <>
              <span className="current-price">${product.price}</span>
              <span className="original-price">${product.originalPrice}</span>
            </>
          ) : (
            <span className="current-price">${product.price}</span>
          )}
        </div>
        <div className="card-actions">
          {product.type === "variable" ? (
            <button
              onClick={() => goToProductPage(product)}
              className="btn-add-cart"
            >
              Select Size
            </button>
          ) : (
            <button
              onClick={() => addToCartSimple(product)}
              className="btn-add-cart"
            >
              Add to Cart
            </button>
          )}
          <button
            onClick={() => goToProductPage(product)}
            className="btn-buy-now"
          >
            Buy Now
          </button>
        </div>
      </div>
    );
  };

  const CustomPage = ({ layout, siteSettings }) => (
    <div className="custom-page">
      {layout.map((element) => (
        <div key={element.id} style={element.styles}>
          {element.type === "hero" && (
            <div>
              <h3>{element.content.title}</h3>
              <p>{element.content.subtitle}</p>
              <button>{element.content.buttonText}</button>
              <img
                src={element.content.image}
                alt=""
                style={{ maxWidth: "100%" }}
              />
            </div>
          )}
          {element.type === "text" && <p>{element.content.text}</p>}
          {element.type === "image" && (
            <img
              src={element.content.src}
              alt={element.content.alt}
              style={{ maxWidth: "100%" }}
            />
          )}
          {element.type === "button" && (
            <button>{element.content.buttonText}</button>
          )}
          {element.type === "products" && (
            <div>Products Grid (count: {element.content.count})</div>
          )}
          {element.type === "footer" && <footer>{element.content.text}</footer>}
        </div>
      ))}
    </div>
  );

  // ========== Effects ==========

  // যখন invoice শো হবে, তখন কনফেটি ফায়ার করবে
  useEffect(() => {
    if (showInvoice) {
      // কনফেটি এফেক্ট (পটকা/ফানফেয়ার)
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        startVelocity: 20,
        colors: ["#e94560", "#f39c12", "#2ecc71", "#3498db"],
      });
      // একটু পরে আরেকটি ব্যাস্ট
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.5, x: 0.3 },
          startVelocity: 25,
        });
      }, 200);
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.5, x: 0.7 },
          startVelocity: 25,
        });
      }, 400);
    }
  }, [showInvoice]);

  useEffect(() => {
    if (products.length === 0) {
      setProducts([
        {
          id: 1,
          name: "Sample Product",
          price: 100,
          img: "https://placehold.co/150x150",
          category: "Cloth",
          type: "simple",
          sold: 5,
        },
      ]);
    }
  }, []);

  // ডেলিভারি ফি আপডেট হবে যখন জোন বা সাইট সেটিংস পরিবর্তন হবে
  // App.js-এর useEffect অংশে (যেখানে siteSettings পরিবর্তন হলে ডেলিভারি ফি আপডেট হয়)
  useEffect(() => {
    const inside = siteSettings.dhakaShipping || 60;
    const outside = siteSettings.outsideDhakaShipping || 120;
    setDeliveryFee(deliveryZone === "inside" ? inside : outside);
  }, [deliveryZone, siteSettings]);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-visible");
            observer.current.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" },
    );
    return () => observer.current?.disconnect();
  }, []);

  useEffect(() => {
    if (observer.current) {
      productRefs.current.forEach(
        (ref) => ref && observer.current.observe(ref),
      );
    }
  }, [filtered]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyTheme = (settings) => {
    if (settings.darkMode) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
    document.documentElement.style.setProperty(
      "--primary-color",
      settings.primaryColor || "#e94560",
    );
    document.documentElement.style.setProperty(
      "--secondary-color",
      settings.secondaryColor || "#1a1a2e",
    );
    document.documentElement.style.setProperty(
      "--border-radius",
      settings.borderRadius || "8px",
    );
    document.documentElement.style.setProperty(
      "--box-shadow",
      settings.boxShadow || "0 4px 12px rgba(0,0,0,0.1)",
    );
    document.documentElement.style.setProperty(
      "--font-family",
      settings.fontFamily || "'Poppins', sans-serif",
    );
    document.documentElement.style.setProperty(
      "--animation-speed",
      settings.animationSpeed || "0.3s",
    );

    let styleEl = document.getElementById("custom-css");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "custom-css";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = settings.customCSS || "";

    let scriptEl = document.getElementById("custom-js");
    if (scriptEl) scriptEl.remove();
    if (settings.customJS) {
      scriptEl = document.createElement("script");
      scriptEl.id = "custom-js";
      scriptEl.textContent = settings.customJS;
      document.body.appendChild(scriptEl);
    }
  };

  const collectBrowserInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    setBrowserInfo(info);
    if (user) {
      fetch(`${API_BASE}/update-browser-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, browserInfo: info }),
      }).catch((err) => console.error("Browser info update failed", err));
    }
    return info;
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert("আপনার ব্রাউজার জিওলোকেশন সাপোর্ট করে না।");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        if (user) {
          try {
            await fetch(`${API_BASE}/update-location`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: user.email, latitude, longitude }),
            });
            alert("লোকেশন সফলভাবে সংরক্ষিত হয়েছে।");
          } catch (err) {
            console.error("লোকেশন আপডেট ব্যর্থ", err);
          }
        }
      },
      (error) => {
        console.warn("লোকেশন পারমিশন প্রত্যাখ্যান:", error);
        alert("লোকেশন অ্যাক্সেস করা যায়নি। দয়া করে অনুমতি দিন।");
      },
    );
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("এই ব্রাউজারে নোটিফিকেশন সাপোর্ট করে না।");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (user) {
      try {
        await fetch(`${API_BASE}/update-notification-permission`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, permission }),
        });
        if (permission === "granted") {
          new Notification(" ", {
            body: "নোটিফিকেশন সক্রিয় হয়েছে! অর্ডার আপডেট পাবেন।",
            icon: "/logo192.png",
          });
        }
      } catch (err) {
        console.error("Notification permission update failed", err);
      }
    }
  };

  useEffect(() => {
    if (user) {
      collectBrowserInfo();
      if (Notification.permission) {
        fetch(`${API_BASE}/update-notification-permission`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            permission: Notification.permission,
          }),
        }).catch((err) =>
          console.error("Failed to sync notification permission", err),
        );
      }
    }
  }, [user]);

  // Fetch initial data only once (no auto-refresh)
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/products`).then((r) =>
        r.ok ? r.json() : Promise.reject(),
      ),
      fetch(`${API_BASE}/settings`).then((r) =>
        r.ok ? r.json() : Promise.reject(),
      ),
      fetch(`${API_BASE}/categories`).then((r) =>
        r.ok ? r.json() : Promise.reject(),
      ),
      fetch(`${API_BASE}/layout-sections`).then((r) => (r.ok ? r.json() : [])), // <- নতুন
    ])
      .then(([productsData, settingsData, catData, layoutData]) => {
        setProducts(productsData);
        setSiteSettings(settingsData);
        setCategories(catData);
        setLayoutSections(
          layoutData.length ? layoutData : getDefaultSections(),
        );
        const featuredIds = settingsData.featuredProductIds || [];
        setFeaturedProducts(
          productsData.filter((p) => featuredIds.includes(p.id)),
        );
        setNavbarMaxVisible(settingsData.navbarMaxVisible || 5);
        setSliderSettings({
          autoPlay: settingsData.sliderAutoPlay ?? true,
          interval: settingsData.sliderInterval || 4500,
          showArrows: settingsData.sliderShowArrows ?? true,
          showDots: settingsData.sliderShowDots ?? true,
        });
        applyTheme(settingsData);
      })
      .catch((err) => console.error(err));
  }, []); // Runs only once on mount – no periodic refresh

  useEffect(() => {
    fetch(`${API_BASE}/page-layout`)
      .then((res) => res.json())
      .then((data) => setLayout(data))
      .catch((err) => console.error("Failed to load page layout", err));
  }, []);

  useEffect(() => {
    if (showProfile && user) {
      setProfileForm({
        currentPassword: "",
        newEmail: user.email || "",
        newPassword: "",
        confirmPassword: "",
        name: user.name || "",
        defaultAddress: user.defaultAddress || "",
        defaultPhone: user.defaultPhone || "",
        profilePicture: user.profilePicture || "",
      });
      setProfileImageFile(null);
    }
  }, [showProfile, user]);

  useEffect(() => {
    if (user) {
      fetch(`${API_BASE}/user/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, cart, wishlist }),
      });
      localStorage.setItem("user", JSON.stringify({ ...user, cart, wishlist }));
    }
  }, [cart, wishlist, user]);

  useEffect(() => {
    if (siteSettings.featuredProductIds && products.length) {
      setFeaturedProducts(
        products.filter((p) => siteSettings.featuredProductIds.includes(p.id)),
      );
    }
  }, [products, siteSettings.featuredProductIds]);

  useEffect(() => {
    applyTheme(siteSettings);
  }, [siteSettings]);

  // User orders
  const fetchUserOrders = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/user/orders/${user.email}`);
      const data = await res.json();
      setUserOrders(data);
      setShowMyOrders(true);
      setIsMobileMenuOpen(false);
      setShowUserDropdown(false);
    } catch (err) {
      alert("Could not fetch orders.");
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/update-order/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      const data = await res.json();
      if (data.success) {
        setUserOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "Cancelled" } : order,
          ),
        );
        alert("Order cancelled successfully.");
      } else {
        alert("Failed to cancel order.");
      }
    } catch (err) {
      alert("Error cancelling order.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = {
        name: result.user.displayName,
        email: result.user.email,
        role: "user",
        cart: [],
        wishlist: [],
      };
      setUser(loggedInUser);
      setCart([]);
      setWishlist([]);
      setShowAuth(false);
    } catch (error) {
      console.error("Google Login Error:", error);
      alert("Google Login failed! Check console for details.");
    }
  };

  const goToProductPage = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleBuyNow = (product) => {
    // Directly navigate to product page instead of modal
    navigate(`/product/${product.id}`);
  };

  const addToCartSimple = (item) => {
    const product = item;
    const size = item.selectedSize || null;
    const quantity = item.quantity || 1;
    setCart([...cart, { product, size, quantity }]);
  };

  const addToCartFromDetails = () => {
    if (selectedProduct.type === "variable" && !selectedSize) {
      alert("Please select a size.");
      return;
    }
    setCart([
      ...cart,
      {
        product: selectedProduct,
        size: selectedSize || null,
        quantity: selectedQuantity,
      },
    ]);
    setShowProductDetails(false);
  };

  const buyNowFromDetails = () => {
    if (selectedProduct.type === "variable" && !selectedSize) {
      alert("Please select a size.");
      return;
    }
    setCart([
      ...cart,
      {
        product: selectedProduct,
        size: selectedSize || null,
        quantity: selectedQuantity,
      },
    ]);
    setShowProductDetails(false);
    openCheckout();
  };

  const buyNowFromWishlist = (product) => {
    setCart([...cart, { product, size: null, quantity: 1 }]);
    setShowWishlist(false);
    openCheckout();
  };

  const openCheckout = () => {
    setCheckoutData({
      name: user?.name || "",
      address: user?.defaultAddress || "",
      phone: user?.defaultPhone || "",
      paymentMethod: "COD",
    });
    setDeliveryZone("inside"); // ডিফল্ট ঢাকার ভিতরে
    setCheckoutLocation(null);
    setShowCheckout(true);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // অতিরিক্ত নিরাপত্তা

    // ফোন নম্বর চেক
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(checkoutData.phone)) {
      alert("Phone number must be exactly 11 digits.");
      return;
    }

    // লোকেশন লোডিং চললে অর্ডার না হওয়া
    if (isLocating) {
      alert("দয়া করে লোকেশন লোড হওয়া পর্যন্ত অপেক্ষা করুন।");
      return;
    }

    const subtotal = cart.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    // সিলেক্টর থেকে নেওয়া deliveryZone ব্যবহার করুন
    const deliveryFee =
      deliveryZone === "inside"
        ? siteSettings.dhakaShipping || 60
        : siteSettings.outsideDhakaShipping || 120;

    const total = subtotal + deliveryFee;

    const orderData = {
      userEmail: user ? user.email : "guestuser@gmail.com",
      userName: user ? user.name : checkoutData.name,
      userPhone: checkoutData.phone,
      userAddress: checkoutData.address,
      items: cart,
      subtotal,
      deliveryFee,
      deliveryZone, // ← সিলেক্টরের মান
      total,
      paymentMethod: checkoutData.paymentMethod,
      latitude: checkoutLocation?.latitude,
      longitude: checkoutLocation?.longitude,
    };

    try {
      const res = await fetch(`${API_BASE}/place-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (data.success) {
        setCart([]);
        setShowCheckout(false);
        setCurrentOrder(data.order);
        setShowInvoice(true);
        setCheckoutLocation(null);
      } else {
        alert("Order failed");
      }
    } catch (err) {
      alert("Error placing order");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (
      profileForm.newPassword &&
      profileForm.newPassword !== profileForm.confirmPassword
    ) {
      alert("নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মেলেনি।");
      return;
    }
    if (profileForm.newPassword && profileForm.newPassword.length < 6) {
      alert("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }
    if (profileForm.defaultPhone) {
      const phoneRegex = /^\d{11}$/;
      if (!phoneRegex.test(profileForm.defaultPhone)) {
        alert("ফোন নম্বর ঠিক ১১ ডিজিটের হতে হবে।");
        return;
      }
    }

    const isEmailChanged =
      profileForm.newEmail && profileForm.newEmail !== user.email;
    const isPasswordChanged =
      profileForm.newPassword && profileForm.newPassword.trim() !== "";

    if ((isEmailChanged || isPasswordChanged) && !profileForm.currentPassword) {
      alert("ইমেইল বা পাসওয়ার্ড পরিবর্তনের জন্য বর্তমান পাসওয়ার্ড আবশ্যক।");
      return;
    }

    let pictureUrl = profileForm.profilePicture;
    if (profileImageFile) {
      const formData = new FormData();
      formData.append("image", profileImageFile);
      try {
        const uploadRes = await fetch(`${API_BASE}/upload`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          pictureUrl = uploadData.imageUrl;
        } else {
          alert("ছবি আপলোড ব্যর্থ হয়েছে।");
          return;
        }
      } catch (err) {
        alert("ছবি আপলোড এরর।");
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE}/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail: user.email,
          currentPassword: profileForm.currentPassword || undefined,
          newEmail: isEmailChanged ? profileForm.newEmail : undefined,
          newPassword: isPasswordChanged ? profileForm.newPassword : undefined,
          name: profileForm.name,
          profilePicture: pictureUrl,
          defaultAddress: profileForm.defaultAddress,
          defaultPhone: profileForm.defaultPhone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("প্রোফাইল সফলভাবে আপডেট হয়েছে।");
        updateUser(data.user);
        setShowProfile(false);
      } else {
        alert(data.message || "আপডেট ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      alert("সার্ভার এরর।");
    }
  };

  const toggleWishlist = (product) => {
    setAnimatingHeart(product.id);
    setTimeout(() => setAnimatingHeart(null), 300);
    if (wishlist.some((item) => item.id === product.id)) {
      setWishlist(wishlist.filter((item) => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  useEffect(() => {
    if (
      !sliderSettings.autoPlay ||
      isHoveringSlider ||
      featuredProducts.length === 0
    )
      return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, sliderSettings.interval);
    return () => clearInterval(interval);
  }, [
    sliderSettings.autoPlay,
    sliderSettings.interval,
    featuredProducts.length,
    isHoveringSlider,
  ]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? "hidden" : "auto";
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = "auto";
  };

const downloadInvoice = () => {
  if (!currentOrder) return;
  const doc = new jsPDF();
  const margin = 15;

  doc.setFontSize(22);
  doc.setTextColor(233, 69, 96);
  doc.text(siteSettings.siteName || " ", margin, 25);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text("Invoice", margin, 35);
  doc.text(`Order ID: ${currentOrder.id}`, margin, 42);
  doc.text(
    `Date: ${new Date(currentOrder.date).toLocaleDateString()}`,
    margin,
    49,
  );

  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text("Bill To:", margin, 60);
  doc.text(`Name: ${currentOrder.userName || "N/A"}`, margin, 67);
  doc.text(`Phone: ${currentOrder.userPhone || "N/A"}`, margin, 74);
  doc.text(`Address: ${currentOrder.userAddress || "N/A"}`, margin, 81);

  let tableStartY = 90;

  if (currentOrder.latitude && currentOrder.longitude) {
    doc.text(
      `Location: ${currentOrder.latitude.toFixed(5)}, ${currentOrder.longitude.toFixed(5)}`,
      margin,
      88,
    );
    tableStartY = 98; // location থাকলে table একটু নিচে
  }

  const tableColumn = ["Product", "Size", "Qty", "Price", "Total"];
  const tableRows = currentOrder.items.map((item) => {
    const product = item.product || item;
    return [
      product.name || "Unknown",
      item.size || "-",
      (item.quantity || 1).toString(),
      `$${product.price || 0}`,
      `$${(product.price || 0) * (item.quantity || 1)}`,
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [233, 69, 96] },
    margin: { left: margin, right: margin },
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setTextColor(0);

  const subtotal =
    currentOrder.subtotal ||
    currentOrder.total - (currentOrder.deliveryFee || 0);

  doc.text(`Subtotal: $${subtotal}`, margin, finalY);

  if (
    currentOrder.deliveryFee !== undefined &&
    currentOrder.deliveryFee !== null
  ) {
    doc.text(
      `Delivery Zone: ${currentOrder.deliveryZone === "inside" ? "Inside Dhaka" : "Outside Dhaka"}`,
      margin,
      finalY + 7,
    );
    doc.text(
      `Delivery Fee: $${currentOrder.deliveryFee}`,
      margin,
      finalY + 14,
    );
    doc.text(`Total: $${currentOrder.total}`, margin, finalY + 21);
  } else {
    doc.text(`Total: $${currentOrder.total}`, margin, finalY + 7);
  }

  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Thank you for shopping with us!", margin, finalY + 35);
  doc.text(siteSettings.footerText || "© AI Store", margin, finalY + 42);

  doc.save(`invoice-${currentOrder.id}.pdf`);
};

  // ========== Render ==========
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div
          className="logo"
          onClick={() => {
            setIsAdminMode(false);
            setCat("Home");
            closeMobileMenu();
            navigate("/");
          }}
        >
          {siteSettings.logoUrl && (
            <img src={siteSettings.logoUrl} alt="logo" />
          )}
          <span>{siteSettings.siteName || " "}</span>
        </div>

        <div className={`nav-menu ${isMobileMenuOpen ? "open" : ""}`}>
          <div className="nav-links">
            {categories.slice(0, navbarMaxVisible).map((item) => (
              <span
                key={item}
                onClick={() => {
                  setCat(item);
                  setFilterCategory(item); // ← এই লাইন যোগ করো
                  setIsAdminMode(false);
                  closeMobileMenu();
                  navigate("/");
                }}
                className={`nav-item ${cat === item ? "active" : ""}`}
              >
                {item}
              </span>
            ))}
            {categories.length > navbarMaxVisible && (
              <div className="more-dropdown" style={{ position: "relative" }}>
                <span
                  className="nav-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoreDropdown((prev) => !prev); // ✅ toggle — খোলে ও বন্ধ হয়
                  }}
                >
                  More {showMoreDropdown ? "▲" : "▼"}
                </span>
                {showMoreDropdown && (
                  <div className="dropdown-menu">
                    {categories.slice(navbarMaxVisible).map((item) => (
                      <div
                        key={item}
                        onClick={() => {
                          setCat(item);
                          setIsAdminMode(false);
                          setShowMoreDropdown(false);
                          closeMobileMenu();
                          navigate("/");
                        }}
                        className="dropdown-item"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="nav-actions">
          {/* Price Filter Icon & Dropdown */}
          {/* Price Filter Icon & Dropdown */}
          {/* Price Filter Icon & Dropdown */}
          <div className="price-filter-container" ref={priceFilterRef}>
            <div
              className="price-filter-icon"
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              style={{
                cursor: "pointer",
                fontSize: "24px",
                position: "relative",
              }}
            >
              💲
              {(priceMin > 0 || priceMax !== Infinity) && (
                <span className="filter-active-dot"></span>
              )}
            </div>
            {showPriceFilter && (
              <div className="price-filter-dropdown">
                {/* Close button */}
                <button
                  className="price-filter-close"
                  onClick={() => setShowPriceFilter(false)}
                >
                  ✖
                </button>

                <div className="filter-category">
                  <label>📂 Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setFilterCategory(newCat);
                      if (newCat !== "All") {
                        setCat(newCat); // লাইভ ক্যাটাগরি পরিবর্তন
                        closeMobileMenu();
                      }
                    }}
                  >
                    <option value="All">All Categories</option>
                    {categoryList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dual thumb range slider - live apply */}
                <div className="filter-range-slider">
                  <label>
                    💰 Price Range: ${tempMin || 0} – $
                    {tempMax === "" ? "∞" : tempMax}
                  </label>
                  <div className="slider-wrapper">
                    <input
                      type="range"
                      min={0}
                      max={maxProductPrice}
                      value={tempMin === "" ? 0 : Number(tempMin)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTempMin(val);
                        setPriceMin(val); // লাইভ আপডেট
                      }}
                      className="slider-min"
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxProductPrice}
                      value={tempMax === "" ? maxProductPrice : Number(tempMax)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTempMax(val);
                        setPriceMax(val);
                      }}
                      className="slider-max"
                    />
                  </div>
                </div>

                {/* Numeric inputs - live apply */}
                <div className="filter-price-inputs">
                  <input
                    type="number"
                    placeholder="Min $"
                    value={tempMin}
                    onChange={(e) => {
                      const val =
                        e.target.value === "" ? "" : Number(e.target.value);
                      setTempMin(val);
                      if (val !== "") setPriceMin(val);
                      else setPriceMin(0);
                    }}
                  />
                  <span>–</span>
                  <input
                    type="number"
                    placeholder="Max $"
                    value={tempMax}
                    onChange={(e) => {
                      const val =
                        e.target.value === "" ? "" : Number(e.target.value);
                      setTempMax(val);
                      if (val !== "") setPriceMax(val);
                      else setPriceMax(Infinity);
                    }}
                  />
                </div>

                {/* Only Reset button - no Apply button */}
                <div className="filter-actions">
                  <button onClick={resetPriceFilter}>Reset</button>
                </div>
              </div>
            )}
          </div>

          <div
            style={{ cursor: "pointer" }}
            onClick={() => setShowWishlist(true)}
          >
            ❤️ <span className="icon-badge">{wishlist.length}</span>
          </div>
          <div style={{ cursor: "pointer" }} onClick={() => setShowCart(true)}>
            🛒 <span className="icon-badge">{cart.length}</span>
          </div>
          {user ? (
            <>
              <span
                onClick={fetchUserOrders}
                className="user-name desktop-only"
                style={{
                  cursor: "pointer",
                  borderBottom: "1px dashed var(--primary-color)",
                }}
              >
                My Orders
              </span>
              <div
                className="desktop-only"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="profile"
                    onClick={() => {
                      setShowProfile(true);
                      closeMobileMenu();
                    }}
                    className="profile-nav-img"
                  />
                ) : (
                  <span
                    onClick={() => {
                      setShowProfile(true);
                      closeMobileMenu();
                    }}
                    className="user-name"
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px dashed var(--primary-color)",
                    }}
                  >
                    Profile
                  </span>
                )}
              </div>
              {(user.email === "sabbirmolla801@gmail.com" ||
                user.role === "admin") && (
                <button
                  onClick={() => {
                    setIsAdminMode(!isAdminMode);
                    navigate("/");
                  }}
                  className="admin-btn desktop-only"
                >
                  Admin Panel
                </button>
              )}
              <button
                className="logout-btn desktop-only"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                Logout
              </button>

              <div
                className="mobile-only"
                ref={userDropdownRef}
                style={{ position: "relative" }}
              >
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="profile"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="profile-nav-img"
                    style={{ marginLeft: 0 }}
                  />
                ) : (
                  <span
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    style={{ cursor: "pointer", fontSize: "20px" }}
                  >
                    👤
                  </span>
                )}
                {showUserDropdown && (
                  <div className="user-dropdown">
                    <div
                      onClick={() => {
                        fetchUserOrders();
                        setShowUserDropdown(false);
                      }}
                      className="user-dropdown-item"
                    >
                      My Orders
                    </div>
                    <div
                      onClick={() => {
                        setShowProfile(true);
                        setShowUserDropdown(false);
                        closeMobileMenu();
                      }}
                      className="user-dropdown-item"
                    >
                      Profile
                    </div>
                    {(user.email === "sabbirmolla801@gmail.com" ||
                      user.role === "admin") && (
                      <div
                        onClick={() => {
                          setIsAdminMode(!isAdminMode);
                          setShowUserDropdown(false);
                          navigate("/");
                        }}
                        className="user-dropdown-item"
                      >
                        Admin Panel
                      </div>
                    )}
                    <div
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="user-dropdown-item"
                    >
                      Logout
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowAuth(true)}
                className="login-btn desktop-only"
              >
                Login
              </button>
              <div
                className="mobile-only"
                style={{ cursor: "pointer", fontSize: "20px" }}
                onClick={() => setShowAuth(true)}
              >
                👤
              </div>
            </>
          )}
          <div
            className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}
            onClick={toggleMobileMenu}
          >
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
      )}

      {/* Main content with Routes */}
      <div className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {!isAdminMode &&
                  cat === "Home" &&
                  featuredProducts.length > 0 && (
                    <div
                      className="slider-container"
                      onMouseEnter={() => setIsHoveringSlider(true)}
                      onMouseLeave={() => setIsHoveringSlider(false)}
                    >
                      <div
                        className="slider-track"
                        style={{
                          transform: `translateX(-${currentSlide * 100}%)`,
                        }}
                      >
                        {featuredProducts.map((p, idx) => (
                          <div key={idx} className="slide">
                            <img
                              src={p.img}
                              alt={p.name}
                              onClick={() => goToProductPage(p)}
                              style={{ cursor: "pointer" }}
                            />
                            <div className="slide-caption">
                              <h2>{p.name}</h2>
                              <p>Only ${p.price}</p>
                              <button
                                onClick={() => goToProductPage(p)}
                                className="slide-btn"
                              >
                                Shop Now →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {sliderSettings.showArrows && (
                        <>
                          <button
                            onClick={() =>
                              setCurrentSlide(
                                (currentSlide - 1 + featuredProducts.length) %
                                  featuredProducts.length,
                              )
                            }
                            className="slider-arrow left"
                          >
                            ←
                          </button>
                          <button
                            onClick={() =>
                              setCurrentSlide(
                                (currentSlide + 1) % featuredProducts.length,
                              )
                            }
                            className="slider-arrow right"
                          >
                            →
                          </button>
                        </>
                      )}
                      {sliderSettings.showDots && (
                        <div className="slider-dots">
                          {featuredProducts.map((_, idx) => (
                            <div
                              key={idx}
                              onClick={() => setCurrentSlide(idx)}
                              className={`dot ${currentSlide === idx ? "active" : ""}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                {isAdminMode && user ? (
                  <Admin
                    user={user}
                    siteSettings={siteSettings}
                    setSiteSettings={(newSettings) => {
                      setSiteSettings(newSettings);
                      applyTheme(newSettings);
                    }}
                    updateUser={updateUser}
                    applyTheme={applyTheme}
                    onLayoutSectionsSaved={(sections) => setLayoutSections(sections)}
                  />
                ) : (
                  <>
                    {cat === "Home" ? (
                      <div className="homepage-sections">
                        {layoutSections
                          .filter((section) => section.enabled)
                          .map((section) => {
                            switch (section.type) {
                              case "featured":
                                return (
                                  featuredProducts.length > 0 && (
                                    <section
                                      key={section.id}
                                      className="home-section fade-in"
                                      ref={(el) =>
                                        el && observer.current?.observe(el)
                                      }
                                    >
                                      <div className="section-header">
                                        <h2>Featured Products</h2>
                                      </div>
                                      <div className="product-grid">
                                        {featuredProducts.map((p) => (
                                          <ProductCard key={p.id} product={p} />
                                        ))}
                                      </div>
                                    </section>
                                  )
                                );
                              case "newArrivals":
                                return (
                                  newArrivals.length > 0 && (
                                    <section
                                      key={section.id}
                                      className="home-section fade-in"
                                      ref={(el) =>
                                        el && observer.current?.observe(el)
                                      }
                                    >
                                      <div className="section-header">
                                        <h2>New Arrivals</h2>
                                      </div>
                                      <div className="product-grid">
                                        {newArrivals.map((p) => (
                                          <ProductCard key={p.id} product={p} />
                                        ))}
                                      </div>
                                    </section>
                                  )
                                );
                              case "bestSellers":
                                return (
                                  bestSellers.length > 0 && (
                                    <section
                                      key={section.id}
                                      className="home-section fade-in"
                                      ref={(el) =>
                                        el && observer.current?.observe(el)
                                      }
                                    >
                                      <div className="section-header">
                                        <h2>Best Sellers</h2>
                                      </div>
                                      <div className="product-grid">
                                        {bestSellers.map((p) => (
                                          <ProductCard key={p.id} product={p} />
                                        ))}
                                      </div>
                                    </section>
                                  )
                                );
                              case "whyChoose":
                                return (
                                  <section
                                    key={section.id}
                                    className="home-section why-choose-section fade-in"
                                    ref={(el) =>
                                      el && observer.current?.observe(el)
                                    }
                                  >
                                    <div className="section-header">
                                      <span className="gradient-text">
                                        Why Choose AI Store?
                                      </span>
                                    </div>
                                    <p className="section-subheader">
                                      We combine cutting-edge technology with a
                                      seamless user experience to bring you the
                                      best products.
                                    </p>
                                    <div className="features-grid">
                                      <div className="feature-card">
                                        <div className="feature-icon">
                                          <img
                                            src="https://i.ibb.co.com/SDKgMPkv/ai-img-removebg-preview.png"
                                            alt="AI Icon"
                                            className="ai-img"
                                          />
                                        </div>
                                        <h3>AI Recommendations</h3>
                                        <p>
                                          Smart suggestions based on your unique
                                          style.
                                        </p>
                                      </div>
                                      <div className="feature-card">
                                        <div className="feature-icon">🔒</div>
                                        <h3>Secure Checkout</h3>
                                        <p>
                                          Bank-level encryption for every
                                          transaction.
                                        </p>
                                      </div>
                                      <div className="feature-card">
                                        <div className="feature-icon">🚚</div>
                                        <h3>Express Delivery</h3>
                                        <p>
                                          Get your items quickly and reliably.
                                        </p>
                                      </div>
                                    </div>
                                  </section>
                                );
                              case "categories":
                                return (
                                  categoryList.length > 0 && (
                                    <section
                                      key={section.id}
                                      className="home-section categories-section fade-in"
                                      ref={(el) =>
                                        el && observer.current?.observe(el)
                                      }
                                    >
                                      <div className="section-header">
                                        <span className="gradient-text">
                                          🛍️ Shop by Category
                                        </span>
                                      </div>
                                      <div className="category-grid">
                                        {categoryList.map((catName) => (
                                          <div
                                            key={catName}
                                            className="category-card"
                                            onClick={() => setCat(catName)}
                                          >
                                            <h3>{catName}</h3>
                                            <span>Explore →</span>
                                          </div>
                                        ))}
                                      </div>
                                    </section>
                                  )
                                );
                              default:
                                return null;
                            }
                          })}
                      </div>
                    ) : (
                      <div className="category-page">
                        {siteSettings.categoryMessages &&
                          siteSettings.categoryMessages[cat] && (
                            <div
                              key={cat}
                              className="category-welcome-banner"
                              style={{
                                "--text-length":
                                  siteSettings.categoryMessages[cat].length,
                              }}
                            >
                              {siteSettings.categoryMessages[cat]}
                            </div>
                          )}
                        <div className="product-grid">
                          {filtered.map((p, index) => {
                            const discount =
                              p.originalPrice && p.originalPrice > p.price
                                ? Math.round(
                                    ((p.originalPrice - p.price) /
                                      p.originalPrice) *
                                      100,
                                  )
                                : 0;
                            const isInWishlist = wishlist.some(
                              (item) => item.id === p.id,
                            );
                            const isAnimating = animatingHeart === p.id;
                            return (
                              <div
                                key={p.id}
                                className="product-card fade-in"
                                ref={(el) => (productRefs.current[index] = el)}
                              >
                                <div className="product-badge">
                                  {discount > 0 && (
                                    <span className="discount-badge">
                                      -{discount}%
                                    </span>
                                  )}
                                  {p.sold > 0 && (
                                    <span className="sold-badge">
                                      Sold {p.sold}
                                    </span>
                                  )}
                                </div>
                                <div
                                  className={`wishlist-icon ${isInWishlist ? "active" : ""} ${
                                    isAnimating ? "pop" : ""
                                  }`}
                                  onClick={() => toggleWishlist(p)}
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    width="24"
                                    height="24"
                                  >
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                  </svg>
                                </div>
                                <img
                                  src={p.img || "https://placehold.co/150x150"}
                                  alt={p.name}
                                  onClick={() => goToProductPage(p)}
                                />
                                <h3 onClick={() => goToProductPage(p)}>
                                  {p.name}
                                </h3>
                                <div className="price-section">
                                  {discount > 0 ? (
                                    <>
                                      <span className="current-price">
                                        ${p.price}
                                      </span>
                                      <span className="original-price">
                                        ${p.originalPrice}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="current-price">
                                      ${p.price}
                                    </span>
                                  )}
                                </div>
                                <div className="card-actions">
                                  {p.type === "variable" ? (
                                    <button
                                      onClick={() => goToProductPage(p)}
                                      className="btn-add-cart"
                                    >
                                      Select Size
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => addToCartSimple(p)}
                                      className="btn-add-cart"
                                    >
                                      Add to Cart
                                    </button>
                                  )}
                                  <button
                                    onClick={() => goToProductPage(p)}
                                    className="btn-buy-now"
                                  >
                                    Buy Now
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductPage
                user={user}
                addToCartSimple={addToCartSimple}
                toggleWishlist={toggleWishlist}
                wishlist={wishlist}
                siteSettings={siteSettings}
                cart={cart}
                openCheckout={openCheckout}
              />
            }
          />
          {layout.length > 0 && (
            <Route
              path="/custom-page"
              element={
                <CustomPage layout={layout} siteSettings={siteSettings} />
              }
            />
          )}
        </Routes>
      </div>

      {/* All modals and side panels – unchanged */}
      {showProductDetails && selectedProduct && (
        <div className="modal product-details-modal">
          <div className="modal-header">
            <h2>{selectedProduct.name}</h2>
            <button
              onClick={() => setShowProductDetails(false)}
              className="close-btn"
            >
              ✖
            </button>
          </div>
          <div className="product-details">
            <div className="product-image">
              <img
                src={selectedProduct.img || "https://via.placeholder.com/300"}
                alt={selectedProduct.name}
              />
            </div>
            <div className="product-info">
              <h3>বিবরণ</h3>
              <p>{selectedProduct.description || "কোনো বিবরণ দেওয়া হয়নি।"}</p>
              <h3>মূল্য</h3>
              <p className="product-price">${selectedProduct.price}</p>
              {selectedProduct.originalPrice &&
                selectedProduct.originalPrice > selectedProduct.price && (
                  <p className="original-price">
                    মূল্যমূল্য: ${selectedProduct.originalPrice} (ছাড়{" "}
                    {Math.round(
                      ((selectedProduct.originalPrice - selectedProduct.price) /
                        selectedProduct.originalPrice) *
                        100,
                    )}
                    %)
                  </p>
                )}
              {selectedProduct.type === "variable" &&
                selectedProduct.sizes &&
                selectedProduct.sizes.length > 0 && (
                  <>
                    <h3>সাইজ নির্বাচন করুন</h3>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "15px",
                        flexWrap: "wrap",
                      }}
                    >
                      {selectedProduct.sizes.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSize(s.size)}
                          style={{
                            padding: "8px 16px",
                            border:
                              selectedSize === s.size
                                ? "2px solid var(--primary-color)"
                                : "1px solid #ddd",
                            background:
                              selectedSize === s.size
                                ? "var(--primary-color)"
                                : "#fff",
                            color: selectedSize === s.size ? "#fff" : "#333",
                            borderRadius: "4px",
                            cursor: s.stock > 0 ? "pointer" : "not-allowed",
                            opacity: s.stock > 0 ? 1 : 0.5,
                            fontWeight: "bold",
                          }}
                          disabled={s.stock === 0}
                        >
                          {s.size} {s.stock === 0 && "(Out)"}
                        </button>
                      ))}
                    </div>
                    {selectedSize && (
                      <p>
                        স্টক:{" "}
                        {
                          selectedProduct.sizes.find(
                            (s) => s.size === selectedSize,
                          )?.stock
                        }
                      </p>
                    )}
                    <h3>পরিমাণ</h3>
                    <input
                      type="number"
                      min="1"
                      max={
                        selectedProduct.sizes.find(
                          (s) => s.size === selectedSize,
                        )?.stock || 1
                      }
                      value={selectedQuantity}
                      onChange={(e) =>
                        setSelectedQuantity(parseInt(e.target.value) || 1)
                      }
                      className="auth-input"
                      style={{ width: "100px" }}
                      disabled={!selectedSize}
                    />
                  </>
                )}
              {selectedProduct.type !== "variable" && (
                <>
                  <h3>পরিমাণ</h3>
                  <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) =>
                      setSelectedQuantity(parseInt(e.target.value) || 1)
                    }
                    className="auth-input"
                    style={{ width: "100px" }}
                  />
                </>
              )}
              <h3>রিভিউ</h3>
              <div className="reviews">
                {siteSettings.enableReviews ? (
                  <p>এখানে গ্রাহকদের রিভিউ দেখাবে।</p>
                ) : (
                  <p>রিভিউ সুবিধা বর্তমানে বন্ধ আছে।</p>
                )}
              </div>
              <div className="modal-actions">
                <button onClick={addToCartFromDetails} className="btn-add-cart">
                  Add to Cart
                </button>
                <button onClick={buyNowFromDetails} className="btn-buy-now">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="side-panel wide-panel">
          <div className="panel-header">
            <h2>আপনার প্রোফাইল</h2>
            <button onClick={() => setShowProfile(false)} className="close-btn">
              ✖
            </button>
          </div>
          <form onSubmit={handleProfileUpdate}>
            <div className="profile-image-section">
              <label>প্রোফাইল ছবি</label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {profileForm.profilePicture && !profileImageFile && (
                  <img src={profileForm.profilePicture} alt="profile" />
                )}
                {profileImageFile && (
                  <img
                    src={URL.createObjectURL(profileImageFile)}
                    alt="preview"
                  />
                )}
                <label htmlFor="profile-upload" className="file-upload-btn">
                  ছবি নির্বাচন করুন
                </label>
                <input
                  type="file"
                  id="profile-upload"
                  accept="image/*"
                  onChange={(e) => setProfileImageFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>
            </div>
            <div className="input-grid">
              <input
                type="text"
                placeholder="আপনার নাম"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                className="auth-input"
              />
              <input
                type="email"
                placeholder="নতুন ইমেইল (ঐচ্ছিক)"
                value={profileForm.newEmail}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, newEmail: e.target.value })
                }
                className="auth-input"
              />
              <input
                type="password"
                placeholder="বর্তমান পাসওয়ার্ড *"
                value={profileForm.currentPassword}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    currentPassword: e.target.value,
                  })
                }
                className="auth-input"
              />
              <input
                type="password"
                placeholder="নতুন পাসওয়ার্ড (ঐচ্ছিক, নূন্যতম ৬ অক্ষর)"
                value={profileForm.newPassword}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    newPassword: e.target.value,
                  })
                }
                className="auth-input"
              />
              <input
                type="password"
                placeholder="নতুন পাসওয়ার্ড কনফার্ম করুন"
                value={profileForm.confirmPassword}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="auth-input"
              />
              <input
                type="tel"
                placeholder="ডিফল্ট ফোন নম্বর (১১ ডিজিট)"
                value={profileForm.defaultPhone}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    defaultPhone: e.target.value,
                  })
                }
                className="auth-input"
              />
              <input
                type="text"
                placeholder="ডিফল্ট ঠিকানা"
                value={profileForm.defaultAddress}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    defaultAddress: e.target.value,
                  })
                }
                className="auth-input full-width"
              />
            </div>
            <button
              type="submit"
              className="auth-btn"
              style={{ background: "var(--primary-color)" }}
            >
              আপডেট প্রোফাইল
            </button>
          </form>
        </div>
      )}

      {showMyOrders && (
        <div className="modal">
          <div className="modal-header">
            <h2>My Orders 📦</h2>
            <button
              onClick={() => setShowMyOrders(false)}
              className="close-btn"
            >
              ✖
            </button>
          </div>
          {userOrders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            userOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <strong>ID: {order.id}</strong>
                  <span
                    className={`order-status ${order.status ? order.status.toLowerCase() : "pending"}`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>
                <p className="order-date">
                  {order.date ? new Date(order.date).toLocaleString() : "N/A"}
                </p>
                <div className="order-items">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => {
                      const product = item.product || item;
                      const productImg =
                        product.img ||
                        item.img ||
                        "https://via.placeholder.com/40";
                      const productName =
                        product.name || item.name || "Unknown";
                      const productPrice = product.price || item.price || 0;
                      const size = item.size || "";
                      const quantity = item.quantity || 1;
                      return (
                        <div key={idx} className="order-item">
                          <img src={productImg} alt={productName} />
                          <span>
                            {productName} {size && `(Size: ${size})`}{" "}
                            {quantity > 1 && ` x ${quantity}`} - $
                            {productPrice * quantity}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p>No items</p>
                  )}
                </div>

                <p className="order-total">
                  Total: ${order.total || 0} ({order.paymentMethod || "COD"})
                </p>
                {order.status === "Pending" && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="cancel-order-btn"
                    style={{
                      background: "#e94560",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "5px 10px",
                      marginTop: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showCart && (
        <div className="side-panel">
          <div className="panel-header">
            <h2>Cart 🛒</h2>
            <button onClick={() => setShowCart(false)} className="close-btn">
              ✖
            </button>
          </div>
          <div>
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              cart.map((item, i) => (
                <div key={i} className="cart-item">
                  <img
                    src={item.product.img}
                    alt={item.product.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span>{item.product.name}</span>
                    {item.size && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          display: "block",
                        }}
                      >
                        Size: {item.size}
                      </span>
                    )}
                    {item.quantity > 1 && (
                      <span style={{ fontSize: "12px", color: "#666" }}>
                        Qty: {item.quantity}
                      </span>
                    )}
                    <span style={{ display: "block", fontWeight: "bold" }}>
                      ${item.product.price * item.quantity}
                    </span>
                  </div>
                  <button
                    onClick={() => setCart(cart.filter((_, idx) => idx !== i))}
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
            {cart.length > 0 && (
              <>
                <h3 className="cart-total">Total: ${cartTotal}</h3>
                <button onClick={openCheckout} className="checkout-btn">
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showWishlist && (
        <div className="side-panel">
          <div className="panel-header">
            <h2>Wishlist ❤️</h2>
            <button
              onClick={() => setShowWishlist(false)}
              className="close-btn"
            >
              ✖
            </button>
          </div>
          <div>
            {wishlist.length === 0 ? (
              <p>Your wishlist is empty.</p>
            ) : (
              wishlist.map((item, i) => (
                <div key={i} className="cart-item">
                  <img
                    src={item.img}
                    alt={item.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                  <span style={{ flex: 1 }}>{item.name}</span>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button
                      onClick={() =>
                        setCart([
                          ...cart,
                          { product: item, size: null, quantity: 1 },
                        ])
                      }
                      style={{
                        background: "green",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "5px 8px",
                        cursor: "pointer",
                      }}
                    >
                      +🛒
                    </button>
                    <button
                      onClick={() => buyNowFromWishlist(item)}
                      style={{
                        background: "var(--primary-color)",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "5px 8px",
                        cursor: "pointer",
                      }}
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={() =>
                        setWishlist(wishlist.filter((_, idx) => idx !== i))
                      }
                      style={{
                        background: "#e94560",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "5px 8px",
                        cursor: "pointer",
                      }}
                    >
                      ✖
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="modal">
          <div className="modal-header">
            <h2>Checkout</h2>
            <button
              onClick={() => setShowCheckout(false)}
              className="close-btn"
            >
              ✖
            </button>
          </div>
          <form onSubmit={handlePlaceOrder}>
            <h4>Shipping Information</h4>
            <input
              type="text"
              placeholder="Full Name"
              required
              value={checkoutData.name}
              onChange={(e) =>
                setCheckoutData({ ...checkoutData, name: e.target.value })
              }
              className="auth-input"
            />
            <textarea
              placeholder="Full Address"
              required
              value={checkoutData.address}
              onChange={(e) =>
                setCheckoutData({ ...checkoutData, address: e.target.value })
              }
              className="auth-input"
            />

          <button
            type="button"
            onClick={getCheckoutLocation}
            className="btn btn-secondary"
            disabled={isLocating}
          >
            {isLocating
              ? "⏳ লোকেশন নেওয়া হচ্ছে..."
              : checkoutLocation
              ? "✅ লোকেশন পাওয়া গেছে"  // ← location পেলে button text বদলে যাবে
              : "📍 অর্ডারের জন্য লোকেশন দিন"}
          </button>

            <input
              type="tel"
              placeholder="Phone Number (11 digits)"
              required
              value={checkoutData.phone}
              onChange={(e) =>
                setCheckoutData({ ...checkoutData, phone: e.target.value })
              }
              className="auth-input"
            />

            {/* ডেলিভারি জোন - পেমেন্ট মেথডের মতো একই স্টাইল */}
            <h4>🚚 Delivery Zone</h4>
            <select
              value={deliveryZone}
              onChange={(e) => setDeliveryZone(e.target.value)}
              className="auth-input"
            >
              <option value="inside">
                📍 ঢাকার ভিতরে (Delivery Charge: $
                {siteSettings?.dhakaShipping || 60})
              </option>
              <option value="outside">
                🚚 ঢাকার বাইরে (Delivery Charge: $
                {siteSettings?.outsideDhakaShipping || 120})
              </option>
            </select>

            {/* ডেলিভারি ফি আলাদা করে দেখানোর দরকার নেই, কারণ অপশনের ভেতরেই দেখানো হচ্ছে */}

            <h4>Payment Method</h4>
            <select
              value={checkoutData.paymentMethod}
              onChange={(e) =>
                setCheckoutData({
                  ...checkoutData,
                  paymentMethod: e.target.value,
                })
              }
              className="auth-input"
            >
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="bKash">bKash Mobile Banking</option>
            </select>

            {/* টোটাল অ্যামাউন্ট */}
            <div className="total-amount">
              Subtotal: ${cartTotal} <br />
              Delivery Fee: ${deliveryFee} <br />
              <strong>Total Amount: ${cartTotal + deliveryFee}</strong>
            </div>
            <button
              type="submit"
              className="auth-btn"
              style={{ background: "#2ecc71" }}
            >
              Confirm Order
            </button>
          </form>
        </div>
      )}

{showInvoice && currentOrder && (
        <div className="modal invoice-modal">
          <div className="modal-header">
            <h2>Invoice</h2>
            <button onClick={() => setShowInvoice(false)} className="close-btn">
              ✖
            </button>
          </div>
          <div className="invoice-content">
            <div className="invoice-header">
              <h3>{siteSettings.siteName || " "}</h3>
              <p>Order ID: {currentOrder.id}</p>
              <p>Date: {new Date(currentOrder.date).toLocaleString()}</p>
            </div>
              <div className="invoice-customer">
                <h4>Bill To:</h4>
                <p>Name: {currentOrder.userName || "N/A"}</p>
                <p>Phone: {currentOrder.userPhone || "N/A"}</p>
                <p>Address: {currentOrder.userAddress || "N/A"}</p>
                {currentOrder.latitude && currentOrder.longitude ? (
                  <p style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    📍 Live Location:{" "}
                    <a
                      href={`https://maps.google.com/?q=${currentOrder.latitude},${currentOrder.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#e94560", fontWeight: "600" }}
                    >
                      Google Maps এ দেখুন
                    </a>
                  </p>
                ) : (
                  <p style={{ color: "#999", fontSize: "0.85rem" }}>
                    📍 Location: দেওয়া হয়নি
                  </p>
                )}
              </div>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {currentOrder.items.map((item, idx) => {
                  const product = item.product || item;
                  return (
                    <tr key={idx}>
                      <td>{product.name || "Unknown"}</td>
                      <td>{item.size || "-"}</td>
                      <td>{item.quantity || 1}</td>
                      <td>${product.price || 0}</td>
                      <td>${(product.price || 0) * (item.quantity || 1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="invoice-total">
              <p>
                Subtotal: $
                {currentOrder.subtotal ||
                  currentOrder.total - (currentOrder.deliveryFee || 0)}
              </p>
              <p>
                Delivery Zone:{" "}
                {currentOrder.deliveryZone === "inside"
                  ? "ঢাকার ভিতরে"
                  : "ঢাকার বাইরে"}
              </p>
              <p>Delivery Fee: ${currentOrder.deliveryFee || 0}</p>
              
              {/* পেমেন্ট মেথড আপডেট করা হয়েছে */}
              <p>Payment Method: <strong>Cash on Delivery (COD)</strong></p>
              
              <strong>Total: ${currentOrder.total}</strong>
            </div>
            <div className="invoice-footer">
              <p>Thank you for shopping with us!</p>
              <button
                onClick={downloadInvoice}
                className="download-invoice-btn"
              >
                📥 Download PDF Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuth && !user && (
        <div className="side-panel">
          <div className="panel-header">
            <h2>Sign In</h2>
            <button onClick={() => setShowAuth(false)} className="close-btn">
              ✖
            </button>
          </div>
          <Login
            setUser={(u) => {
              setUser(u);
              setCart(u.cart || []);
              setWishlist(u.wishlist || []);
              setShowAuth(false);
            }}
          />
        </div>
      )}

      {/* Floating Support Menu */}
      <div className="floating-actions">
        <div className="support-fab-container">
          <div className={`support-options ${showSupportMenu ? "show" : ""}`}>
            <div className="support-option chat" onClick={openChatAI}>
              <span className="option-icon">💬</span>
              <span className="option-text">AI Chat</span>
            </div>
            <div className="support-option whatsapp" onClick={openWhatsApp}>
              <img
                src="https://img.icons8.com/color/48/000000/whatsapp--v1.png"
                alt="WhatsApp"
              />
              <span className="option-text">WhatsApp</span>
            </div>
            <div className="support-option messenger" onClick={openMessenger}>
              <img
                src="https://img.icons8.com/color/48/000000/facebook-messenger--v1.png"
                alt="Messenger"
              />
              <span className="option-text">Messenger</span>
            </div>
          </div>
          <div
            className={`fab support-fab ${showSupportMenu ? "open" : ""}`}
            onClick={toggleSupportMenu}
          >
            <img
              src="https://img.icons8.com/fluency/48/000000/headset.png"
              alt="Support"
            />
          </div>
        </div>
      </div>

      {showSupportAI && (
        <div className="side-panel support-panel">
          <SupportAI
            onClose={() => setShowSupportAI(false)}
            user={user}
            apiBase={API_BASE}
            messages={chatMessages}
            setMessages={setChatMessages}
            openRouterApiKey={siteSettings.openRouterApiKey}
          />
        </div>
      )}

      {/* Unified overlay */}
      {(showCart ||
        showWishlist ||
        showAuth ||
        showCheckout ||
        showMyOrders ||
        showProductDetails ||
        showInvoice ||
        isMobileMenuOpen ||
        showSupportAI) && (
        <div
          className="panel-overlay"
          onClick={() => {
            setShowCart(false);
            setShowWishlist(false);
            setShowAuth(false);
            setShowCheckout(false);
            setShowMyOrders(false);
            setShowProductDetails(false);
            setShowInvoice(false);
            setShowSupportAI(false);
            closeMobileMenu();
          }}
        />
      )}

      <footer className="footer">
        {siteSettings.footerText || "2026 © Copyright AI Store  "}
      </footer>
    </div>
  );
}

export default App;