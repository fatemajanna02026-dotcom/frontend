import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductPage.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ProductPage({
  user,
  addToCartSimple,
  toggleWishlist,
  wishlist,
  siteSettings,
  cart,
  openCheckout,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Basic States
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [activeTab, setActiveTab] = useState("description");

  // Product Selection States
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });

  // Horizontal Scroll States
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [duplicatedProducts, setDuplicatedProducts] = useState([]);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // ========== ১. ডাটা ফেচিং ও এরর হ্যান্ডলিং ==========
  useEffect(() => {
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    fetch(`${API_BASE}/products`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setAllProducts(data);
        const found = data.find((p) => p.id === parseInt(id));

        if (found) {
          setProduct(found);
          const related = data
            .filter((p) => p.category === found.category && p.id !== found.id)
            .slice(0, 4);
          setRelatedProducts(related);
        } else {
          setError("Product not found");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Something went wrong while loading the product.");
        setLoading(false);
      });
  }, [id]);

  // ========== ২. ডুপ্লিকেট প্রোডাক্ট তৈরি (Auto-Scroll এর জন্য) ==========
  useEffect(() => {
    if (allProducts.length > 0 && product) {
      const categoryProducts = allProducts
        .filter((p) => p.category === product.category && p.id !== product.id)
        .sort((a, b) => (b.sold || 0) - (a.sold || 0));

      if (categoryProducts.length > 0) {
        setDuplicatedProducts([
          ...categoryProducts,
          ...categoryProducts,
          ...categoryProducts,
        ]);
      } else {
        setDuplicatedProducts([]);
      }
    }
  }, [allProducts, product]);

  // ========== ৩. অটো-স্ক্রল লজিক ==========
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (
      !scrollElement ||
      !isAutoScrolling ||
      isHovering ||
      duplicatedProducts.length === 0
    )
      return;

    let animationFrame;
    const SCROLL_SPEED = 1.5;

    const autoScroll = () => {
      if (!scrollElement) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
      let newScrollLeft = scrollLeft + SCROLL_SPEED;

      if (newScrollLeft >= (scrollWidth / 3) * 2) {
        newScrollLeft = scrollWidth / 3;
      }

      scrollElement.scrollLeft = newScrollLeft;
      checkScroll();

      animationFrame = requestAnimationFrame(autoScroll);
    };

    animationFrame = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrame);
  }, [isAutoScrolling, isHovering, duplicatedProducts.length]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 20);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      setIsAutoScrolling(false);
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(() => setIsAutoScrolling(true), 4000);
    }
  };

  // ========== নতুন: সব ছবির তালিকা তৈরি (মূল ছবি + গ্যালারি) ==========
  const displayImages = product?.img
    ? [product.img, ...(product.images || [])]
    : product?.images || [];

  // ========== ৪. ইমেজ জুম (Magnifier) ==========
  const handleImageMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundImage: `url(${displayImages[selectedImage]})`,
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  // ========== ৫. কাস্টম টোস্ট মেসেজ ==========
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleAddToCart = () => {
    if (product.type === "variable" && !selectedSize) {
      showToast("⚠️ Please select a size first");
      return;
    }
    addToCartSimple({ ...product, selectedSize, quantity });
    showToast("✅ Added to cart successfully!");
  };

  const handleBuyNow = () => {
    if (product.type === "variable" && !selectedSize) {
      showToast("⚠️ Please select a size first");
      return;
    }
    addToCartSimple({ ...product, selectedSize, quantity });
    openCheckout();
  };

  // ========== ৬. কন্ডিশনাল রেন্ডারিং ==========
  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Loading perfect matches...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="not-found">
        <h2>Oops!</h2>
        <p>{error || "Product not found"}</p>
        <button onClick={() => navigate("/")} className="btn-primary">
          Return to Shop
        </button>
      </div>
    );
  }

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  const currentStock =
    product.type === "variable" && selectedSize
      ? product.sizes.find((s) => s.size === selectedSize)?.stock
      : product.stock || 10;

  return (
    <div className="product-page-container">
      {/* Toast Notification */}
      {toastMsg && <div className="toast-notification">{toastMsg}</div>}

      <div className="product-main-grid">
        {/* Left: Image Gallery */}
        <div className="product-gallery">
          <div
            className="main-image-wrapper"
            onMouseMove={handleImageMouseMove}
            onMouseLeave={() => setZoomStyle({ display: "none" })}
          >
            <img
              src={
                displayImages.length > 0
                  ? displayImages[selectedImage]
                  : "https://via.placeholder.com/400"
              }
              alt={product.name}
              className="main-image"
            />
            {/* Zoom Lens */}
            <div className="zoom-lens" style={zoomStyle}></div>
            {discount > 0 && (
              <span className="badge-discount">-{discount}% OFF</span>
            )}
          </div>

          {/* থাম্বনেইল ট্র্যাক - এখন displayImages ব্যবহার করছে */}
          {displayImages.length > 1 && (
            <div className="thumbnail-track">
              {displayImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  className={`thumb-btn ${selectedImage === idx ? "active" : ""}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="product-details">
          <h1 className="product-title">{product.name}</h1>

          <div className="price-wrapper">
            <span className="current-price">${product.price}</span>
            {discount > 0 && (
              <span className="original-price">${product.originalPrice}</span>
            )}
          </div>

          {/* Size Selector */}
          {product.type === "variable" && product.sizes?.length > 0 && (
            <div className="attribute-section">
              <h4>Available Sizes</h4>
              <div className="size-grid">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    className={`size-btn ${selectedSize === s.size ? "selected" : ""} ${s.stock === 0 ? "out-of-stock" : ""}`}
                    onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                    disabled={s.stock === 0}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="stock-status">
            {currentStock > 0 ? (
              <span
                className={currentStock < 5 ? "text-warning" : "text-success"}
              >
                {currentStock < 5
                  ? `Only ${currentStock} left in stock - Order soon!`
                  : "In Stock"}
              </span>
            ) : (
              <span className="text-danger">Out of Stock</span>
            )}
          </div>

          {/* Quantity */}
          <div className="attribute-section">
            <h4>Quantity</h4>
            <div className="qty-controller">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input type="number" value={quantity} readOnly />
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(currentStock, q + 1))
                }
                disabled={quantity >= currentStock}
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="action-group">
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={currentStock === 0}
            >
              🛒 Add to Cart
            </button>
            <button
              className="btn-buy-now"
              onClick={handleBuyNow}
              disabled={currentStock === 0}
            >
              ⚡ Buy it Now
            </button>
            <button
              className={`btn-wishlist ${wishlist.some((i) => i.id === product.id) ? "active" : ""}`}
              onClick={() => toggleWishlist(product)}
            >
              {wishlist.some((i) => i.id === product.id) ? "❤️" : "🤍"}
            </button>
          </div>

          {/* Tabs Section */}
          <div className="advanced-tabs">
            <div className="tab-nav">
              {["description", "reviews", "shipping"].map((tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="tab-panel">
              {activeTab === "description" && (
                <div className="prose">
                  {product.description || "No description provided."}
                </div>
              )}
              {activeTab === "reviews" && (
                <div>
                  {siteSettings?.enableReviews
                    ? "⭐⭐⭐⭐⭐ (No reviews yet)"
                    : "Reviews are disabled."}
                </div>
              )}
              {activeTab === "shipping" && (
                <ul className="shipping-list">
                  <li>🚀 Fast Delivery within 3-5 business days.</li>
                  <li>🛡️ 30-Days easy return policy.</li>
                  <li>💳 Secure checkout guaranteed.</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auto Scrolling Category Products */}
      {duplicatedProducts.length > 0 && (
        <section className="scroll-section">
          <div className="section-header">
            <h2>Trending in {product.category}</h2>
            <button
              className="auto-toggle-btn"
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            >
              {isAutoScrolling ? "⏸️ Pause" : "▶️ Play"}
            </button>
          </div>

          <div className="carousel-container">
            {showLeftArrow && (
              <button className="arrow-btn left" onClick={() => scroll("left")}>
                ❮
              </button>
            )}

            <div
              className="carousel-track"
              ref={scrollRef}
              onScroll={checkScroll}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {duplicatedProducts.map((p, idx) => (
                <div
                  key={`${p.id}-${idx}`}
                  className="carousel-card"
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div className="img-wrap">
                    <img
                      src={p.img || "https://via.placeholder.com/200"}
                      alt={p.name}
                      loading="lazy"
                    />
                    {p.originalPrice > p.price && (
                      <span className="discount-tag">Sale</span>
                    )}
                  </div>
                  <div className="card-info">
                    <h5>{p.name}</h5>
                    <div className="card-price">
                      <span>${p.price}</span>
                      {p.originalPrice && <del>${p.originalPrice}</del>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showRightArrow && (
              <button
                className="arrow-btn right"
                onClick={() => scroll("right")}
              >
                ❯
              </button>
            )}
          </div>
        </section>
      )}

      {/* Basic Grid */}
      {relatedProducts.length > 0 && (
        <section className="grid-section">
          <h2>You May Also Like</h2>
          <div className="grid-layout">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                className="grid-card"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <img
                  src={p.img || "https://via.placeholder.com/200"}
                  alt={p.name}
                  loading="lazy"
                />
                <div className="card-info">
                  <h5>{p.name}</h5>
                  <span>${p.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductPage;
