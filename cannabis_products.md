Here’s a **consolidated, professional document** that merges all the category definitions, SEO metadata, and product form logic for your website, optimized for Texas-based hemp shops and eCommerce/POS backends like Shopify, WooCommerce, AppSheet, or custom solutions.

---

# 🟢 Unified Product Catalog Structure for Hemp-Derived Products

## ✅ MAIN CATEGORY

**Name:** Cannabis Products
**Slug:** `cannabis-products`
**Description:**
Explore our full range of premium cannabis and hemp-derived products including edibles, vapes, flower, pre-rolls, and more. All products are lab-tested and Farm Bill compliant.

**SEO Title:**
Cannabis & Hemp-Derived Products – THCA, Delta-8, CBD

**SEO Description:**
Browse top-quality cannabis products including THCA, Delta-8, and CBD edibles, vapes, pre-rolls, and flower. Legal, lab-tested, and potent.

---

## 📂 Subcategories (7)

### 1. **Edibles**

* **Slug:** `edibles`
* **Description:**
  Delicious, potent THC-A, Delta-8, and CBD-infused edibles including gummies, chocolates, and drinks. Perfect for discreet and flavorful consumption.
* **SEO Title:**
  THC-A, CBD & Delta-8 Edibles – Gummies, Chocolates & Drinks
* **SEO Description:**
  Shop premium cannabis edibles including THC-A, CBD, and Delta-8 gummies, chocolates, and infused drinks. Delicious, discreet, and potent.

---

### 2. **Gummies**

* **Slug:** `gummies`
* **Description:**
  Explore high-potency THC-A, Delta-8, and CBD gummies in a variety of flavors. Lab-tested, fast-acting, and perfect for everyday use.
* **SEO Title:**
  THC-A & Delta-8 Gummies | CBD-Infused Gummy Edibles
* **SEO Description:**
  Buy tasty THC-A, Delta-8, and CBD gummies in assorted flavors. Potent, lab-tested, and made for flavor and relief.

---

### 3. **Pre-Rolls**

* **Slug:** `pre-rolls`
* **Description:**
  Ready-to-smoke cannabis pre-rolls with premium THCA, Delta-8, or CBD flower. Hand-rolled, smooth-burning, and perfect for quick use.
* **SEO Title:**
  Premium THC-A & CBD Pre-Rolls | Delta-8 Joints
* **SEO Description:**
  Shop premium pre-rolls infused with THCA, Delta-8, and CBD flower. Smooth, potent, and ready to enjoy.

---

### 4. **Drinks**

* **Slug:** `cannabis-drinks`
* **Description:**
  Refreshing cannabis-infused beverages with Delta-8, CBD, or THC-A. A smooth and tasty way to enjoy the effects without smoking.
* **SEO Title:**
  CBD & Delta-8 Cannabis Drinks | THC-A Infused Beverages
* **SEO Description:**
  Browse our selection of THC-A, Delta-8, and CBD-infused drinks. Tasty, fast-acting, and perfect for on-the-go relief.

---

### 5. **Vapes**

* **Slug:** `vapes`
* **Description:**
  Shop powerful, flavorful cannabis vapes including disposable pens and 510 cartridges. Infused with THCA, Delta-8, and live resin.
* **SEO Title:**
  THC-A & Delta-8 Vapes | Disposable & Cartridge Options
* **SEO Description:**
  Explore THCA, CBD, and Delta-8 vape pens and cartridges. High-potency, fast effects, and lab-tested purity.

---

### 6. **Cartridges**

* **Slug:** `cartridges`
* **Description:**
  High-potency 510-thread vape cartridges with THCA, Delta-8, or live resin. Compatible with most vape batteries.
* **SEO Title:**
  510 Vape Cartridges | THCA & Delta-8 Vape Carts
* **SEO Description:**
  Buy premium 510 vape cartridges infused with THC-A, Delta-8, and live resin. Smooth hits and powerful effects.

---

### 7. **Flower**

* **Slug:** `flower`
* **Description:**
  Top-shelf THCA, Delta-8, and CBD flower. Hand-trimmed, lab-tested, and available in multiple strains for your ideal experience.
