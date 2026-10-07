import React, { useEffect, useState, useRef, useMemo } from "react";
import "./Inventory.css";
import Footer from "../components/footer";
import bpclBanner from "../assets/bpcl-banner.png";

const DEV_DUMMY_INVENTORY = [
  {
    _id: "test-inv-1",
    name: "3D Printer - Ultimaker S5 (Test Item)",
    category: "Prototyping & Printing",
    description: "High-precision dual-extrusion 3D printer for industrial composite materials, complex prototypes, and PLA/ABS models.",
    image: { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80" },
  }
];

export default function Inventory() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedCardKey, setExpandedCardKey] = useState(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        const isDev = process.env.NODE_ENV !== 'production';
        if (Array.isArray(data) && data.length > 0) {
          setInventoryItems(isDev ? [...data, ...DEV_DUMMY_INVENTORY] : data);
        } else if (isDev) {
          setInventoryItems(DEV_DUMMY_INVENTORY);
        } else {
          setInventoryItems([]);
        }
      })
      .catch((err) => {
        console.error(err);
        if (process.env.NODE_ENV !== 'production') {
          setInventoryItems(DEV_DUMMY_INVENTORY);
        }
      });
  }, []);

  // Extract unique categories for filter buttons
  const categories = useMemo(() => {
    const cats = [...new Set(inventoryItems.map((item) => item.category))];
    return ["All", ...cats];
  }, [inventoryItems]);

  // Filter items based on search query and selected category
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return inventoryItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [inventoryItems, searchQuery, selectedCategory]);

  // Group filtered items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Get current category keys
  const keys = Object.keys(groupedItems);

  // Reorder: put index 1 and 2 first, then the rest
  let reorderedKeys = [];
  if (keys.length > 2) {
    reorderedKeys = [keys[1], keys[2], keys[0], ...keys.slice(3)];
  } else {
    reorderedKeys = keys;
  }

  // Build new ordered object
  const orderedGroupedItems = {};
  reorderedKeys.forEach((k) => {
    orderedGroupedItems[k] = groupedItems[k];
  });

  // Add entrance animation after items load
  useEffect(() => {
    if (filteredItems.length > 0) {
      cardRefs.current.forEach((card, index) => {
        if (card) {
          card.style.opacity = "0";
          card.style.transform = "translateY(50px)";

          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
            card.classList.add("animate-in");
          }, index * 150);
        }
      });
    }
  }, [filteredItems]);

  // Handle card interactions
  const handleCardMouseMove = (e, cardElement) => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    cardElement.style.transform = "translateY(-10px)";
  };

  const handleCardMouseLeave = (cardElement) => {
    cardElement.style.transform = "";
  };

  const handleCardClick = (e, cardElement, itemKey) => {
    setExpandedCardKey((prev) => (prev === itemKey ? null : itemKey));

    if (cardElement) {
      const ripple = document.createElement("div");
      const rect = cardElement.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.className = "ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      cardElement.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  return (
    <>
      <div className="inventorypage ">
        <h1 className="inventory-heading">Inventory</h1>

        {/* Search & Filter Section */}
        <div className="inventory-search-section">
          <div className="inventory-search-wrapper">
            <svg
              className="inventory-search-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="inventory-search-input"
              placeholder="Search tools by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="inventory-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Buttons */}
          <div className="inventory-category-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`inventory-category-btn ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results count */}
          {(searchQuery || selectedCategory !== "All") && (
            <div className="inventory-results-info">
              <span>
                Showing {filteredItems.length} of {inventoryItems.length} items
              </span>
              <button
                className="inventory-clear-filters"
                onClick={handleClearSearch}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* No Results State */}
        {filteredItems.length === 0 && inventoryItems.length > 0 && (
          <div className="inventory-no-results">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="8" x2="14" y2="14" />
              <line x1="14" y1="8" x2="8" y2="14" />
            </svg>
            <h3>No tools found</h3>
            <p>
              No inventory items match "{searchQuery}"
              {selectedCategory !== "All" && ` in ${selectedCategory}`}. Try a
              different search term or category.
            </p>
            <button
              className="inventory-clear-filters"
              onClick={handleClearSearch}
            >
              Clear Filters
            </button>
          </div>
        )}

        {Object.keys(orderedGroupedItems).map((category, categoryIndex) => (
          <div key={categoryIndex} className="category-section">
            {/* Category Heading */}
            <h1 className="category-title">{category}</h1>

            {/* Inventory Cards under this category */}
            <div className="mainbox">
              {groupedItems[category].map((item, idx) => {
                const globalIndex =
                  Object.keys(groupedItems)
                    .slice(0, categoryIndex)
                    .reduce(
                      (sum, cat) => sum + groupedItems[cat].length,
                      0
                    ) + idx;
                const itemKey = item._id || `${category}-${idx}`;
                const isExpanded = expandedCardKey === itemKey;

                return (
                  <div
                    className={`inventorycard ${isExpanded ? "active" : ""}`}
                    key={idx}
                    ref={(el) => (cardRefs.current[globalIndex] = el)}
                    onMouseMove={(e) =>
                      handleCardMouseMove(e, cardRefs.current[globalIndex])
                    }
                    onMouseLeave={() =>
                      handleCardMouseLeave(cardRefs.current[globalIndex])
                    }
                    onClick={(e) =>
                      handleCardClick(e, cardRefs.current[globalIndex], itemKey)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCardClick(e, cardRefs.current[globalIndex], itemKey);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    style={{
                      transition: "opacity 0.6s ease, transform 0.3s ease",
                    }}
                  >
                    <div className="inventorybox">
                      {item.poweredBy === "BPCL" && (
                        <div className="bpcl-banner-strip">
                          <img
                            src={bpclBanner}
                            alt="Powered by BPCL – Bharat Petroleum"
                            className="bpcl-banner-img"
                          />
                        </div>
                      )}
                      <div className={`imagebox${item.poweredBy === "BPCL" ? " imagebox--bpcl" : ""}`}>
                        <img src={item.image.url} alt={item.name} />
                        {!isExpanded && (
                          <div className="inventory-click-hint">
                            Click for details
                          </div>
                        )}
                      </div>
                      <div className="inventcontentbox">
                        <button
                          type="button"
                          className="inventory-close-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCardKey(null);
                          }}
                          aria-label="Close details"
                        >
                          ✕
                        </button>
                        <h2>{item.name}</h2>
                        <h3>{item.category}</h3>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
}
