# Mobile Responsive Quick Reference

## 🎯 Quick Implementation Guide

### Use These Classes for Responsive Design:

```jsx
// Text Sizing
text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl

// Padding
p-4 sm:p-6 md:p-8

// Gaps
gap-4 sm:gap-6 md:gap-8

// Grid Columns
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

// Flex Direction
flex flex-col sm:flex-row

// Display
hidden sm:block  // Hidden on mobile, visible on sm+
block sm:hidden  // Visible on mobile, hidden on sm+
```

---

## 📱 Breakpoints

| Breakpoint | Width | Use Case |
|-----------|-------|----------|
| Default | < 640px | Mobile phones |
| sm | 640px | Large phones/small tablets |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large monitors |

---

## ✅ Responsive Patterns (Copy & Paste)

### Responsive Header
```jsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <h1 className="text-3xl sm:text-4xl font-bold">Title</h1>
  <button className="px-4 sm:px-6 py-2 sm:py-3">Button</button>
</div>
```

### Responsive Grid
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Responsive Card
```jsx
<div className="p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl bg-white shadow">
  <h3 className="text-lg sm:text-xl font-bold">Card Title</h3>
  <p className="text-sm sm:text-base text-gray-600">Card content</p>
</div>
```

### Responsive Button
```jsx
<button className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-base font-semibold">
  <span className="hidden sm:inline">Full Label</span>
  <span className="sm:hidden">Short</span>
</button>
```

### Responsive Navigation
```jsx
<nav className="flex items-center justify-between gap-4">
  <div className="hidden md:flex gap-8">
    {/* Desktop menu */}
  </div>
  <button className="md:hidden">☰ Menu</button>
</nav>
```

---

## 🎨 Typography Scaling

```jsx
// Headings
<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">H1</h1>
<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">H2</h2>
<h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">H3</h3>

// Body text
<p className="text-sm sm:text-base md:text-lg">Paragraph</p>

// Small text
<span className="text-xs sm:text-sm">Small text</span>
```

---

## 🔧 Common Classes

### Spacing
- `p-4` = padding 16px → `sm:p-6` = 24px → `md:p-8` = 32px
- `m-4` = margin 16px
- `gap-4` = gap 16px
- `space-y-4` = vertical spacing 16px

### Display
- `block` = full width (default for divs)
- `flex` = flexbox container
- `grid` = grid container
- `hidden` = display: none
- `visible` = display: visible

### Colors & Styles
- `bg-white` = white background
- `text-gray-900` = dark text
- `border` = border
- `rounded` = border radius
- `shadow` = box shadow

### Responsive Visibility
```
hidden        /* Display none */
block         /* Display block */
flex          /* Display flex */
grid          /* Display grid */

hidden sm:block       /* Hidden mobile, visible sm+ */
block sm:hidden       /* Visible mobile, hidden sm+ */
hidden lg:block       /* Hidden until lg breakpoint */
```

---

## 🚀 Do's and Don'ts

### ✅ DO:
- Start mobile-first (smallest screen sizes)
- Use responsive prefixes (sm:, md:, lg:)
- Test on real devices
- Keep 44px minimum touch targets
- Use semantic HTML
- Optimize images for different screen sizes

### ❌ DON'T:
- Use fixed widths (use responsive units)
- Make touch targets < 44x44px
- Forget safe area insets
- Create horizontal scroll on mobile
- Hide important content on mobile
- Use desktop-first approach

---

## 📋 Mobile Testing Checklist

- [ ] All text readable without zooming
- [ ] Touch targets at least 44x44px
- [ ] No horizontal scrolling needed
- [ ] Proper spacing between elements
- [ ] Images responsive and load fast
- [ ] Forms usable on mobile
- [ ] Navigation accessible
- [ ] All features work on mobile
- [ ] Performance acceptable (< 3s load)
- [ ] No broken layouts

---

## 🎯 Example: Making a Component Responsive

**Before (Desktop-only):**
```jsx
<div className="flex p-8 gap-8">
  <h1 className="text-5xl">Title</h1>
  <button className="px-8 py-4 text-lg">Button</button>
</div>
```

**After (Mobile-responsive):**
```jsx
<div className="flex flex-col sm:flex-row p-4 sm:p-8 gap-4 sm:gap-8">
  <h1 className="text-3xl sm:text-5xl">Title</h1>
  <button className="px-4 sm:px-8 py-2 sm:py-4 text-sm sm:text-lg">Button</button>
</div>
```

---

## 🔗 Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile UX Best Practices](https://developers.google.com/web/fundamentals/design-and-ux/responsive)
- [Touch Target Sizing](https://www.nngroup.com/articles/touch-target-size/)
- [MDN - Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

---

## 💡 Pro Tips

1. **Test with DevTools**: Use Chrome DevTools device emulation
2. **Real Device Testing**: Test on actual phones and tablets
3. **Performance**: Use Lighthouse to check mobile performance
4. **Accessibility**: Test keyboard navigation on mobile
5. **Images**: Use responsive images with srcset
6. **Viewport**: Always include `<meta name="viewport" content="width=device-width, initial-scale=1">`

---

**Last Updated:** January 29, 2026
