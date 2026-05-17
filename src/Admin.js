import React, { useState, useEffect, useRef, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./Admin.css";

// ============================================================
// LAYOUT BUILDER - Drag & drop homepage sections (Hero removed)
// ============================================================
const SECTION_TYPES = [
  {
    id: "featured",
    label: "⭐ Featured Products",
    icon: "⭐",
    color: "#f39c12",
  },
  { id: "categories", label: "📂 Category Grid", icon: "📂", color: "#3498db" },
  { id: "promo", label: "🎁 Promo Banner", icon: "🎁", color: "#2ecc71" },
  { id: "newArrivals", label: "🆕 New Arrivals", icon: "🆕", color: "#9b59b6" },
  {
    id: "testimonials",
    label: "💬 Testimonials",
    icon: "💬",
    color: "#1abc9c",
  },
  { id: "banner", label: "🖼️ Image Banner", icon: "🖼️", color: "#e67e22" },
  {
    id: "countdown",
    label: "⏱️ Countdown Timer",
    icon: "⏱️",
    color: "#e74c3c",
  },
  { id: "newsletter", label: "📧 Newsletter", icon: "📧", color: "#34495e" },
  { id: "brands", label: "🏷️ Brand Logos", icon: "🏷️", color: "#95a5a6" },
  { id: "stats", label: "📊 Stats Bar", icon: "📊", color: "#16a085" },
  { id: "blog", label: "📝 Blog Posts", icon: "📝", color: "#8e44ad" },
];

function LayoutBuilder({ API_BASE, settings }) {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // Load existing layout from server
  useEffect(() => {
    const loadLayout = async () => {
      try {
        const res = await fetch(`${API_BASE}/layout-sections`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length) {
            setSections(data);
            // update available sections based on what's already used
            const usedTypes = data.map((s) => s.type);
            const available = SECTION_TYPES.filter(
              (t) => !usedTypes.includes(t.id),
            );
            setAvailableSections(available);
            return;
          }
        }
        // fallback default sections
        const defaultSections = [
          {
            id: "featured",
            type: "featured",
            label: "⭐ Featured Products",
            enabled: true,
            bg: "#f8f9fa",
            padding: "40px 0",
            order: 0,
          },
          {
            id: "categories",
            type: "categories",
            label: "📂 Category Grid",
            enabled: true,
            bg: "#ffffff",
            padding: "40px 0",
            order: 1,
          },
          {
            id: "promo",
            type: "promo",
            label: "🎁 Promo Banner",
            enabled: true,
            bg: "#e94560",
            padding: "30px 0",
            order: 2,
          },
          {
            id: "newArrivals",
            type: "newArrivals",
            label: "🆕 New Arrivals",
            enabled: true,
            bg: "#f8f9fa",
            padding: "40px 0",
            order: 3,
          },
          {
            id: "testimonials",
            type: "testimonials",
            label: "💬 Testimonials",
            enabled: false,
            bg: "#ffffff",
            padding: "40px 0",
            order: 4,
          },
        ];
        setSections(defaultSections);
        const usedTypes = defaultSections.map((s) => s.type);
        setAvailableSections(
          SECTION_TYPES.filter((t) => !usedTypes.includes(t.id)),
        );
      } catch (err) {
        console.error("Failed to load layout sections", err);
        // set defaults anyway
        const defaultSections = [
          {
            id: "featured",
            type: "featured",
            label: "⭐ Featured Products",
            enabled: true,
            bg: "#f8f9fa",
            padding: "40px 0",
            order: 0,
          },
          {
            id: "categories",
            type: "categories",
            label: "📂 Category Grid",
            enabled: true,
            bg: "#ffffff",
            padding: "40px 0",
            order: 1,
          },
          {
            id: "promo",
            type: "promo",
            label: "🎁 Promo Banner",
            enabled: true,
            bg: "#e94560",
            padding: "30px 0",
            order: 2,
          },
          {
            id: "newArrivals",
            type: "newArrivals",
            label: "🆕 New Arrivals",
            enabled: true,
            bg: "#f8f9fa",
            padding: "40px 0",
            order: 3,
          },
          {
            id: "testimonials",
            type: "testimonials",
            label: "💬 Testimonials",
            enabled: false,
            bg: "#ffffff",
            padding: "40px 0",
            order: 4,
          },
        ];
        setSections(defaultSections);
        const usedTypes = defaultSections.map((s) => s.type);
        setAvailableSections(
          SECTION_TYPES.filter((t) => !usedTypes.includes(t.id)),
        );
      }
    };
    loadLayout();
  }, [API_BASE]);

  const handleDragStart = (e, index) => {
    dragItem.current = index;
  };
  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };
  const handleDragEnd = () => {
    const arr = [...sections];
    const draggedItem = arr.splice(dragItem.current, 1)[0];
    arr.splice(dragOverItem.current, 0, draggedItem);
    dragItem.current = null;
    dragOverItem.current = null;
    setSections(arr);
  };

  const addSection = (type) => {
    const newSection = {
      id: type.id + "-" + Date.now(),
      type: type.id,
      label: type.label,
      enabled: true,
      bg: "#ffffff",
      padding: "40px 0",
      order: sections.length,
    };
    setSections([...sections, newSection]);
    setAvailableSections(availableSections.filter((s) => s.id !== type.id));
  };

  const removeSection = (index) => {
    const removed = sections[index];
    const baseType = SECTION_TYPES.find((t) => t.id === removed.type);
    if (baseType) setAvailableSections([...availableSections, baseType]);
    setSections(sections.filter((_, i) => i !== index));
    if (selectedSection === index) setSelectedSection(null);
  };

  const updateSection = (index, field, value) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
    if (selectedSection === index) setSelectedSection(index);
  };

  const save = async () => {
    try {
      await fetch(`${API_BASE}/layout-sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sections),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert(
        "Save failed - make sure the backend endpoint /layout-sections exists",
      );
    }
  };

  return (
    <div className="lb-container">
      <div className="lb-header">
        <div>
          <h2>🏗️ Homepage Layout Builder</h2>
          <p>
            Drag sections to reorder • Click to configure • Toggle to show/hide
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn btn-info"
          >
            {showPreview ? "🔧 Edit Mode" : "👁️ Preview"}
          </button>
          <button onClick={save} className="btn btn-success">
            {saved ? "✅ Saved!" : "💾 Save Layout"}
          </button>
        </div>
      </div>

      {showPreview ? (
        <div className="lb-preview">
          <h3>📱 Live Preview</h3>
          <div
            className="lb-preview-frame"
            style={{ background: settings?.darkMode ? "#1a1a2e" : "#f0f0f0" }}
          >
            {sections
              .filter((s) => s.enabled)
              .map((s, i) => (
                <div
                  key={i}
                  className="lb-preview-section"
                  style={{ background: s.bg, padding: s.padding }}
                >
                  <div className="lb-preview-label">{s.label}</div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="lb-workspace">
          <div className="lb-sections-panel">
            <h3>📋 Active Sections</h3>
            <div className="lb-dropzone">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`lb-section-item ${!section.enabled ? "lb-disabled" : ""} ${selectedSection === index ? "lb-selected" : ""}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() =>
                    setSelectedSection(selectedSection === index ? null : index)
                  }
                >
                  <span className="lb-drag-handle">⠿</span>
                  <span className="lb-section-icon">
                    {SECTION_TYPES.find((t) => t.id === section.type)?.icon ||
                      "📦"}
                  </span>
                  <span className="lb-section-name">{section.label}</span>
                  <div className="lb-section-actions">
                    <label className="lb-toggle">
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateSection(index, "enabled", e.target.checked);
                        }}
                      />
                      <span className="lb-toggle-slider"></span>
                    </label>
                    <button
                      className="lb-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(index);
                      }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {sections.length === 0 && (
                <div className="lb-empty">
                  Drop sections here from the library →
                </div>
              )}
            </div>

            {selectedSection !== null && sections[selectedSection] && (
              <div className="lb-section-settings">
                <h4>⚙️ Section Settings: {sections[selectedSection].label}</h4>
                <div className="lb-setting-row">
                  <label>Background Color</label>
                  <input
                    type="color"
                    value={sections[selectedSection].bg || "#ffffff"}
                    onChange={(e) =>
                      updateSection(selectedSection, "bg", e.target.value)
                    }
                  />
                </div>
                <div className="lb-setting-row">
                  <label>Padding (CSS)</label>
                  <input
                    type="text"
                    value={sections[selectedSection].padding || "40px 0"}
                    onChange={(e) =>
                      updateSection(selectedSection, "padding", e.target.value)
                    }
                    placeholder="e.g. 40px 0"
                    className="input-field"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="lb-library">
            <h3>🧩 Section Library</h3>
            {availableSections.map((type) => (
              <div
                key={type.id}
                className="lb-library-item"
                style={{ borderLeft: `4px solid ${type.color}` }}
                onClick={() => addSection(type)}
              >
                <span>{type.icon}</span>
                <span>{type.label.replace(type.icon + " ", "")}</span>
                <span className="lb-add-btn">+ Add</span>
              </div>
            ))}
            {availableSections.length === 0 && (
              <p style={{ color: "#999" }}>All sections are in use</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGE BUILDER - Drag & drop page components (fully working)
// ============================================================
const PAGE_COMPONENTS = [
  { type: "hero", label: "Hero Section", icon: "🎯" },
  { type: "text", label: "Text Block", icon: "📝" },
  { type: "heading", label: "Heading", icon: "📌" },
  { type: "image", label: "Image", icon: "🖼️" },
  { type: "button", label: "Button", icon: "🔘" },
  { type: "products", label: "Products Grid", icon: "🛍️" },
  { type: "twoCol", label: "Two Columns", icon: "⊞" },
  { type: "divider", label: "Divider", icon: "➖" },
  { type: "spacer", label: "Spacer", icon: "↕️" },
  { type: "video", label: "Video Embed", icon: "🎬" },
  { type: "countdown", label: "Countdown", icon: "⏱️" },
  { type: "testimonial", label: "Testimonial Card", icon: "💬" },
  { type: "newsletter", label: "Newsletter Form", icon: "📧" },
  { type: "footer", label: "Footer", icon: "🦶" },
];

const defaultContent = {
  hero: {
    title: "Welcome",
    subtitle: "Discover amazing products",
    buttonText: "Shop Now",
    buttonLink: "/products",
    bgColor: "#1a1a2e",
    textColor: "#ffffff",
    image: "",
  },
  text: { text: "Enter your text here." },
  heading: {
    text: "Section Heading",
    level: "h2",
    align: "left",
    color: "#333333",
  },
  image: { src: "", alt: "Image", width: "100%", link: "" },
  button: {
    text: "Click Me",
    link: "#",
    style: "primary",
    size: "medium",
    align: "left",
  },
  products: {
    title: "Featured Products",
    count: 4,
    category: "all",
    columns: 4,
  },
  twoCol: {
    leftContent: "Left column",
    rightContent: "Right column",
    split: "50-50",
  },
  divider: {
    style: "solid",
    color: "#dddddd",
    thickness: "1px",
    margin: "20px 0",
  },
  spacer: { height: "40px" },
  video: { url: "", autoplay: false, controls: true },
  countdown: { endDate: "", title: "Sale Ends In!", style: "dark" },
  testimonial: {
    quote: "Great store!",
    author: "Happy Customer",
    role: "Buyer",
    rating: 5,
  },
  newsletter: {
    title: "Subscribe",
    subtitle: "Get updates",
    buttonText: "Subscribe",
    placeholder: "Your email",
  },
  footer: { text: "© 2026 Your Store", bg: "#1a1a2e", color: "#ffffff" },
};

const defaultStyles = {
  backgroundColor: "transparent",
  padding: "20px",
  margin: "0px",
  borderRadius: "0px",
  textAlign: "left",
  maxWidth: "100%",
};

function ElementPreview({ element }) {
  const s = element.content;
  switch (element.type) {
    case "hero":
      return (
        <div
          style={{
            background: s.bgColor || "#1a1a2e",
            color: s.textColor || "#fff",
            padding: "40px 20px",
            textAlign: "center",
            borderRadius: "8px",
          }}
        >
          {s.image && (
            <img
              src={s.image}
              alt="hero"
              style={{
                maxWidth: "120px",
                marginBottom: "10px",
                borderRadius: "50%",
              }}
            />
          )}
          <h2 style={{ margin: "0 0 8px", color: s.textColor }}>{s.title}</h2>
          <p style={{ margin: "0 0 16px", opacity: 0.8 }}>{s.subtitle}</p>
          <span
            style={{
              background: "#e94560",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: "20px",
              fontSize: "13px",
            }}
          >
            {s.buttonText}
          </span>
        </div>
      );
    case "heading":
      const Tag = s.level || "h2";
      return (
        <div style={{ textAlign: s.align, color: s.color }}>
          <Tag style={{ margin: 0 }}>{s.text}</Tag>
        </div>
      );
    case "text":
      return <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{s.text}</p>;
    case "image":
      return s.src ? (
        <img
          src={s.src}
          alt={s.alt}
          style={{ maxWidth: s.width || "100%", display: "block" }}
        />
      ) : (
        <div
          style={{
            background: "#f0f0f0",
            padding: "30px",
            textAlign: "center",
            color: "#999",
            borderRadius: "8px",
          }}
        >
          🖼️ No image set
        </div>
      );
    case "button":
      return (
        <div style={{ textAlign: s.align }}>
          <span
            style={{
              display: "inline-block",
              padding: s.size === "large" ? "12px 30px" : "8px 20px",
              background:
                s.style === "primary"
                  ? "#e94560"
                  : s.style === "secondary"
                    ? "#1a1a2e"
                    : "transparent",
              color: s.style === "outline" ? "#e94560" : "#fff",
              border: s.style === "outline" ? "2px solid #e94560" : "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: s.size === "large" ? "16px" : "14px",
            }}
          >
            {s.text}
          </span>
        </div>
      );
    case "products":
      return (
        <div
          style={{
            background: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          🛍️ <strong>{s.title}</strong> — {s.count} products, {s.columns}{" "}
          columns
        </div>
      );
    case "twoCol":
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              s.split === "70-30"
                ? "70% 30%"
                : s.split === "30-70"
                  ? "30% 70%"
                  : "1fr 1fr",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "#f0f0f0",
              padding: "15px",
              borderRadius: "6px",
              fontSize: "13px",
            }}
          >
            {s.leftContent}
          </div>
          <div
            style={{
              background: "#f0f0f0",
              padding: "15px",
              borderRadius: "6px",
              fontSize: "13px",
            }}
          >
            {s.rightContent}
          </div>
        </div>
      );
    case "divider":
      return (
        <hr
          style={{
            borderTop: `${s.thickness} ${s.style} ${s.color}`,
            margin: s.margin,
          }}
        />
      );
    case "spacer":
      return (
        <div
          style={{
            height: s.height,
            background:
              "repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 5px, #fafafa 5px, #fafafa 10px)",
          }}
        >
          <small style={{ color: "#bbb", padding: "2px 6px" }}>
            Spacer: {s.height}
          </small>
        </div>
      );
    case "video":
      return (
        <div
          style={{
            background: "#000",
            padding: "30px",
            textAlign: "center",
            color: "#fff",
            borderRadius: "8px",
          }}
        >
          🎬 Video: {s.url || "No URL set"}
        </div>
      );
    case "countdown":
      return (
        <div
          style={{
            background: s.style === "dark" ? "#1a1a2e" : "#f8f9fa",
            color: s.style === "dark" ? "#fff" : "#333",
            padding: "20px",
            textAlign: "center",
            borderRadius: "8px",
          }}
        >
          ⏱️ <strong>{s.title}</strong>
          <br />
          <small>{s.endDate || "Set end date"}</small>
        </div>
      );
    case "testimonial":
      return (
        <div
          style={{
            background: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            borderLeft: "4px solid #e94560",
          }}
        >
          <p style={{ fontStyle: "italic", margin: "0 0 10px" }}>"{s.quote}"</p>
          <strong>{s.author}</strong>{" "}
          <small style={{ color: "#999" }}>— {s.role}</small>
          <div>{"⭐".repeat(s.rating)}</div>
        </div>
      );
    case "newsletter":
      return (
        <div
          style={{
            background: "#e94560",
            color: "#fff",
            padding: "30px",
            textAlign: "center",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ margin: "0 0 8px" }}>{s.title}</h3>
          <p style={{ margin: "0 0 15px", opacity: 0.9 }}>{s.subtitle}</p>
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                background: "#fff",
                color: "#333",
                padding: "8px 16px",
                borderRadius: "4px",
                fontSize: "13px",
              }}
            >
              {s.placeholder}
            </span>
            <span
              style={{
                background: "#1a1a2e",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "4px",
                fontSize: "13px",
              }}
            >
              {s.buttonText}
            </span>
          </div>
        </div>
      );
    case "footer":
      return (
        <div
          style={{
            background: s.bg,
            color: s.color,
            padding: "20px",
            textAlign: "center",
            borderRadius: "8px",
          }}
        >
          {s.text}
        </div>
      );
    default:
      return (
        <div
          style={{
            padding: "20px",
            background: "#f0f0f0",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          📦 {element.type}
        </div>
      );
  }
}

function ContentEditor({ element, onChange }) {
  const s = element.content;
  const update = (field, value) => onChange({ ...s, [field]: value });
  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "13px",
    boxSizing: "border-box",
    marginBottom: "10px",
  };
  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#666",
    marginBottom: "4px",
  };

  switch (element.type) {
    case "hero":
      return (
        <>
          <label style={labelStyle}>Title</label>
          <input
            style={inputStyle}
            value={s.title}
            onChange={(e) => update("title", e.target.value)}
          />
          <label style={labelStyle}>Subtitle</label>
          <input
            style={inputStyle}
            value={s.subtitle}
            onChange={(e) => update("subtitle", e.target.value)}
          />
          <label style={labelStyle}>Button Text</label>
          <input
            style={inputStyle}
            value={s.buttonText}
            onChange={(e) => update("buttonText", e.target.value)}
          />
          <label style={labelStyle}>Button Link</label>
          <input
            style={inputStyle}
            value={s.buttonLink}
            onChange={(e) => update("buttonLink", e.target.value)}
          />
          <label style={labelStyle}>Background Color</label>
          <input
            type="color"
            value={s.bgColor || "#1a1a2e"}
            onChange={(e) => update("bgColor", e.target.value)}
            style={{
              width: "100%",
              height: "40px",
              marginBottom: "10px",
              border: "none",
            }}
          />
          <label style={labelStyle}>Text Color</label>
          <input
            type="color"
            value={s.textColor || "#ffffff"}
            onChange={(e) => update("textColor", e.target.value)}
            style={{
              width: "100%",
              height: "40px",
              marginBottom: "10px",
              border: "none",
            }}
          />
          <label style={labelStyle}>Background Image URL</label>
          <input
            style={inputStyle}
            value={s.image || ""}
            onChange={(e) => update("image", e.target.value)}
            placeholder="https://..."
          />
        </>
      );
    case "heading":
      return (
        <>
          <label style={labelStyle}>Heading Text</label>
          <input
            style={inputStyle}
            value={s.text}
            onChange={(e) => update("text", e.target.value)}
          />
          <label style={labelStyle}>Level</label>
          <select
            style={inputStyle}
            value={s.level}
            onChange={(e) => update("level", e.target.value)}
          >
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
            <option value="h4">H4</option>
          </select>
          <label style={labelStyle}>Alignment</label>
          <select
            style={inputStyle}
            value={s.align}
            onChange={(e) => update("align", e.target.value)}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
          <label style={labelStyle}>Color</label>
          <input
            type="color"
            value={s.color || "#333333"}
            onChange={(e) => update("color", e.target.value)}
            style={{ width: "100%", height: "40px", border: "none" }}
          />
        </>
      );
    case "text":
      return (
        <>
          <label style={labelStyle}>Text Content</label>
          <textarea
            style={{ ...inputStyle, height: "120px" }}
            value={s.text}
            onChange={(e) => update("text", e.target.value)}
          />
        </>
      );
    case "button":
      return (
        <>
          <label style={labelStyle}>Button Text</label>
          <input
            style={inputStyle}
            value={s.text}
            onChange={(e) => update("text", e.target.value)}
          />
          <label style={labelStyle}>Link URL</label>
          <input
            style={inputStyle}
            value={s.link}
            onChange={(e) => update("link", e.target.value)}
          />
          <label style={labelStyle}>Style</label>
          <select
            style={inputStyle}
            value={s.style}
            onChange={(e) => update("style", e.target.value)}
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="outline">Outline</option>
          </select>
          <label style={labelStyle}>Size</label>
          <select
            style={inputStyle}
            value={s.size}
            onChange={(e) => update("size", e.target.value)}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
          <label style={labelStyle}>Alignment</label>
          <select
            style={inputStyle}
            value={s.align}
            onChange={(e) => update("align", e.target.value)}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </>
      );
    case "image":
      return (
        <>
          <label style={labelStyle}>Image URL</label>
          <input
            style={inputStyle}
            value={s.src}
            onChange={(e) => update("src", e.target.value)}
          />
          <label style={labelStyle}>Alt Text</label>
          <input
            style={inputStyle}
            value={s.alt}
            onChange={(e) => update("alt", e.target.value)}
          />
          <label style={labelStyle}>Width</label>
          <input
            style={inputStyle}
            value={s.width}
            onChange={(e) => update("width", e.target.value)}
            placeholder="100%, 500px"
          />
          <label style={labelStyle}>Link (optional)</label>
          <input
            style={inputStyle}
            value={s.link || ""}
            onChange={(e) => update("link", e.target.value)}
          />
        </>
      );
    case "products":
      return (
        <>
          <label style={labelStyle}>Section Title</label>
          <input
            style={inputStyle}
            value={s.title}
            onChange={(e) => update("title", e.target.value)}
          />
          <label style={labelStyle}>Number of Products</label>
          <input
            type="number"
            style={inputStyle}
            value={s.count}
            onChange={(e) => update("count", parseInt(e.target.value))}
            min="1"
            max="20"
          />
          <label style={labelStyle}>Columns</label>
          <select
            style={inputStyle}
            value={s.columns}
            onChange={(e) => update("columns", parseInt(e.target.value))}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </>
      );
    case "twoCol":
      return (
        <>
          <label style={labelStyle}>Left Content</label>
          <textarea
            style={{ ...inputStyle, height: "80px" }}
            value={s.leftContent}
            onChange={(e) => update("leftContent", e.target.value)}
          />
          <label style={labelStyle}>Right Content</label>
          <textarea
            style={{ ...inputStyle, height: "80px" }}
            value={s.rightContent}
            onChange={(e) => update("rightContent", e.target.value)}
          />
          <label style={labelStyle}>Column Split</label>
          <select
            style={inputStyle}
            value={s.split}
            onChange={(e) => update("split", e.target.value)}
          >
            <option value="50-50">50/50</option>
            <option value="70-30">70/30</option>
            <option value="30-70">30/70</option>
          </select>
        </>
      );
    default:
      return <p style={{ color: "#999" }}>No settings for this element.</p>;
  }
}

function PageBuilder({ API_BASE }) {
  const [layout, setLayout] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [saved, setSaved] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("content");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadLayout();
  }, []);

  const loadLayout = async () => {
    try {
      const res = await fetch(`${API_BASE}/page-layout`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setLayout(data);
      }
    } catch (err) {
      console.error("Failed to load page layout", err);
    }
  };

  const pushHistory = (newLayout) => {
    setHistory((prev) => [...prev.slice(-19), layout]);
    setRedoStack([]);
    setLayout(newLayout);
  };

  const undo = () => {
    if (!history.length) return;
    setRedoStack((prev) => [layout, ...prev]);
    setLayout(history[history.length - 1]);
    setHistory((prev) => prev.slice(0, -1));
  };
  const redo = () => {
    if (!redoStack.length) return;
    setHistory((prev) => [...prev, layout]);
    setLayout(redoStack[0]);
    setRedoStack((prev) => prev.slice(1));
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === "pb-library") {
      const compType = PAGE_COMPONENTS.find((c) => c.type === draggableId);
      if (!compType) return;
      const newEl = {
        id: `el-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: draggableId,
        content: { ...defaultContent[draggableId] },
        styles: { ...defaultStyles },
      };
      const newLayout = [...layout];
      newLayout.splice(destination.index, 0, newEl);
      pushHistory(newLayout);
      setSelectedId(newEl.id);
    } else {
      if (source.index === destination.index) return;
      const items = [...layout];
      const [moved] = items.splice(source.index, 1);
      items.splice(destination.index, 0, moved);
      pushHistory(items);
    }
  };

  const deleteElement = (id) => {
    pushHistory(layout.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };
  const duplicateElement = (el) => {
    const clone = {
      ...el,
      id: `el-${Date.now()}`,
      content: { ...el.content },
      styles: { ...el.styles },
    };
    const idx = layout.findIndex((e) => e.id === el.id);
    const newLayout = [...layout];
    newLayout.splice(idx + 1, 0, clone);
    pushHistory(newLayout);
  };
  const updateElementContent = (id, newContent) => {
    setLayout(
      layout.map((el) => (el.id === id ? { ...el, content: newContent } : el)),
    );
  };
  const updateElementStyles = (id, field, value) => {
    setLayout(
      layout.map((el) =>
        el.id === id ? { ...el, styles: { ...el.styles, [field]: value } } : el,
      ),
    );
  };
  const saveLayout = async () => {
    try {
      await fetch(`${API_BASE}/page-layout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(layout),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Save failed - check backend endpoint /page-layout");
    }
  };
  const clearCanvas = () => {
    if (window.confirm("Clear all elements?")) pushHistory([]);
  };
  const selectedEl = layout.find((el) => el.id === selectedId);

  const inputStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "13px",
    boxSizing: "border-box",
    marginBottom: "8px",
  };
  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#666",
    marginBottom: "4px",
  };

  return (
    <div className="pb-container">
      <div className="pb-toolbar">
        <div className="pb-toolbar-left">
          <h2>🎨 Page Builder</h2>
          <span>{layout.length} elements</span>
        </div>
        <div className="pb-toolbar-actions">
          <button
            onClick={undo}
            disabled={!history.length}
            className="btn btn-secondary"
          >
            ↩ Undo
          </button>
          <button
            onClick={redo}
            disabled={!redoStack.length}
            className="btn btn-secondary"
          >
            ↪ Redo
          </button>
          <button onClick={clearCanvas} className="btn btn-danger">
            🗑️ Clear
          </button>
          <button onClick={saveLayout} className="btn btn-success">
            {saved ? "✅ Saved" : "💾 Save"}
          </button>
        </div>
      </div>

      {isMounted && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="pb-workspace">
            <div className="pb-library">
              <h3>🧩 Components</h3>
              <Droppable droppableId="pb-library" isDropDisabled={true}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="pb-library-list"
                  >
                    {PAGE_COMPONENTS.map((comp, index) => (
                      <Draggable
                        key={comp.type}
                        draggableId={comp.type}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`pb-library-item ${snapshot.isDragging ? "pb-dragging" : ""}`}
                            onClick={() => {
                              const newEl = {
                                id: `el-${Date.now()}`,
                                type: comp.type,
                                content: { ...defaultContent[comp.type] },
                                styles: { ...defaultStyles },
                              };
                              pushHistory([...layout, newEl]);
                              setSelectedId(newEl.id);
                            }}
                          >
                            <span className="pb-comp-icon">{comp.icon}</span>
                            <span className="pb-comp-label">{comp.label}</span>
                            <span className="pb-comp-add">+</span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            <div className="pb-canvas">
              <div className="pb-canvas-header">📐 Canvas</div>
              <Droppable droppableId="pb-canvas">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`pb-dropzone ${snapshot.isDraggingOver ? "pb-dragover" : ""}`}
                  >
                    {layout.length === 0 && (
                      <div className="pb-empty-msg">
                        🎨 Drag components here
                      </div>
                    )}
                    {layout.map((el, index) => (
                      <Draggable key={el.id} draggableId={el.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`pb-canvas-el ${selectedId === el.id ? "pb-canvas-el-selected" : ""}`}
                            onClick={() =>
                              setSelectedId(selectedId === el.id ? null : el.id)
                            }
                          >
                            <div className="pb-el-actions">
                              <span
                                {...provided.dragHandleProps}
                                className="pb-el-handle"
                              >
                                ⠿
                              </span>
                              <span className="pb-el-type">
                                {
                                  PAGE_COMPONENTS.find(
                                    (c) => c.type === el.type,
                                  )?.icon
                                }{" "}
                                {el.type}
                              </span>
                              <div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateElement(el);
                                  }}
                                  className="pb-el-btn"
                                >
                                  ⧉
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteElement(el.id);
                                  }}
                                  className="pb-el-btn pb-el-del"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                            <ElementPreview element={el} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            <div
              className={`pb-settings ${selectedEl ? "pb-settings-active" : ""}`}
            >
              {selectedEl ? (
                <>
                  <div className="pb-settings-header">
                    <strong>
                      {
                        PAGE_COMPONENTS.find((c) => c.type === selectedEl.type)
                          ?.icon
                      }{" "}
                      {selectedEl.type}
                    </strong>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="pb-close-btn"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="pb-settings-tabs">
                    <button
                      className={`pb-stab ${activeSettingsTab === "content" ? "active" : ""}`}
                      onClick={() => setActiveSettingsTab("content")}
                    >
                      Content
                    </button>
                    <button
                      className={`pb-stab ${activeSettingsTab === "style" ? "active" : ""}`}
                      onClick={() => setActiveSettingsTab("style")}
                    >
                      Style
                    </button>
                  </div>
                  <div className="pb-settings-body">
                    {activeSettingsTab === "content" ? (
                      <ContentEditor
                        element={selectedEl}
                        onChange={(newContent) =>
                          updateElementContent(selectedEl.id, newContent)
                        }
                      />
                    ) : (
                      <>
                        <label style={labelStyle}>Background Color</label>
                        <input
                          type="color"
                          value={
                            selectedEl.styles.backgroundColor === "transparent"
                              ? "#ffffff"
                              : selectedEl.styles.backgroundColor
                          }
                          onChange={(e) =>
                            updateElementStyles(
                              selectedEl.id,
                              "backgroundColor",
                              e.target.value,
                            )
                          }
                          style={{ width: "100%", height: "40px" }}
                        />
                        <label style={labelStyle}>Padding</label>
                        <input
                          style={inputStyle}
                          value={selectedEl.styles.padding}
                          onChange={(e) =>
                            updateElementStyles(
                              selectedEl.id,
                              "padding",
                              e.target.value,
                            )
                          }
                        />
                        <label style={labelStyle}>Margin</label>
                        <input
                          style={inputStyle}
                          value={selectedEl.styles.margin}
                          onChange={(e) =>
                            updateElementStyles(
                              selectedEl.id,
                              "margin",
                              e.target.value,
                            )
                          }
                        />
                        <label style={labelStyle}>Border Radius</label>
                        <input
                          style={inputStyle}
                          value={selectedEl.styles.borderRadius}
                          onChange={(e) =>
                            updateElementStyles(
                              selectedEl.id,
                              "borderRadius",
                              e.target.value,
                            )
                          }
                        />
                        <label style={labelStyle}>Text Align</label>
                        <select
                          style={inputStyle}
                          value={selectedEl.styles.textAlign}
                          onChange={(e) =>
                            updateElementStyles(
                              selectedEl.id,
                              "textAlign",
                              e.target.value,
                            )
                          }
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                        <label style={labelStyle}>Max Width</label>
                        <input
                          style={inputStyle}
                          value={selectedEl.styles.maxWidth}
                          onChange={(e) =>
                            updateElementStyles(
                              selectedEl.id,
                              "maxWidth",
                              e.target.value,
                            )
                          }
                        />
                      </>
                    )}
                    <div className="pb-delete-section">
                      <button
                        className="btn btn-danger"
                        style={{ width: "100%" }}
                        onClick={() => deleteElement(selectedEl.id)}
                      >
                        🗑️ Delete
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ width: "100%", marginTop: "6px" }}
                        onClick={() => duplicateElement(selectedEl)}
                      >
                        ⧉ Duplicate
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="pb-no-selection">👆 Select an element</div>
              )}
            </div>
          </div>
        </DragDropContext>
      )}
    </div>
  );
}

