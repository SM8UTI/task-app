# TaskFlow — Task Manager

> A premium **React Native** task management app with daily streak tracking, priority-based task filtering, swipe gestures, and a calendar heatmap view. Built with a dark-first design system and zero backend dependency.

<br />

## 📱 Screens Overview

| Screen       | Route      | Description                                                                            |
| ------------ | ---------- | -------------------------------------------------------------------------------------- |
| **Home**     | `Home`     | Good-morning greeting, live streak counter, today's high/medium priority task cards    |
| **Tasks**    | `Tasks`    | Full task list with To-Do / In-Progress / Completed tabs, date sections, swipe actions |
| **Calendar** | `Calendar` | Monthly heatmap grid, streak hero card, daily stats (Perfect Days, Tasks Done)         |

---

## ✨ Features

### 🗒️ Task Management

- Create tasks with **title**, **description**, **priority** (High / Medium / Low), **due date & time**, and **tags**
- All data persisted locally with **AsyncStorage** — works fully offline, no backend needed
- Tasks are grouped by due date with dynamic **Today / Tomorrow / Formatted-date** section headers
- Up to **2 tags** shown on the card with a `+N` overflow badge for extras

### 🔄 Status Lifecycle

```
 ┌────────┐   swipe right   ┌─────────────┐   swipe right   ┌───────────┐
 │ To Do  │ ──────────────▶ │ In Progress │ ──────────────▶ │ Completed │
 └────────┘                 └─────────────┘                 └───────────┘
                                                                   │
                                          swipe right / next btn   │
                                       ◀──────────────────────────┘
                                        To Do  (due date = tomorrow)
```

- **Swipe right** → advance status (To Do → In Progress → Completed → To Do tomorrow)
- **Swipe left** → delete the task
- **Long-press 2 s** on an In-Progress or Completed card → quick status menu (← Prev / Next →)
- Long-press is **disabled** on To-Do cards (no previous state to go back to)
- Completed tasks rescheduled to tomorrow automatically get a fresh `09:00` due time

### 🎯 Priority System

| Level         | Dot Color | Badge Background |
| ------------- | --------- | ---------------- |
| 🔴 **High**   | `#FF5757` | `#FF575715`      |
| 🟡 **Medium** | `#a86d00` | `#FFB22415`      |
| ⚫ **Low**    | `#343434` | `#61616115`      |

- **Home screen** shows: all High-priority today tasks → fallback to max 2 Medium → empty if none
- **Priority pill** appears on every task card (bottom-right) and in the task details sheet

### 🔥 Daily Streak

- A **streak day** is earned when **every task due that day** is completed
- Streak is evaluated from **yesterday backward** — today counts only once all tasks are done
- Days **with no tasks** don't break the streak (skipped)
- A day **with tasks left incomplete** resets the streak to `0`
- Streak is persisted per-day in AsyncStorage under `@myapp_streak_log`

### 📅 Calendar View

- Month grid with color-coded cells:

| Color               | Meaning                      |
| ------------------- | ---------------------------- |
| 🟢 Green `#34D399`  | All tasks done               |
| 🟡 Yellow `#FFCA28` | Partial completion           |
| 🔴 Red `#FF5757`    | Tasks missed / not completed |
| ⬜ Dim              | No tasks or future date      |

- Each cell shows a small indicator dot below the day number
- Navigate **backward through previous months**
- Stats row at the bottom: **Day Streak · Perfect Days · Tasks Done**

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
