<p align="center">
  <img src="android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" alt="TaskFlow App Icon" width="120" height="120" style="border-radius: 24px;"/>
</p>

<h1 align="center">TaskFlow</h1>

<p align="center">
  <strong>A premium React Native task manager</strong><br/>
  Daily streak tracking · Pomodoro focus timer · Swipe gestures · Interactive calendar analytics
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.84-61DAFB?logo=react&logoColor=white&style=flat-square" alt="React Native"/>
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS-lightgrey?style=flat-square" alt="Platform"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/Author-Smruti%20Ranjan%20Nayak-orange?style=flat-square" alt="Author"/>
</p>

<br/>

## 📱 Screens Overview

| Screen       | Route      | Description                                                                            |
| ------------ | ---------- | -------------------------------------------------------------------------------------- |
| **Home**     | `Home`     | Good-morning greeting, live streak counter, active timer widgets, and priority tasks   |
| **Tasks**    | `Tasks`    | Full task list with To-Do / In-Progress / Completed tabs, date sections, swipe actions |
| **Calendar** | `Calendar` | Monthly log grid, active day bar graph, streak hero card, and precise task stats       |
| **Focus**    | `Focus`    | Dedicated immersive Pomodoro-style timer tied specifically to active tasks             |

---

## ✨ Features

### 🗒️ Deep Task Management

- **Rich Task Metadata**: Create tasks combining **Titles**, detailed **Descriptions**, **Due Dates** (parsed to the minute), custom **Tags/Categories**, and strict **Priority States**.
- **Responsive Grouping System**: Tasks automatically group by due date dynamically updating UI headers (`Today` / `Tomorrow` / `Formatted Date`) for maximum clarity.
- **Offline-First Persistence Engine**: `AsyncStorage` backs the entire app (`@myapp_tasks_data`). Sorting handles JSON date repopulation safely. Data is strictly offline—no backend required.
- **Smart UI Overflow**: Tasks render up to **2 tags** natively on minimalist cards. Any overflow elegantly maps to a `+N` badge indicating remaining contexts.

### 🍅 Native Focus Timer (Pomodoro)

- **Deep Integration**: Every active task card provides a native **"Focus" pill** capable of initiating a timed session.
- **Floating Context**: Moving away from the active `FocusScreen` shrinks the running timer down into a floating badge directly on the task card throughout the app.
- **Fluid Exits**: Mark tasks done directly from the Focus session; or easily exit early maintaining smooth data integrity globally.

```
 ┌────────┐   swipe right   ┌─────────────┐   swipe right   ┌───────────┐
 │ To Do  │ ──────────────▶ │ In Progress │ ──────────────▶ │ Completed │
 └────────┘                 └─────────────┘                 └───────────┘
                                                                   │
                                          swipe right / next btn   │
                                       ◀──────────────────────────┘
                                        To Do  (due date = tomorrow)
```

- **Fluid Swipe Gestures**: utilizing React Native `PanResponder` and `Animated` libraries.
  - **Swipe Right (> 35% screen width)**: Automatically advance the task state (To Do → In Progress → Completed → cycle back via Tomorrow).
  - **Swipe Left (> 35% screen width)**: Instant task deletion with physical feedback.
- **Action Resets**: Spring animations gracefully cancel gestures abandoned mid-screen.
- **Advanced Context Menu**: Holding a non-To-Do card for `2000ms` pops a hidden status navigation bar (Previous / Next), allowing manual status rewinds minus the swipes.
- **Smart Rescheduling**: Tasks shifting from `Completed` back to `To-Do` are natively given a `09:00 AM` due time on the immediate next day.

### 🎯 Strict Priority System

| Level         | Dot Color | Badge Background | Configuration Model   |
| ------------- | --------- | ---------------- | --------------------- |
| 🔴 **High**   | `#FF5757` | `#FF575715`      | Demands completion    |
| 🟡 **Medium** | `#a86d00` | `#FFB22415`      | Standard tasks        |
| ⚫ **Low**    | `#343434` | `#61616115`      | Flexible requirements |

- **Hero Card Fallback Logic**: The Home Screen actively surfaces all `High` priority tasks for "Today". Falling back to a maximum of `2 Medium` items if no critical tasks exist.
- **Pill Badges**: Distinctly colored status dots and priority labels mount conditionally on task cards and deep-dive bottom sheets based on internal configs.

### 🔥 Intelligent Streak Engine

- **Strict Validation**: A streak day triggers exclusively when **all** tasks linked to a calendar day are verified `Completed`. Partial completion fails validation.
- **Timezone Aware Navigation**: Streak evaluates accurately from `yesterday backward`. Today only factors in once all tasks check out.
- **Forgiving Empty Days**: Rest days (zero tasks scheduled) passively bridge your streak. They never sever it.
- **Punishing Incompletes**: One single abandoned task resets the localized `@myapp_streak_log` to zero.

### 📅 Interactive Activity Analytics

- **Grid Visualization**: A visual matrix analyzing historical performance:
  - 🟢 **Green** (`#34D399`): Flawless perfection (All tasks done).
  - 🟡 **Yellow** (`#FFCA28`): Partial efforts.
  - 🔴 **Red** (`#FF5757`): Failed days.
  - ⬜ **Dim**: Future dates or rest days.
- **Dynamic Bar Graph**: A beautifully fluid, auto-scaling bar graph directly mapping monthly consistency. Interactively touch any bar to render specific day volume statistics inline.
- **Meta Stats Row**: Compiles raw analytics natively: **Current Day Streak**, **Total Perfect Days**, and your precise timeline of **Tasks Done**.

---

## 🔀 App Flow