// ============================================================
// ADVANCED SETTINGS - All tabs (fully functional)
// ============================================================
const ADV_TABS = [
  { id: "general", label: "⚙️ General", icon: "⚙️" },
  { id: "design", label: "🎨 Design", icon: "🎨" },
  { id: "hero", label: "🎯 Hero Banner", icon: "🎯" },
  { id: "seo", label: "🔍 SEO", icon: "🔍" },
  { id: "payment", label: "💳 Payment", icon: "💳" },
  { id: "shipping", label: "🚚 Shipping", icon: "🚚" },
  { id: "email", label: "📧 Email", icon: "📧" },
  { id: "social", label: "🌐 Social", icon: "🌐" },
  { id: "popup", label: "💬 Popup & Chat", icon: "💬" },
  { id: "features", label: "✅ Features", icon: "✅" },
  { id: "code", label: "💻 Custom Code", icon: "💻" },
  { id: "backup", label: "💾 Backup", icon: "💾" },
];

function AdvancedSettings({
  settings,
  setSettings,
  setSiteSettings,
  API_BASE,
}) {
  const [activeAdvTab, setActiveAdvTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const update = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));
  const updateNested = (parent, key, value) =>
    setSettings((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent] || {}), [key]: value },
    }));

  const saveSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/update-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSiteSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else alert("Save failed: " + (data.message || "Unknown error"));
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "site-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        setSettings((prev) => ({ ...prev, ...imported }));
        alert("✅ Settings imported! Click Save to apply.");
      } catch (err) {
        alert("Invalid JSON");
      }
    };
    reader.readAsText(file);
  };

  const resetDefaults = () => {
    if (!window.confirm("Reset ALL settings? This cannot be undone.")) return;
    setSettings({
      siteName: "My Store",
      primaryColor: "#e94560",
      secondaryColor: "#1a1a2e",
      darkMode: false,
      borderRadius: "8px",
      fontFamily: "'Poppins', sans-serif",
    });
  };

  const inputClass = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    boxSizing: "border-box",
    marginBottom: "12px",
    background: "#fafafa",
  };
  const label = {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "5px",
  };
  const sectionTitle = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#333",
    margin: "20px 0 15px",
    paddingBottom: "8px",
    borderBottom: "2px solid #f0f0f0",
  };
  const checkRow = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
    padding: "10px 14px",
    background: "#f8f9fa",
    borderRadius: "8px",
  };

  const renderTabContent = () => {
    switch (activeAdvTab) {
      case "general":
        return (
          <div>
            <h3 style={sectionTitle}>🏪 Store Information</h3>
            <label style={label}>Site Name</label>
            <input
              style={inputClass}
              value={settings.siteName || ""}
              onChange={(e) => update("siteName", e.target.value)}
            />
            <label style={label}>Tagline</label>
            <input
              style={inputClass}
              value={settings.tagline || ""}
              onChange={(e) => update("tagline", e.target.value)}
            />
            <label style={label}>Logo URL</label>
            <input
              style={inputClass}
              value={settings.logoUrl || ""}
              onChange={(e) => update("logoUrl", e.target.value)}
            />
            <label style={label}>Favicon URL</label>
            <input
              style={inputClass}
              value={settings.faviconUrl || ""}
              onChange={(e) => update("faviconUrl", e.target.value)}
            />
            <label style={label}>Contact Email</label>
            <input
              style={inputClass}
              value={settings.contactEmail || ""}
              onChange={(e) => update("contactEmail", e.target.value)}
            />
            <label style={label}>Contact Phone</label>
            <input
              style={inputClass}
              value={settings.contactPhone || ""}
              onChange={(e) => update("contactPhone", e.target.value)}
            />
            <label style={label}>Address</label>
            <textarea
              style={{ ...inputClass, height: "80px" }}
              value={settings.address || ""}
              onChange={(e) => update("address", e.target.value)}
            />
            <label style={label}>Currency Symbol</label>
            <input
              style={{ ...inputClass, maxWidth: "120px" }}
              value={settings.currencySymbol || "$"}
              onChange={(e) => update("currencySymbol", e.target.value)}
            />
            <label style={label}>Currency Code</label>
            <input
              style={{ ...inputClass, maxWidth: "120px" }}
              value={settings.currencyCode || "USD"}
              onChange={(e) => update("currencyCode", e.target.value)}
            />
            <label style={label}>Timezone</label>
            <select
              style={inputClass}
              value={settings.timezone || "UTC"}
              onChange={(e) => update("timezone", e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="Asia/Dhaka">Asia/Dhaka</option>
              <option value="America/New_York">EST</option>
            </select>
            <h3 style={sectionTitle}>🔑 API Keys</h3>
            <label style={label}>OpenRouter API Key</label>
            <input
              type="password"
              style={inputClass}
              value={settings.openRouterApiKey || ""}
              onChange={(e) => update("openRouterApiKey", e.target.value)}
            />
            <label style={label}>Google Maps API Key</label>
            <input
              type="password"
              style={inputClass}
              value={settings.googleMapsKey || ""}
              onChange={(e) => update("googleMapsKey", e.target.value)}
            />
          </div>
        );
      case "design":
        return (
          <div>
            <h3 style={sectionTitle}>🎨 Colors & Theme</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              {[
                "primaryColor",
                "secondaryColor",
                "accentColor",
                "successColor",
                "dangerColor",
                "bgColor",
                "cardBg",
                "textColor",
              ].map((key) => (
                <div key={key}>
                  <label style={label}>{key}</label>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="color"
                      value={settings[key] || "#000"}
                      onChange={(e) => update(key, e.target.value)}
                      style={{ width: "50px", height: "40px" }}
                    />
                    <input
                      style={{ ...inputClass, margin: 0, flex: 1 }}
                      value={settings[key] || ""}
                      onChange={(e) => update(key, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div style={checkRow}>
              <input
                type="checkbox"
                id="darkMode"
                checked={settings.darkMode || false}
                onChange={(e) => update("darkMode", e.target.checked)}
              />
              <label
                htmlFor="darkMode"
                style={{ margin: 0, fontWeight: "600" }}
              >
                🌙 Enable Dark Mode
              </label>
            </div>
            <h3 style={sectionTitle}>✏️ Typography</h3>
            <label style={label}>Font Family</label>
            <input
              style={inputClass}
              value={settings.fontFamily || "'Poppins', sans-serif"}
              onChange={(e) => update("fontFamily", e.target.value)}
            />
            <label style={label}>Heading Font</label>
            <input
              style={inputClass}
              value={settings.headingFont || ""}
              onChange={(e) => update("headingFont", e.target.value)}
            />
            <label style={label}>Base Font Size</label>
            <input
              style={{ ...inputClass, maxWidth: "150px" }}
              value={settings.baseFontSize || "16px"}
              onChange={(e) => update("baseFontSize", e.target.value)}
            />
            <label style={label}>Line Height</label>
            <input
              style={{ ...inputClass, maxWidth: "150px" }}
              value={settings.lineHeight || "1.6"}
              onChange={(e) => update("lineHeight", e.target.value)}
            />
            <h3 style={sectionTitle}>📐 Layout</h3>
            <label style={label}>Border Radius</label>
            <input
              style={{ ...inputClass, maxWidth: "150px" }}
              value={settings.borderRadius || "8px"}
              onChange={(e) => update("borderRadius", e.target.value)}
            />
            <label style={label}>Box Shadow</label>
            <input
              style={inputClass}
              value={settings.boxShadow || "0 4px 12px rgba(0,0,0,0.1)"}
              onChange={(e) => update("boxShadow", e.target.value)}
            />
            <label style={label}>Animation Speed</label>
            <input
              style={{ ...inputClass, maxWidth: "150px" }}
              value={settings.animationSpeed || "0.3s"}
              onChange={(e) => update("animationSpeed", e.target.value)}
            />
            <label style={label}>Container Max Width</label>
            <input
              style={{ ...inputClass, maxWidth: "200px" }}
              value={settings.containerMaxWidth || "1200px"}
              onChange={(e) => update("containerMaxWidth", e.target.value)}
            />
            <label style={label}>Footer Text</label>
            <input
              style={inputClass}
              value={settings.footerText || ""}
              onChange={(e) => update("footerText", e.target.value)}
            />
          </div>
        );
      case "hero":
        return (
          <div>
            <h3 style={sectionTitle}>🎯 Hero Banner</h3>
            <label style={label}>Image URL</label>
            <input
              style={inputClass}
              value={settings.heroBanner?.imageUrl || ""}
              onChange={(e) =>
                updateNested("heroBanner", "imageUrl", e.target.value)
              }
            />
            <label style={label}>Title</label>
            <input
              style={inputClass}
              value={settings.heroBanner?.title || ""}
              onChange={(e) =>
                updateNested("heroBanner", "title", e.target.value)
              }
            />
            <label style={label}>Subtitle</label>
            <input
              style={inputClass}
              value={settings.heroBanner?.subtitle || ""}
              onChange={(e) =>
                updateNested("heroBanner", "subtitle", e.target.value)
              }
            />
            <label style={label}>Button Text</label>
            <input
              style={inputClass}
              value={settings.heroBanner?.buttonText || ""}
              onChange={(e) =>
                updateNested("heroBanner", "buttonText", e.target.value)
              }
            />
            <label style={label}>Button Link</label>
            <input
              style={inputClass}
              value={settings.heroBanner?.buttonLink || ""}
              onChange={(e) =>
                updateNested("heroBanner", "buttonLink", e.target.value)
              }
            />
            <label style={label}>Overlay Color</label>
            <input
              type="color"
              value={settings.heroBanner?.overlayColor || "#000000"}
              onChange={(e) =>
                updateNested("heroBanner", "overlayColor", e.target.value)
              }
            />
            <label style={label}>Overlay Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.heroBanner?.overlayOpacity ?? 0.4}
              onChange={(e) =>
                updateNested(
                  "heroBanner",
                  "overlayOpacity",
                  parseFloat(e.target.value),
                )
              }
            />
            <div style={checkRow}>
              <input
                type="checkbox"
                id="heroVideo"
                checked={settings.heroBanner?.isVideo || false}
                onChange={(e) =>
                  updateNested("heroBanner", "isVideo", e.target.checked)
                }
              />
              <label htmlFor="heroVideo">Use Video Background</label>
            </div>
            {settings.heroBanner?.isVideo && (
              <label style={label}>Video URL (mp4)</label>
            )}
            <input
              style={inputClass}
              value={settings.heroBanner?.videoUrl || ""}
              onChange={(e) =>
                updateNested("heroBanner", "videoUrl", e.target.value)
              }
            />
          </div>
        );
      case "seo":
        return (
          <div>
            <h3 style={sectionTitle}>🔍 SEO & Meta</h3>
            <label style={label}>Meta Title</label>
            <input
              style={inputClass}
              value={settings.metaTitle || ""}
              onChange={(e) => update("metaTitle", e.target.value)}
            />
            <label style={label}>Meta Description</label>
            <textarea
              style={{ ...inputClass, height: "80px" }}
              value={settings.metaDescription || ""}
              onChange={(e) => update("metaDescription", e.target.value)}
            />
            <label style={label}>Meta Keywords</label>
            <input
              style={inputClass}
              value={settings.metaKeywords || ""}
              onChange={(e) => update("metaKeywords", e.target.value)}
            />
            <label style={label}>OG Image URL</label>
            <input
              style={inputClass}
              value={settings.ogImage || ""}
              onChange={(e) => update("ogImage", e.target.value)}
            />
            <label style={label}>Google Analytics ID</label>
            <input
              style={inputClass}
              value={settings.googleAnalyticsId || ""}
              onChange={(e) => update("googleAnalyticsId", e.target.value)}
            />
            <label style={label}>Facebook Pixel ID</label>
            <input
              style={inputClass}
              value={settings.fbPixelId || ""}
              onChange={(e) => update("fbPixelId", e.target.value)}
            />
          </div>
        );
      case "payment":
        return (
          <div>
            <h3 style={sectionTitle}>💳 Payment Methods</h3>
            {[
              "enableCOD",
              "enableStripe",
              "enablePayPal",
              "enableBkash",
              "enableNagad",
              "enableSSLCommerz",
            ].map((key) => (
              <div key={key} style={checkRow}>
                <input
                  type="checkbox"
                  id={key}
                  checked={settings[key] || false}
                  onChange={(e) => update(key, e.target.checked)}
                />
                <label htmlFor={key}>{key.replace("enable", "")}</label>
              </div>
            ))}
            <h3 style={sectionTitle}>🔐 Stripe Keys</h3>
            <label style={label}>Publishable Key</label>
            <input
              type="password"
              style={inputClass}
              value={settings.stripePublishableKey || ""}
              onChange={(e) => update("stripePublishableKey", e.target.value)}
            />
            <label style={label}>Secret Key</label>
            <input
              type="password"
              style={inputClass}
              value={settings.stripeSecretKey || ""}
              onChange={(e) => update("stripeSecretKey", e.target.value)}
            />
          </div>
        );
      case "shipping":
        return (
          <div>
            <h3 style={sectionTitle}>🚚 Shipping</h3>
            <label style={label}>Default Shipping ($)</label>
            <input
              type="number"
              style={{ ...inputClass, maxWidth: "200px" }}
              value={settings.defaultShipping || "0"}
              onChange={(e) => update("defaultShipping", e.target.value)}
            />
            <label style={label}>Free Shipping Minimum ($)</label>
            <input
              type="number"
              style={{ ...inputClass, maxWidth: "200px" }}
              value={settings.freeShippingMinimum || "0"}
              onChange={(e) => update("freeShippingMinimum", e.target.value)}
            />
            <label style={label}>Inside Dhaka ($)</label>
            <input
              type="number"
              style={{ ...inputClass, maxWidth: "200px" }}
              value={settings.dhakaShipping || "60"}
              onChange={(e) => update("dhakaShipping", e.target.value)}
            />
            <label style={label}>Outside Dhaka ($)</label>
            <input
              type="number"
              style={{ ...inputClass, maxWidth: "200px" }}
              value={settings.outsideDhakaShipping || "120"}
              onChange={(e) => update("outsideDhakaShipping", e.target.value)}
            />
            <label style={label}>International ($)</label>
            <input
              type="number"
              style={{ ...inputClass, maxWidth: "200px" }}
              value={settings.internationalShipping || "500"}
              onChange={(e) => update("internationalShipping", e.target.value)}
            />
          </div>
        );
      case "email":
        return (
          <div>
            <h3 style={sectionTitle}>📧 SMTP</h3>
            <label style={label}>Host</label>
            <input
              style={inputClass}
              value={settings.smtpHost || ""}
              onChange={(e) => update("smtpHost", e.target.value)}
            />
            <label style={label}>Port</label>
            <input
              type="number"
              style={{ ...inputClass, maxWidth: "150px" }}
              value={settings.smtpPort || "587"}
              onChange={(e) => update("smtpPort", e.target.value)}
            />
            <label style={label}>Username</label>
            <input
              style={inputClass}
              value={settings.smtpUser || ""}
              onChange={(e) => update("smtpUser", e.target.value)}
            />
            <label style={label}>Password</label>
            <input
              type="password"
              style={inputClass}
              value={settings.smtpPassword || ""}
              onChange={(e) => update("smtpPassword", e.target.value)}
            />
            <label style={label}>From Email</label>
            <input
              style={inputClass}
              value={settings.fromEmail || ""}
              onChange={(e) => update("fromEmail", e.target.value)}
            />
          </div>
        );
      case "social":
        return (
          <div>
            <h3 style={sectionTitle}>🌐 Social Links</h3>
            {[
              "facebookUrl",
              "instagramUrl",
              "twitterUrl",
              "youtubeUrl",
              "linkedinUrl",
              "whatsappNumber",
            ].map((key) => (
              <div key={key}>
                <label style={label}>{key}</label>
                <input
                  style={inputClass}
                  value={settings[key] || ""}
                  onChange={(e) => update(key, e.target.value)}
                />
              </div>
            ))}
            <div style={checkRow}>
              <input
                type="checkbox"
                id="googleLogin"
                checked={settings.googleLogin || false}
                onChange={(e) => update("googleLogin", e.target.checked)}
              />
              <label htmlFor="googleLogin">Enable Google Login</label>
            </div>
          </div>
        );
      case "popup":
        return (
          <div>
            <h3 style={sectionTitle}>💬 Chat & Popup</h3>
            <div style={checkRow}>
              <input
                type="checkbox"
                id="enableChat"
                checked={settings.enableChat || false}
                onChange={(e) => update("enableChat", e.target.checked)}
              />
              <label htmlFor="enableChat">Enable AI Chat</label>
            </div>
            <label style={label}>Chat Position</label>
            <select
              style={inputClass}
              value={settings.chatPosition || "bottom-right"}
              onChange={(e) => update("chatPosition", e.target.value)}
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
            </select>
            <div style={checkRow}>
              <input
                type="checkbox"
                id="enablePopup"
                checked={settings.enablePopup || false}
                onChange={(e) => update("enablePopup", e.target.checked)}
              />
              <label htmlFor="enablePopup">Enable Welcome Popup</label>
            </div>
            <label style={label}>Popup Title</label>
            <input
              style={inputClass}
              value={settings.popupTitle || ""}
              onChange={(e) => update("popupTitle", e.target.value)}
            />
            <label style={label}>Popup Message</label>
            <textarea
              style={{ ...inputClass, height: "80px" }}
              value={settings.popupMessage || ""}
              onChange={(e) => update("popupMessage", e.target.value)}
            />
            <label style={label}>Delay (seconds)</label>
            <input
              type="number"
              style={{ ...inputClass, maxWidth: "150px" }}
              value={settings.popupDelay || "3"}
              onChange={(e) => update("popupDelay", e.target.value)}
            />
          </div>
        );
      case "features":
        return (
          <div>
            <h3 style={sectionTitle}>✅ Store Features</h3>
            {[
              "enableReviews",
              "enableWishlist",
              "enableCompare",
              "enableMultiCurrency",
              "enableGuestCheckout",
              "enableCoupon",
              "enableProductZoom",
            ].map((key) => (
              <div key={key} style={checkRow}>
                <input
                  type="checkbox"
                  id={key}
                  checked={settings[key] || false}
                  onChange={(e) => update(key, e.target.checked)}
                />
                <label htmlFor={key}>{key.replace("enable", "")}</label>
              </div>
            ))}
          </div>
        );
      case "code":
        return (
          <div>
            <h3 style={sectionTitle}>💻 Custom Code</h3>
            <label style={label}>Custom CSS</label>
            <textarea
              style={{
                ...inputClass,
                height: "160px",
                fontFamily: "monospace",
              }}
              value={settings.customCSS || ""}
              onChange={(e) => update("customCSS", e.target.value)}
            />
            <label style={label}>Custom JS</label>
            <textarea
              style={{
                ...inputClass,
                height: "120px",
                fontFamily: "monospace",
              }}
              value={settings.customJS || ""}
              onChange={(e) => update("customJS", e.target.value)}
            />
          </div>
        );
      case "backup":
        return (
          <div>
            <h3 style={sectionTitle}>💾 Backup & Restore</h3>
            <button onClick={exportSettings} className="btn btn-primary">
              ⬇️ Export Settings
            </button>
            <div style={{ marginTop: "15px" }}>
              <label className="btn btn-info" style={{ cursor: "pointer" }}>
                ⬆️ Import Settings
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  style={{ display: "none" }}
                />
              </label>
            </div>
            <div style={{ marginTop: "20px" }}>
              <button onClick={resetDefaults} className="btn btn-danger">
                🔄 Reset All
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="adv-container">
      <div className="adv-header">
        <h2>🎨 Advanced Site Settings</h2>
        <div>
          <button
            onClick={() => setShowManual(!showManual)}
            className="btn btn-info"
          >
            📘 Help
          </button>
          <button onClick={saveSettings} className="btn btn-success">
            {saved ? "✅ Saved" : "💾 Save All"}
          </button>
        </div>
      </div>
      {showManual && (
        <div className="adv-manual">
          Quick guide: adjust colors, SEO, payment, etc.
        </div>
      )}
      <div className="adv-workspace">
        <div className="adv-sidebar">
          {ADV_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`adv-tab-btn ${activeAdvTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveAdvTab(tab.id)}
            >
              {tab.icon} {tab.label.replace(tab.icon + " ", "")}
            </button>
          ))}
        </div>
        <div className="adv-content">
          {renderTabContent()}
          <div className="adv-save-bar">
            <button onClick={saveSettings} className="btn btn-success">
              💾 Save All Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN ADMIN COMPONENT (all original logic preserved, fixed syntax)
// ============================================================
function Admin({ user, siteSettings, setSiteSettings, updateUser }) {
  const [navbarMaxVisible, setNavbarMaxVisible] = useState(5);
  const [featuredProductIds, setFeaturedProductIds] = useState([]);
  const [sliderAutoPlay, setSliderAutoPlay] = useState(true);
  const [sliderInterval, setSliderInterval] = useState(4500);
  const [sliderShowArrows, setSliderShowArrows] = useState(true);
  const [sliderShowDots, setSliderShowDots] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editDiscountMode, setEditDiscountMode] = useState("original");
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [categories, setCategories] = useState([
    "Home",
    "Cloth",
    "Gadget",
    "Book",
  ]);
  const [newCat, setNewCat] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editCatText, setEditCatText] = useState("");
  const [users, setUsers] = useState([]);
  const [categoryMessages, setCategoryMessages] = useState({});
  const [form, setForm] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "Cloth",
    img: "",
    description: "",
    inStock: true,
    sold: 0,
    discountPercent: "",
  });
  const [discountMode, setDiscountMode] = useState("original");
  const [productType, setProductType] = useState("simple");
  const [sizes, setSizes] = useState([{ size: "", stock: 0 }]);
  const [settings, setSettings] = useState(siteSettings);
  const [showManual, setShowManual] = useState(false);
  const [profileForm, setProfileForm] = useState({
    currentPassword: "",
    newEmail: "",
    newPassword: "",
    confirmPassword: "",
  });

  const API_BASE = (
    process.env.REACT_APP_API_URL || "http://localhost:5000"
  ).replace(/\/$/, "");

  // Discount sync effects (preserved)
  useEffect(() => {
    if (discountMode === "percent" && form.price && form.discountPercent) {
      const price = parseFloat(form.price),
        percent = parseFloat(form.discountPercent);
      if (!isNaN(price) && !isNaN(percent) && percent >= 0 && percent < 100)
        setForm((prev) => ({
          ...prev,
          originalPrice: Math.round((price / (1 - percent / 100)) * 100) / 100,
        }));
    }
  }, [form.price, form.discountPercent, discountMode]);
  useEffect(() => {
    if (discountMode === "original" && form.price && form.originalPrice) {
      const price = parseFloat(form.price),
        original = parseFloat(form.originalPrice);
      if (!isNaN(price) && !isNaN(original) && original > price)
        setForm((prev) => ({
          ...prev,
          discountPercent: Math.round(((original - price) / original) * 100),
        }));
      else setForm((prev) => ({ ...prev, discountPercent: "" }));
    }
  }, [form.price, form.originalPrice, discountMode]);
  useEffect(() => {
    if (
      editDiscountMode === "percent" &&
      editForm.price &&
      editForm.discountPercent
    ) {
      const price = parseFloat(editForm.price),
        percent = parseFloat(editForm.discountPercent);
      if (!isNaN(price) && !isNaN(percent) && percent >= 0 && percent < 100)
        setEditForm((prev) => ({
          ...prev,
          originalPrice: Math.round((price / (1 - percent / 100)) * 100) / 100,
        }));
    }
  }, [editForm.price, editForm.discountPercent, editDiscountMode]);
  useEffect(() => {
    if (
      editDiscountMode === "original" &&
      editForm.price &&
      editForm.originalPrice
    ) {
      const price = parseFloat(editForm.price),
        original = parseFloat(editForm.originalPrice);
      if (!isNaN(price) && !isNaN(original) && original > price)
        setEditForm((prev) => ({
          ...prev,
          discountPercent: Math.round(((original - price) / original) * 100),
        }));
      else setEditForm((prev) => ({ ...prev, discountPercent: "" }));
    }
  }, [editForm.price, editForm.originalPrice, editDiscountMode]);

  // Fetch all data (preserved)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          productsRes,
          ordersRes,
          statsRes,
          settingsRes,
          catsRes,
          usersRes,
        ] = await Promise.all([
          fetch(`${API_BASE}/products`),
          fetch(`${API_BASE}/admin/orders`),
          fetch(`${API_BASE}/admin/stats`),
          fetch(`${API_BASE}/settings`),
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/users`),
        ]);
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();
        const statsData = await statsRes.json();
        const settingsData = await settingsRes.json();
        const catsData = await catsRes.json();
        const usersData = await usersRes.json();
        setProducts(productsData);
        setOrders(ordersData);
        setStats(statsData);
        setSettings(settingsData);
        setCategories(
          catsData.length ? catsData : ["Home", "Cloth", "Gadget", "Book"],
        );
        setUsers(usersData);
        setCategoryMessages(settingsData.categoryMessages || {});
        setNavbarMaxVisible(settingsData.navbarMaxVisible || 5);
        setFeaturedProductIds(settingsData.featuredProductIds || []);
        setSliderAutoPlay(settingsData.sliderAutoPlay ?? true);
        setSliderInterval(settingsData.sliderInterval || 4500);
        setSliderShowArrows(settingsData.sliderShowArrows ?? true);
        setSliderShowDots(settingsData.sliderShowDots ?? true);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchAll();
  }, [API_BASE]);

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      originalPrice: "",
      category: categories[1] || "Home",
      img: "",
      description: "",
      inStock: true,
      sold: 0,
      discountPercent: "",
    });
    setImages([]);
    setProductType("simple");
    setSizes([{ size: "", stock: 0 }]);
    setDiscountMode("original");
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const productData = {
      ...form,
      images,
      type: productType,
      sizes:
        productType === "variable" ? sizes.filter((s) => s.size.trim()) : [],
    };
    delete productData.discountPercent;
    fetch(`${API_BASE}/add-product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProducts([...products, d.product]);
        resetForm();
      });
  };
  const handleSaveEditProduct = (id) => {
    const editData = {
      ...editForm,
      images,
      type: productType,
      sizes:
        productType === "variable" ? sizes.filter((s) => s.size.trim()) : [],
    };
    delete editData.discountPercent;
    fetch(`${API_BASE}/edit-product/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProducts(products.map((p) => (p.id === id ? d.product : p)));
          setEditId(null);
          resetForm();
          alert("Product updated successfully!");
        }
      });
  };
  const handleDeleteProduct = (id) => {
    fetch(`${API_BASE}/delete-product/${id}`, { method: "DELETE" }).then(() =>
      setProducts(products.filter((p) => p.id !== id)),
    );
  };
  const updateOrderStatus = (id, status) => {
    fetch(`${API_BASE}/admin/update-order/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then(() =>
      setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o))),
    );
  };
  const handleDeleteOrder = (id) => {
    if (window.confirm("Are you sure you want to delete this order?"))
      fetch(`${API_BASE}/admin/order/${id}`, { method: "DELETE" }).then(() =>
        setOrders(orders.filter((o) => o.id !== id)),
      );
  };
  const saveCategories = (updatedCats) => {
    setCategories(updatedCats);
    localStorage.setItem("categories", JSON.stringify(updatedCats));
    fetch(`${API_BASE}/update-categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCats),
    }).catch((err) => console.log("Server save failed (local only)", err));
  };
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    if (categories.includes(newCat)) return alert("Category already exists!");
    const updatedCats = [...categories, newCat];
    saveCategories(updatedCats);
    setCategoryMessages((prev) => ({ ...prev, [newCat]: "" }));
    setNewCat("");
  };
  const handleDeleteCategory = (catName) => {
    if (catName === "Home")
      return alert("You cannot delete the 'Home' category!");
    if (window.confirm(`Are you sure you want to delete '${catName}'?`)) {
      const updatedCats = categories.filter((c) => c !== catName);
      saveCategories(updatedCats);
      const updatedMessages = { ...categoryMessages };
      delete updatedMessages[catName];
      setCategoryMessages(updatedMessages);
    }
  };
  const handleEditCategorySave = (index) => {
    if (!editCatText.trim() || editCatText === "Home") {
      setEditIndex(null);
      return;
    }
    const oldCatName = categories[index];
    const updated = [...categories];
    updated[index] = editCatText;
    saveCategories(updated);
    if (oldCatName !== editCatText) {
      setCategoryMessages((prev) => {
        const newMessages = { ...prev };
        newMessages[editCatText] = prev[oldCatName] || "";
        delete newMessages[oldCatName];
        return newMessages;
      });
    }
    setEditIndex(null);
  };
  const handleRoleChange = (email, newRole) => {
    fetch(`${API_BASE}/users/${email}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    }).then(() => {
      setUsers(
        users.map((u) => (u.email === email ? { ...u, role: newRole } : u)),
      );
      alert("Role updated!");
    });
  };
  const handleDeleteUser = (email) => {
    if (window.confirm("Are you sure you want to delete this user?"))
      fetch(`${API_BASE}/users/${email}`, { method: "DELETE" }).then(() =>
        setUsers(users.filter((u) => u.email !== email)),
      );
  };
  const toggleFeatured = (id) => {
    if (featuredProductIds.includes(id))
      setFeaturedProductIds(featuredProductIds.filter((x) => x !== id));
    else setFeaturedProductIds([...featuredProductIds, id]);
  };
  const saveHomepageSettings = () => {
    const newSettings = {
      ...settings,
      navbarMaxVisible,
      featuredProductIds,
      sliderAutoPlay,
      sliderInterval,
      sliderShowArrows,
      sliderShowDots,
      categoryMessages,
    };
    fetch(`${API_BASE}/update-settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          fetch(`${API_BASE}/settings`)
            .then((res) => res.json())
            .then((updatedSettings) => {
              setSiteSettings(updatedSettings);
              setSettings(updatedSettings);
              setCategoryMessages(updatedSettings.categoryMessages || {});
              alert("✅ Homepage & Slider Saved!");
            });
        } else alert("Save failed");
      })
      .catch(() => alert("Error saving settings"));
  };
  const handleImageUpload = async (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) setter(data.imageUrl);
      else alert("Upload failed!");
    } catch (err) {
      alert(
        "Upload error! Make sure server is running and /uploads folder exists.",
      );
    }
  };
  const addImageUrl = (url) => setImages([...images, url]);
  const removeImage = (index) =>
    setImages(images.filter((_, i) => i !== index));
  const addSizeRow = () => setSizes([...sizes, { size: "", stock: 0 }]);
  const removeSizeRow = (index) =>
    setSizes(sizes.filter((_, i) => i !== index));
  const updateSize = (index, field, value) => {
    const newSizes = [...sizes];
    newSizes[index][field] = field === "stock" ? parseInt(value) || 0 : value;
    setSizes(newSizes);
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
    try {
      const res = await fetch(`${API_BASE}/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail: user.email,
          currentPassword: profileForm.currentPassword,
          newEmail: profileForm.newEmail || undefined,
          newPassword: profileForm.newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("প্রোফাইল সফলভাবে আপডেট হয়েছে।");
        updateUser(data.user);
        setProfileForm({
          currentPassword: "",
          newEmail: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else alert(data.message || "আপডেট ব্যর্থ হয়েছে।");
    } catch (err) {
      alert("সার্ভার এরর।");
    }
  };
  const saveBasicSettings = () => {
    fetch(`${API_BASE}/update-settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteSettings),
    }).then(() => alert("Settings saved!"));
  };
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleNestedSettingsChange = (e, parent, child) => {
    const { value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [child]: value },
    }));
  };
  const saveAdvancedSettings = () => {
    fetch(`${API_BASE}/update-settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("✅ Advanced Settings Saved!");
          setSiteSettings(settings);
        } else alert("Save failed: " + (data.message || "Unknown error"));
      })
      .catch((err) => {
        console.error(err);
        alert("Error saving settings: " + err.message);
      });
  };
  const [deliveryFees, setDeliveryFees] = useState({
    insideDhaka: siteSettings?.deliveryFees?.insideDhaka || 60,
    outsideDhaka: siteSettings?.deliveryFees?.outsideDhaka || 120,
  });
  const saveDeliveryFees = async () => {
    const updatedSettings = { ...siteSettings, deliveryFees };
    const res = await fetch(`${API_BASE}/update-settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSettings),
    });
    if (res.ok) {
      setSiteSettings(updatedSettings);
      alert("Delivery fees saved!");
    } else alert("Save failed");
  };

  const TABS = [
    "Dashboard",
    "Products",
    "Orders",
    "Users",
    "Categories",
    "Homepage & Slider",
    "Layout Builder",
    "Page Builder",
    "Advanced Settings",
    "Settings",
    "Profile",
  ];

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h3>Admin Panel</h3>
        {TABS.map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`admin-tab ${activeTab === tab ? "active" : ""}`}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === "Dashboard" && (
          <div>
            <h2>Overview</h2>
            <div className="stat-grid">
              <div className="stat-card" style={{ background: "#2ecc71" }}>
                <h4>Revenue</h4>
                <h1>${stats.totalRevenue}</h1>
              </div>
              <div className="stat-card" style={{ background: "#3498db" }}>
                <h4>Total Orders</h4>
                <h1>{stats.totalOrders}</h1>
              </div>
              <div className="stat-card" style={{ background: "#9b59b6" }}>
                <h4>Total Products</h4>
                <h1>{stats.totalProducts}</h1>
              </div>
              <div className="stat-card" style={{ background: "#f39c12" }}>
                <h4>Total Users</h4>
                <h1>{stats.totalUsers}</h1>
              </div>
            </div>
          </div>
        )}
        {activeTab === "Products" && (
          <div>
            <h2>Manage Products</h2>
            <form
              onSubmit={handleAddProduct}
              className="form-row"
              style={{ flexWrap: "wrap" }}
            >
              <input
                placeholder="Product Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="input-field"
              />
              <input
                type="number"
                placeholder="Price ($)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="input-field"
              />
              <div style={{ width: "100%", marginBottom: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label>
                    <input
                      type="radio"
                      name="discountMode"
                      value="original"
                      checked={discountMode === "original"}
                      onChange={() => setDiscountMode("original")}
                    />{" "}
                    Set Original Price
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="discountMode"
                      value="percent"
                      checked={discountMode === "percent"}
                      onChange={() => setDiscountMode("percent")}
                    />{" "}
                    Set Discount %
                  </label>
                </div>
                {discountMode === "original" ? (
                  <input
                    type="number"
                    placeholder="Original Price (for discount)"
                    value={form.originalPrice}
                    onChange={(e) =>
                      setForm({ ...form, originalPrice: e.target.value })
                    }
                    className="input-field"
                  />
                ) : (
                  <input
                    type="number"
                    placeholder="Discount % (e.g., 20 for 20%)"
                    value={form.discountPercent}
                    onChange={(e) =>
                      setForm({ ...form, discountPercent: e.target.value })
                    }
                    className="input-field"
                  />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  margin: "10px 0",
                  width: "100%",
                }}
              >
                <label>
                  <input
                    type="radio"
                    name="productType"
                    value="simple"
                    checked={productType === "simple"}
                    onChange={() => setProductType("simple")}
                  />{" "}
                  Simple Product
                </label>
                <label>
                  <input
                    type="radio"
                    name="productType"
                    value="variable"
                    checked={productType === "variable"}
                    onChange={() => setProductType("variable")}
                  />{" "}
                  Variable (Clothing/Shoes with Sizes)
                </label>
              </div>
              {productType === "variable" && (
                <div
                  style={{
                    width: "100%",
                    border: "1px solid #ddd",
                    padding: "15px",
                    borderRadius: "8px",
                    marginTop: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <h4>Manage Sizes & Stock</h4>
                  {sizes.map((sizeItem, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "8px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Size (e.g., M, L, XL)"
                        value={sizeItem.size}
                        onChange={(e) =>
                          updateSize(idx, "size", e.target.value)
                        }
                        style={{ flex: 1, padding: "8px" }}
                        required
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={sizeItem.stock}
                        onChange={(e) =>
                          updateSize(idx, "stock", e.target.value)
                        }
                        style={{ width: "100px", padding: "8px" }}
                        min="0"
                        required
                      />
                      {sizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSizeRow(idx)}
                          style={{
                            background: "#e94560",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "8px 12px",
                            cursor: "pointer",
                          }}
                        >
                          ✖
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSizeRow}
                    style={{
                      background: "#2ecc71",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px 16px",
                      cursor: "pointer",
                    }}
                  >
                    + Add Size
                  </button>
                </div>
              )}
              <div className="image-upload-section">
                <label className="upload-label">Product Image</label>
                <div className="upload-flex">
                  <div className="url-input-wrapper">
                    <input
                      type="text"
                      placeholder="Or enter image URL..."
                      value={form.img || ""}
                      onChange={(e) =>
                        setForm({ ...form, img: e.target.value })
                      }
                      className="input-field url-input"
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    id="product-image-upload"
                    onChange={(e) =>
                      handleImageUpload(e, (url) =>
                        setForm({ ...form, img: url }),
                      )
                    }
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="product-image-upload"
                    className="btn btn-primary upload-btn"
                  >
                    📁 Choose File
                  </label>
                </div>
                <div
                  style={{
                    width: "100%",
                    marginTop: "20px",
                    borderTop: "1px solid #ccc",
                    paddingTop: "15px",
                  }}
                >
                  <h4>Product Gallery Images</h4>
                  <div className="image-upload-section">
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginBottom: "10px",
                      }}
                    >
                      {images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: "relative",
                            width: "80px",
                            height: "80px",
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt={`gallery-${idx}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            style={{
                              position: "absolute",
                              top: "-5px",
                              right: "-5px",
                              background: "#e94560",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                              fontSize: "12px",
                              lineHeight: "1",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="gallery-actions">
                      <input
                        type="text"
                        placeholder="Image URL"
                        id="newImageUrl"
                        className="input-field"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const url =
                            document.getElementById("newImageUrl").value;
                          if (url) addImageUrl(url);
                          document.getElementById("newImageUrl").value = "";
                        }}
                        className="btn btn-primary"
                      >
                        + Add URL
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        id="gallery-upload"
                        style={{ display: "none" }}
                        onChange={(e) =>
                          handleImageUpload(e, (url) => addImageUrl(url))
                        }
                      />
                      <label
                        htmlFor="gallery-upload"
                        className="btn btn-primary upload-btn"
                      >
                        📁 Upload New
                      </label>
                    </div>
                  </div>
                </div>
                {form.img && (
                  <div className="image-preview">
                    <img src={form.img} alt="Preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => setForm({ ...form, img: "" })}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <textarea
                placeholder="Product Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="input-field"
                rows="3"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                {categories
                  .filter((c) => c !== "Home")
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
              <label>
                In Stock:{" "}
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) =>
                    setForm({ ...form, inStock: e.target.checked })
                  }
                />
              </label>
              <input
                type="number"
                placeholder="Sold Count"
                value={form.sold}
                onChange={(e) => setForm({ ...form, sold: e.target.value })}
                className="input-field"
              />
              <button type="submit" className="btn btn-primary">
                + Add Product
              </button>
            </form>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Type</th>
                    <th>Sizes/Stock</th>
                    <th>Sold</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td data-label="Image">
                        {editId === p.id ? (
                          <input
                            value={editForm.img}
                            onChange={(e) =>
                              setEditForm({ ...editForm, img: e.target.value })
                            }
                            placeholder="Image URL"
                            className="input-field"
                            style={{ width: "80px" }}
                          />
                        ) : (
                          <img
                            src={p.img || "https://via.placeholder.com/40"}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "5px",
                            }}
                            alt=""
                          />
                        )}
                      </td>
                      <td data-label="Name">
                        {editId === p.id ? (
                          <input
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="input-field"
                          />
                        ) : (
                          p.name
                        )}
                      </td>
                      <td data-label="Category">
                        {editId === p.id ? (
                          <select
                            value={editForm.category}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                category: e.target.value,
                              })
                            }
                            className="input-field"
                          >
                            {categories
                              .filter((c) => c !== "Home")
                              .map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                          </select>
                        ) : (
                          p.category
                        )}
                      </td>
                      <td data-label="Price">
                        {editId === p.id ? (
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                price: e.target.value,
                              })
                            }
                            className="input-field"
                            style={{ width: "80px" }}
                          />
                        ) : (
                          `$${p.price}`
                        )}
                      </td>
                      <td data-label="Discount">
                        {editId === p.id ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "5px",
                            }}
                          >
                            <div style={{ display: "flex", gap: "10px" }}>
                              <label>
                                <input
                                  type="radio"
                                  name="editDiscountMode"
                                  value="original"
                                  checked={editDiscountMode === "original"}
                                  onChange={() =>
                                    setEditDiscountMode("original")
                                  }
                                />{" "}
                                Original
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name="editDiscountMode"
                                  value="percent"
                                  checked={editDiscountMode === "percent"}
                                  onChange={() =>
                                    setEditDiscountMode("percent")
                                  }
                                />{" "}
                                %
                              </label>
                            </div>
                            {editDiscountMode === "original" ? (
                              <input
                                type="number"
                                value={editForm.originalPrice || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    originalPrice: e.target.value,
                                  })
                                }
                                placeholder="Original"
                                className="input-field"
                                style={{ width: "100px" }}
                              />
                            ) : (
                              <input
                                type="number"
                                value={editForm.discountPercent || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    discountPercent: e.target.value,
                                  })
                                }
                                placeholder="Discount %"
                                className="input-field"
                                style={{ width: "100px" }}
                              />
                            )}
                          </div>
                        ) : p.originalPrice && p.originalPrice > p.price ? (
                          `${Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%`
                        ) : (
                          "-"
                        )}
                      </td>
                      <td data-label="Type">
                        {p.type === "variable" ? "📏 Variable" : "📦 Simple"}
                      </td>
                      <td data-label="Sizes/Stock">
                        {editId === p.id ? (
                          p.type === "variable" ? (
                            <div style={{ minWidth: "300px" }}>
                              <div
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "10px",
                                  borderRadius: "8px",
                                }}
                              >
                                {sizes.map((sizeItem, idx) => (
                                  <div
                                    key={idx}
                                    style={{
                                      display: "flex",
                                      gap: "5px",
                                      marginBottom: "5px",
                                      alignItems: "center",
                                    }}
                                  >
                                    <input
                                      type="text"
                                      placeholder="Size"
                                      value={sizeItem.size}
                                      onChange={(e) =>
                                        updateSize(idx, "size", e.target.value)
                                      }
                                      style={{ flex: 1, padding: "4px" }}
                                    />
                                    <input
                                      type="number"
                                      placeholder="Stock"
                                      value={sizeItem.stock}
                                      onChange={(e) =>
                                        updateSize(idx, "stock", e.target.value)
                                      }
                                      style={{ width: "70px", padding: "4px" }}
                                      min="0"
                                    />
                                    {sizes.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeSizeRow(idx)}
                                        style={{
                                          background: "#e94560",
                                          color: "white",
                                          border: "none",
                                          borderRadius: "4px",
                                          padding: "4px 8px",
                                          cursor: "pointer",
                                        }}
                                      >
                                        ✖
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={addSizeRow}
                                  style={{
                                    background: "#2ecc71",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    cursor: "pointer",
                                  }}
                                >
                                  + Add Size
                                </button>
                              </div>
                            </div>
                          ) : (
                            <input
                              type="checkbox"
                              checked={editForm.inStock}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  inStock: e.target.checked,
                                })
                              }
                            />
                          )
                        ) : p.type === "variable" && p.sizes ? (
                          <div style={{ fontSize: "12px" }}>
                            {p.sizes
                              .map((s) => `${s.size}:${s.stock}`)
                              .join(", ")}
                          </div>
                        ) : p.inStock ? (
                          "Yes"
                        ) : (
                          "No"
                        )}
                      </td>
                      <td data-label="Sold">
                        {editId === p.id ? (
                          <input
                            type="number"
                            value={editForm.sold}
                            onChange={(e) =>
                              setEditForm({ ...editForm, sold: e.target.value })
                            }
                            className="input-field"
                            style={{ width: "80px" }}
                          />
                        ) : (
                          p.sold || 0
                        )}
                      </td>
                      <td data-label="Description">
                        {editId === p.id ? (
                          <textarea
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value,
                              })
                            }
                            className="input-field"
                            rows="2"
                          />
                        ) : (
                          p.description || "-"
                        )}
                      </td>
                      <td data-label="Action">
                        {editId === p.id ? (
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button
                              onClick={() => handleSaveEditProduct(p.id)}
                              className="btn btn-success"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditId(null);
                                resetForm();
                              }}
                              className="btn btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button
                              onClick={() => {
                                setEditId(p.id);
                                setEditForm(p);
                                setProductType(p.type || "simple");
                                setSizes(
                                  p.sizes && p.sizes.length
                                    ? p.sizes
                                    : [{ size: "", stock: 0 }],
                                );
                              }}
                              className="btn btn-warning"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="btn btn-danger"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "Orders" && (
          <div>
            <h2>Recent Orders</h2>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Order Date</th>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Location</th>
                    <th>Items</th>
                    <th>Subtotal</th>
                    <th>Delivery Zone</th>
                    <th>Delivery Fee</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td data-label="Order ID">{order.id}</td>
                      <td data-label="Order Date">
                        {order.date
                          ? new Date(order.date).toLocaleString()
                          : "N/A"}
                      </td>
                      <td data-label="Customer Name">
                        {order.userName || "N/A"}
                      </td>
                      <td data-label="Email">{order.userEmail}</td>
                      <td data-label="Phone">{order.userPhone || "N/A"}</td>
                      <td data-label="Address">{order.userAddress || "N/A"}</td>
                      <td data-label="Location">
                        {order.latitude && order.longitude
                          ? `${Number(order.latitude).toFixed(4)}, ${Number(order.longitude).toFixed(4)}`
                          : "N/A"}
                      </td>
                      <td data-label="Items">
                        <div className="order-items-preview">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => {
                              const product = item.product || item;
                              return (
                                <div key={idx} className="order-item-preview">
                                  <img
                                    src={
                                      product.img ||
                                      item.img ||
                                      "https://via.placeholder.com/30"
                                    }
                                    alt={product.name || item.name}
                                    style={{
                                      width: "30px",
                                      height: "30px",
                                      borderRadius: "4px",
                                    }}
                                  />
                                  <span>
                                    {product.name || item.name}
                                    {item.size && ` (${item.size})`}
                                    {item.quantity > 1 && ` x${item.quantity}`}
                                    (${product.price || item.price})
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <span>No items</span>
                          )}
                        </div>
                      </td>
                      <td data-label="Subtotal">
                        $
                        {order.subtotal ||
                          order.total - (order.deliveryFee || 0)}
                      </td>
                      <td data-label="Delivery Zone">
                        {order.deliveryZone === "inside"
                          ? "ঢাকার ভিতরে"
                          : order.deliveryZone === "outside"
                            ? "ঢাকার বাইরে"
                            : "N/A"}
                      </td>
                      <td data-label="Delivery Fee">
                        ${order.deliveryFee || 0}
                      </td>
                      <td data-label="Total">${order.total || 0}</td>
                      <td data-label="Status">
                        <span
                          className={`status-badge ${order.status ? order.status.toLowerCase() : "pending"}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td data-label="Action">
                        <select
                          value={order.status || "Pending"}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className="status-select"
                        >
                          <option>Pending</option>
                          <option>Shipped</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                      <td data-label="Delete">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "Users" && (
          <div>
            <h2>Manage Users</h2>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>IP Address</th>
                    <th>Location</th>
                    <th>Browser Info</th>
                    <th>Notification</th>
                    <th>Role</th>
                    <th>Login Count</th>
                    <th>Last Login</th>
                    <th>Order Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.email}>
                      <td data-label="Name">{u.name}</td>
                      <td data-label="Email">{u.email}</td>
                      <td data-label="IP Address">{u.lastIp || "N/A"}</td>
                      <td data-label="Location">
                        {u.latitude && u.longitude
                          ? `${Number(u.latitude).toFixed(4)}, ${Number(u.longitude).toFixed(4)}`
                          : "N/A"}
                      </td>
                      <td data-label="Browser Info">
                        {u.browserInfo ? (
                          <span
                            title={`User Agent: ${u.browserInfo.userAgent || ""}`}
                          >
                            {u.browserInfo.language || ""},{" "}
                            {u.browserInfo.screenWidth || ""}x
                            {u.browserInfo.screenHeight || ""}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td data-label="Notification">
                        <span
                          className={`badge ${u.notificationPermission === "granted" ? "badge-success" : "badge-secondary"}`}
                        >
                          {u.notificationPermission || "default"}
                        </span>
                      </td>
                      <td data-label="Role">{u.role}</td>
                      <td data-label="Login Count">{u.loginCount || 0}</td>
                      <td data-label="Last Login">
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleString()
                          : "Never"}
                      </td>
                      <td data-label="Order Count">{u.orderCount || 0}</td>
                      <td data-label="Actions">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u.email, e.target.value)
                          }
                          className="role-select"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleDeleteUser(u.email)}
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "Categories" && (
          <div>
            <h2>Manage Categories (Navigation Bar)</h2>
            <form onSubmit={handleAddCategory} className="form-row">
              <input
                placeholder="New Category Name..."
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                required
                className="input-field"
              />
              <button type="submit" className="btn btn-success">
                + Add Category
              </button>
            </form>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => (
                  <tr key={index}>
                    <td data-label="ID">{index + 1}</td>
                    <td data-label="Category Name">
                      {editIndex === index ? (
                        <input
                          value={editCatText}
                          onChange={(e) => setEditCatText(e.target.value)}
                          className="category-edit-input"
                        />
                      ) : (
                        <span
                          style={{
                            fontWeight: cat === "Home" ? "bold" : "normal",
                          }}
                        >
                          {cat} {cat === "Home" && "(Default)"}
                        </span>
                      )}
                    </td>
                    <td data-label="Action">
                      {cat !== "Home" && (
                        <div style={{ display: "flex", gap: "10px" }}>
                          {editIndex === index ? (
                            <button
                              onClick={() => handleEditCategorySave(index)}
                              className="btn btn-primary"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditIndex(index);
                                setEditCatText(cat);
                              }}
                              className="btn btn-warning"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="btn btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "Homepage & Slider" && (
          <div>
            <h2>Homepage & Navbar Settings</h2>
            <h3>Category Welcome Messages</h3>
            <p>
              Customize the welcome banner text for each category (shown above
              the product grid).
            </p>
            <div className="category-messages-grid">
              {categories
                .filter((c) => c !== "Home")
                .map((cat) => (
                  <div key={cat} className="message-row">
                    <label>{cat}</label>
                    <input
                      type="text"
                      value={categoryMessages[cat] || ""}
                      onChange={(e) =>
                        setCategoryMessages((prev) => ({
                          ...prev,
                          [cat]: e.target.value,
                        }))
                      }
                      placeholder={`Welcome ${cat}`}
                      className="input-field"
                    />
                  </div>
                ))}
            </div>
            <h3>Navbar Configuration</h3>
            <input
              type="number"
              value={navbarMaxVisible}
              onChange={(e) => setNavbarMaxVisible(parseInt(e.target.value))}
              className="input-field"
              style={{ width: "200px" }}
            />
            <p>Maximum categories to show directly (recommended: 5)</p>
            <h3>Featured Products Slider (Auto-slide)</h3>
            <div className="featured-grid">
              {products.map((p) => (
                <label key={p.id} className="featured-product-item">
                  <input
                    type="checkbox"
                    checked={featuredProductIds.includes(p.id)}
                    onChange={() => toggleFeatured(p.id)}
                  />
                  <img src={p.img} alt="" />
                  <div>
                    <strong>{p.name}</strong>
                    <br />${p.price}
                  </div>
                </label>
              ))}
            </div>
            <h3>Slider Settings</h3>
            <label>
              Auto Play{" "}
              <input
                type="checkbox"
                checked={sliderAutoPlay}
                onChange={(e) => setSliderAutoPlay(e.target.checked)}
              />
            </label>
            <br />
            <label>
              Interval (ms){" "}
              <input
                type="number"
                value={sliderInterval}
                onChange={(e) => setSliderInterval(parseInt(e.target.value))}
                className="input-field"
                style={{ width: "100px", margin: "10px 0" }}
              />
            </label>
            <br />
            <label>
              Show Arrows{" "}
              <input
                type="checkbox"
                checked={sliderShowArrows}
                onChange={(e) => setSliderShowArrows(e.target.checked)}
              />
            </label>
            <br />
            <label>
              Show Dots{" "}
              <input
                type="checkbox"
                checked={sliderShowDots}
                onChange={(e) => setSliderShowDots(e.target.checked)}
              />
            </label>
            <button
              onClick={saveHomepageSettings}
              className="save-settings-btn"
            >
              💾 Save Homepage & Slider Settings
            </button>
          </div>
        )}
        {activeTab === "Layout Builder" && (
          <LayoutBuilder API_BASE={API_BASE} settings={settings} />
        )}
        {activeTab === "Page Builder" && <PageBuilder API_BASE={API_BASE} />}
        {activeTab === "Advanced Settings" && (
          <AdvancedSettings
            settings={settings}
            setSettings={setSettings}
            setSiteSettings={setSiteSettings}
            API_BASE={API_BASE}
          />
        )}
        {activeTab === "Settings" && (
          <div
            className="basic-settings"
            style={{ padding: "25px", borderRadius: "12px" }}
          >
            <h3>Full Website Control (Basic)</h3>
            <div className="settings-grid">
              <div>
                <label>Site Name</label>
                <input
                  className="input-field"
                  value={siteSettings.siteName || ""}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      siteName: e.target.value,
                    })
                  }
                />
                <label>Primary Color</label>
                <input
                  type="color"
                  style={{ width: "100%", height: "40px" }}
                  value={siteSettings.primaryColor || "#e94560"}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      primaryColor: e.target.value,
                    })
                  }
                />
                <label>Dark Mode</label>
                <br />
                <input
                  type="checkbox"
                  checked={siteSettings.darkMode || false}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      darkMode: e.target.checked,
                    })
                  }
                />{" "}
                Enable Dark Mode
              </div>
              <div>
                <label>Logo URL</label>
                <input
                  className="input-field"
                  value={siteSettings.logoUrl || ""}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      logoUrl: e.target.value,
                    })
                  }
                />
                <label>Currency Symbol</label>
                <input
                  className="input-field"
                  value={siteSettings.currencySymbol || "$"}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      currencySymbol: e.target.value,
                    })
                  }
                />
                <label>Footer Text</label>
                <input
                  className="input-field"
                  value={siteSettings.footerText || ""}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      footerText: e.target.value,
                    })
                  }
                />
                <label>OpenRouter API Key (AI support)</label>
                <input
                  type="password"
                  className="input-field"
                  value={siteSettings.openRouterApiKey || ""}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      openRouterApiKey: e.target.value,
                    })
                  }
                  placeholder="sk-or-v1-xxxxxxxx..."
                />
              </div>
            </div>
            <button onClick={saveBasicSettings} className="save-settings-btn">
              💾 Save Global Settings
            </button>
          </div>
        )}
        {activeTab === "Profile" && (
          <div
            className="profile-settings"
            style={{ padding: "25px", borderRadius: "12px", maxWidth: "500px" }}
          >
            <h2>আপনার প্রোফাইল আপডেট করুন</h2>
            <form onSubmit={handleProfileUpdate}>
              <label>বর্তমান পাসওয়ার্ড *</label>
              <input
                type="password"
                value={profileForm.currentPassword}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    currentPassword: e.target.value,
                  })
                }
                className="input-field"
                required
              />
              <label>নতুন ইমেইল (ঐচ্ছিক)</label>
              <input
                type="email"
                value={profileForm.newEmail}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, newEmail: e.target.value })
                }
                className="input-field"
              />
              <label>নতুন পাসওয়ার্ড (ঐচ্ছিক)</label>
              <input
                type="password"
                value={profileForm.newPassword}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    newPassword: e.target.value,
                  })
                }
                className="input-field"
              />
              <label>নতুন পাসওয়ার্ড কনফার্ম করুন</label>
              <input
                type="password"
                value={profileForm.confirmPassword}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="input-field"
              />
              <button type="submit" className="save-settings-btn">
                আপডেট প্রোফাইল
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