* **SEO Title:**
  Buy THCA, Delta-8 & CBD Flower | Premium Hemp Bud
* **SEO Description:**
  Shop high-quality THCA, Delta-8, and CBD hemp flower. Potent, aromatic, and available in hybrid, indica, and sativa strains.

---

## 🧾 Unified Product Add Form (POS/Website Entry)

### 🏗️ Base Fields (For All Product Types)

| Field                     | Type                     | Required    | Notes                                |
| ------------------------- | ------------------------ | ----------- | ------------------------------------ |
| Product Name              | Text                     | ✅           | e.g., “Forbidden Punch Gummies 25ct” |
| Category                  | Dropdown                 | ✅           | Edibles, Flower, Vapes, etc.         |
| Subcategory               | Dropdown (optional)      | ❌           | Gummies, Cartridges, etc.            |
| Strain Type               | Dropdown                 | ✅           | Indica / Sativa / Hybrid             |
| Cannabinoid Type          | Multi-select             | ✅           | THC-A, CBD, Delta-8                  |
| Cannabinoid Strength (mg) | Number or Text           | ✅           | For edibles, drinks, vapes           |
| THC-A %                   | Decimal                  | Conditional | For Flower & Pre-Rolls               |
| Weight / Volume           | Text or Dropdown         | ✅           | e.g., 1g, 1/8oz, 1ml                 |
| Units per Pack            | Number                   | Optional    | e.g., 25ct, 2-pack                   |
| Servings per Item         | Number                   | Optional    | e.g., 1 or 2 (for drinks)            |
| Strain Name               | Text                     | Optional    | e.g., Runtz, Gelato                  |
| Product Description       | Long Text                | ✅           | Optimized SEO text                   |
| SKU                       | Text or Auto-generated   | Optional    | e.g., HB-GUM-420-FP-25CT             |
| Price                     | Currency                 | ✅           | Retail price                         |
| Product Image(s)          | Upload (800x800px)       | ✅           | JPEG or WebP                         |
| Status                    | Toggle (Active/Inactive) | ✅           | Manage visibility                    |
| Sort Order                | Number                   | Optional    | For display priority                 |

---

### ⚙️ Conditional Fields by Category

| Category        | Additional Fields                                       |
| --------------- | ------------------------------------------------------- |
| **Gummies**     | Strength per gummy (mg), Units per pack                 |
| **Drinks**      | Bottle size (oz), Cannabinoid per bottle (mg), Servings |
| **Pre-Rolls**   | Strain name, Total grams, THC-A %, Count                |
| **Flower**      | Weight (g or oz), Strain name, THC-A %                  |
| **Cartridges**  | Volume (ml), Potency (mg), 510-compatible toggle        |
| **Disposables** | Volume (ml), Potency (mg), Battery included toggle      |

---

## 🏷️ SEO & Filter Tags (Schema + UX)

| Tag Type    | Examples                               |
| ----------- | -------------------------------------- |
| Strain Type | Indica, Sativa, Hybrid                 |
| Strain Name | Gelato, Runtz, Forbidden Punch         |
| Cannabinoid | THC-A, CBD, Delta-8                    |
| Effect Tags | Relaxing, Uplifting, Focus, Sleep      |
| Compliance  | Farm Bill Compliant, <0.3% Delta-9 THC |

---

## 💡 Legal & UX Notes for Texas

* Use “Hemp-Derived” or “Farm Bill Compliant” instead of “Cannabis” in titles.
* Avoid terms like "marijuana" unless explicitly legal and compliant.
* Example product titles:

  * “THCA Hemp Flower – Hybrid – 3.5g”
  * “CBD Gummies – 25mg Each – 30ct”
  * “THCA Vape Cartridge – Indica – 1g”

---

## 🔧 Optional Deliverables (Let Me Know if You Want These)

* ✅ Category Images (800x800px)
* ✅ Social Meta Tags (for Facebook, Instagram, X)
* ✅ CSV for Shopify / WooCommerce import
* ✅ JSON schema for AppSheet / Airtable / Firebase
* ✅ Menu hierarchy or wireframes

---

Would you like this exported as a PDF, CSV schema file, or Airtable layout next?