```
App Launch
    │
    ▼
TabNavigator (Bottom Tabs)
    ├── Home Tab
    │     ├── Header (Greeting + Streak pill 🔥)
    │     └── TodayRecentTasks
    │           ├── Hero Card (date, task count, dominant priority, top tags)
    │           └── Priority-filtered task cards (High first, then Medium max 2)
    │                 └── TaskCard (swipe / long-press)
    │                       └── onPress → TaskDetailsSheet (slide-up bottom sheet)
    │                                       └── TaskDetailsInfo
    │                                             ├── Status pill + Priority pill
    │                                             ├── Title + Description
    │                                             ├── Tags
    │                                             └── Advance Status btn + Delete btn
    │
    ├── Tasks Tab
    │     ├── HeaderTaskScreen (title, "Add Task" button, status tabs)
    │     ├── TaskListContent (date-grouped sections)
    │     │     └── TaskCard × N  (per group)
    │     ├── AddTaskBottomSheet (modal form)
    │     └── TaskDetailsSheet (slide-up detail view)
    │
    └── Calendar Tab
          ├── Hero Streak Card (streak number + date)
          ├── Month Calendar Grid (heatmap)
          │     └── DayCell (color-coded by completion)
          └── Stats Row (Day Streak · Perfect Days · Tasks Done)
```

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── TaskCard.tsx              # Swipeable card: swipe right/left, long-press menu
│   ├── TaskDetailsInfo.tsx       # Detail panel: status/priority pills, action buttons
│   ├── AddTaskBottomSheet.tsx    # New task modal (title, desc, priority, date, tags)
│   └── AnimatedIconButton.tsx   # Reusable pressable with spring scale feedback
│
├── screens/
│   ├── HomeScreen.tsx            # Home tab: loads tasks + streak, composes layout
│   ├── TaskScreen.tsx            # Tasks tab: full CRUD with filtered tabs
│   └── CalendarScreen.tsx        # Calendar tab: heatmap, streak stats, month nav
│
├── layouts/
│   ├── homeScreen/
│   │   ├── Header.tsx            # Greeting text + live streak pill (🔥 + count)
│   │   └── TodayRecentTasks.tsx  # Hero card + priority task list + add task sheet
│   └── TasksScreen/
│       ├── Header.tsx            # Tab bar (To Do / In Progress / Completed) + Add btn
│       ├── TaskListContent.tsx   # Date-section grouped task list
│       └── TaskDetailsSheet.tsx  # Animated slide-up task detail sheet
│
├── hooks/
│   ├── useTaskManager.ts         # Task CRUD, status cycling, AsyncStorage r/w
│   ├── useTaskSheet.ts           # Bottom sheet open/close animation + pan gesture
│   └── useStreak.ts              # Per-day completion log + streak compute + persist
│
├── navigation/
│   └── TabNavigator.tsx          # Bottom tab navigator (Home / Tasks / Calendar)
│
└── data/
    └── color-theme.tsx           # Design tokens: colors, fonts, spacing, radius
```

---

## 🛠️ Tech Stack

| Library                                     | Version | Purpose                                  |
| ------------------------------------------- | ------- | ---------------------------------------- |
| `react-native`                              | 0.76+   | Core framework                           |
| `@react-navigation/native`                  | 7.x     | Navigation container                     |
| `@react-navigation/bottom-tabs`             | 7.x     | Bottom tab navigator                     |
| `react-native-safe-area-context`            | 4.x     | Safe area insets (notch, home bar)       |
| `@react-native-async-storage/async-storage` | 2.x     | Offline-first local persistence          |
| `lucide-react-native`                       | latest  | Icon set (Flame, Calendar, Trash2, etc.) |
| `Google Sans Flex`                          | bundled | Custom typeface (Thin → Black weights)   |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Android Studio** (for Android) or **Xcode** (for iOS) set up for React Native CLI
- A connected Android device or emulator with USB debugging enabled
- Java 17 (for Android builds)

### 1 · Clone & Install

```bash
git clone https://github.com/SM8UTI/TaskFlow.git
cd TaskFlow
npm install
```

### 2 · Start Metro Bundler

```bash
npx react-native start
```

### 3 · Run on Android

```bash
# In a second terminal
npx react-native run-android
```

### 4 · Run on iOS

```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## 📐 Design System

All tokens live in `src/data/color-theme.tsx`:

```ts
// Colors
background:  "#1F1F1F"   // dark canvas
text:        "#F6F5F8"   // near-white primary text
primary[1]:  "#FFECA0"   // soft yellow — task card accent
primary[2]:  "#CFE9BC"   // sage green  — Home hero card, Calendar hero card
primary[3]:  "#BBE7EF"   // sky blue    — task card accent, Calendar streak
primary[4]:  "#ff8c6f"   // warm coral  — task card accent

// Spacing & Shape
paddingMainX:  16      // horizontal page padding
border.radius.main: 24  // default card radius
hero card radius:   40  // hero/feature cards

// Typography — Google Sans Flex
fonts[400]: Regular · fonts[500]: Medium · fonts[600]: SemiBold
fonts[700]: Bold    · fonts[800]: ExtraBold
```

---

## 📝 License

MIT License — free to use, modify, and distribute.

---

<br />

## 👨‍💻 Author

**Smruti Ranjan Nayak**

- 🌐 Website: [sm8uti.com](https://sm8uti.com)
- 🐙 GitHub: [@SM8UTI](https://github.com/SM8UTI)

---

<br />

<p align="center">
  Copyright © 2026 <a href="https://sm8uti.com">Smruti Ranjan Nayak</a>. All rights reserved.
</p>
