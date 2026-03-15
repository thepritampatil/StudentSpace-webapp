# StudentSpace — Mini Notion Workspace

A full-featured, Notion-style workspace app built for students. Built with React, stored locally in your browser.

---

## 📁 Project Structure

```
notion-app/
├── public/
│   └── index.html          # Main HTML entry
├── src/
│   ├── components/
│   │   ├── Sidebar.js      # Navigation sidebar
│   │   ├── TopBar.js       # Top navigation bar
│   │   ├── BlockEditor.js  # Block-based rich editor
│   │   ├── PageEditor.js   # Page editing wrapper
│   │   ├── Dashboard.js    # Home dashboard
│   │   └── SearchModal.js  # Global search
│   ├── hooks/
│   │   └── useWorkspace.js # Global state management
│   ├── data/
│   │   └── initialData.js  # Default workspace data
│   ├── styles/
│   │   └── global.css      # All styles
│   ├── App.js              # Root component
│   └── index.js            # Entry point
├── build/                  # Production build (ready to deploy)
└── package.json
```

---

## 🚀 Getting Started

### Option 1: Use Pre-built Files (Easiest)

The `build/` folder is ready to deploy immediately.

**Using `serve` (recommended):**
```bash
npm install -g serve
serve -s build
```
Then open: http://localhost:3000

**Using Python:**
```bash
cd build
python3 -m http.server 8080
```
Then open: http://localhost:8080

---

### Option 2: Development Server

**Requirements:**
- Node.js 16+ (https://nodejs.org)
- npm 7+

**Setup:**
```bash
# Navigate to project folder
cd notion-app

# Install dependencies
npm install

# Start development server
npm start
```
Opens at: http://localhost:3000

---

### Option 3: Build from Source

```bash
cd notion-app
npm install
npm run build
# Files are in build/ folder
```

---

## ☁️ Cloud Deployment

### Netlify (Free, Recommended)

1. Create account at https://netlify.com
2. Drag & drop the `build/` folder onto Netlify dashboard
3. Your app is live instantly!

**Or via CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### Vercel (Free)

```bash
npm install -g vercel
cd notion-app
vercel --prod
```

### GitHub Pages

1. Push code to GitHub repo
2. Install: `npm install --save-dev gh-pages`
3. Add to `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/repo-name",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
4. Run: `npm run deploy`

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting  # set public dir to "build", SPA: yes
firebase deploy
```

---

## ✨ Features

### Page Management
- ✅ Create, edit, delete pages
- ✅ Nested pages (unlimited depth)
- ✅ Duplicate pages
- ✅ Move pages
- ✅ Favorite & pin pages
- ✅ Page icons (emoji)
- ✅ Tags/labels

### Rich Block Editor
- ✅ Heading 1, 2, 3
- ✅ Paragraph text
- ✅ Bullet lists
- ✅ Numbered lists
- ✅ Checklists (with check/uncheck)
- ✅ Quote blocks
- ✅ Code blocks (14 languages, copy button)
- ✅ Link blocks
- ✅ Divider blocks
- ✅ Block type converter (type `/` or use handle menu)
- ✅ Add block after any block (press Enter)

### Navigation
- ✅ Sidebar with collapsible tree
- ✅ Breadcrumb navigation
- ✅ Global search (⌘K / Ctrl+K)
- ✅ Mobile responsive (hamburger menu)

### Dashboard
- ✅ Greeting with date
- ✅ Stats overview
- ✅ Recent pages
- ✅ Task overview (across all pages)
- ✅ Favorites section
- ✅ Projects overview
- ✅ Learning streak display
- ✅ Quick actions
- ✅ All pages grid

### Data
- ✅ All data saved in browser localStorage
- ✅ Pre-loaded with example workspace
- ✅ Persists across browser sessions

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open search |
| `Enter` | Add new block below |
| `Backspace` | Delete empty block |
| `/` | Show block type menu |
| `Escape` | Close modals/menus |

---

## 🎨 Design

- **Typography**: Syne (display) + Crimson Pro (body) + JetBrains Mono (code)
- **Theme**: Dark mode with purple accent (#7c6aff)
- **Layout**: Sidebar + TopBar + Editor (classic Notion layout)
- **Responsive**: Sidebar becomes drawer on mobile

---

## 🛠 Tech Stack

- **React 18** — UI framework
- **CSS Variables** — Theming system
- **localStorage** — Data persistence
- **No backend needed** — Fully client-side

---

## 📝 Notes

- Data is stored in your browser's localStorage under the key `studentspace_v2`
- To reset all data: Settings (⚙) → Reset workspace
- Right-click any sidebar item for a context menu with all page actions

---

## 📄 License

MIT — Free to use, modify, and deploy.
