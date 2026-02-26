# MyAppPractice — Task Manager

A premium **React Native** task management app with daily streak tracking, priority-based task filtering, and a calendar heatmap view.

---

## 📱 Screens

| Screen       | Description                                                                  |
| ------------ | ---------------------------------------------------------------------------- |
| **Home**     | Greeting header with live streak counter, today's high/medium priority tasks |
| **Tasks**    | Full task list grouped by date, with To-Do / In-Progress / Completed tabs    |
| **Calendar** | Monthly calendar heatmap, streak stats, and daily completion tracking        |

---

## ✨ Features

### Task Management

- Create tasks with **title**, **description**, **priority** (High / Medium / Low), **due date/time**, and **tags**
- Tasks are persisted locally via **AsyncStorage** — no backend required
- Tasks are grouped by due date with **Today / Tomorrow / date** section headers

### Status Lifecycle

```
To Do  →  In Progress  →  Completed  →  To Do (tomorrow)
```

- **Swipe right** on a card to advance its status
- **Swipe left** on a card to delete it
- **Long-press** (2 s) on an In-Progress or Completed card to get a quick status menu (prev / next)
- Completed tasks rescheduled to the next day keep a fresh due date

### Priority System

| Priority  | Color     |
| --------- | --------- |
| 🔴 High   | `#FF5757` |
| 🟡 Medium | `#a86d00` |
| ⚫ Low    | `#343434` |

- Home screen shows **all High-priority** today tasks, or **up to 2 Medium** if no high tasks exist
- Priority pill visible on every task card and in the task details sheet

### Daily Streak

- A **streak day** is earned when every task due that day is completed
- Missing a day (tasks exist but aren't all completed) **resets** the streak to 0
- Calendar screen shows the current streak, perfect days, and total completed tasks

### Calendar View

- Month grid with color-coded day cells:
  - 🟢 **Green** — all tasks done
  - 🟡 **Yellow** — partial completion
  - 🔴 **Red** — tasks missed
- Navigate previous months to review history
- Stats: Day Streak · Perfect Days · Tasks Done

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── TaskCard.tsx          # Swipeable task card with long-press menu
│   ├── TaskDetailsInfo.tsx   # Task detail panel (status, priority, action buttons)
│   ├── AddTaskBottomSheet.tsx # Modal form to add new tasks
│   └── AnimatedIconButton.tsx # Reusable pressable with scale animation
│
├── screens/
│   ├── HomeScreen.tsx        # Home tab — loads tasks, computes streak
│   ├── TaskScreen.tsx        # Tasks tab — full CRUD with tab filtering
│   └── CalendarScreen.tsx    # Calendar tab — heatmap & streak stats
│
├── layouts/
│   ├── homeScreen/
│   │   ├── Header.tsx        # Greeting + live streak pill
│   │   └── TodayRecentTasks.tsx  # Priority-filtered today task list
│   └── TasksScreen/
│       ├── Header.tsx        # Tasks screen tab bar + add button
│       ├── TaskListContent.tsx   # Date-grouped task list
│       ├── TaskDetailsSheet.tsx  # Slide-up detail panel
│       └── ...
│
├── hooks/
│   ├── useTaskManager.ts     # CRUD, status cycling, AsyncStorage persistence
│   ├── useTaskSheet.ts       # Bottom sheet open/close animation
│   └── useStreak.ts          # Daily completion log + streak computation
│
├── navigation/
│   └── TabNavigator.tsx      # Bottom tab navigator (Home / Tasks / Calendar)
│
└── data/
    └── color-theme.tsx       # Design tokens: colors, fonts, spacing, radius
```

---

## 🛠️ Tech Stack

| Library                                                      | Purpose                   |
| ------------------------------------------------------------ | ------------------------- |
| `react-native`                                               | Core framework            |
| `@react-navigation/native` + `@react-navigation/bottom-tabs` | Navigation                |
| `react-native-safe-area-context`                             | Safe area insets          |
| `@react-native-async-storage/async-storage`                  | Local data persistence    |
| `lucide-react-native`                                        | Icon set                  |
| `Google Sans Flex`                                           | Custom typeface (bundled) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- Android Studio / Xcode set up for React Native
- (Android) An emulator or physical device with USB debugging enabled

### Install

```bash
npm install
```

### Run (Android)

```bash
npx react-native start
# In a second terminal:
npx react-native run-android
```

### Run (iOS)

```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## 📐 Design System

All design tokens live in `src/data/color-theme.tsx`:

```ts
background:  "#1F1F1F"   // dark canvas
text:        "#F6F5F8"   // near-white
primary[1]:  "#FFECA0"   // soft yellow
primary[2]:  "#CFE9BC"   // sage green (hero cards)
primary[3]:  "#BBE7EF"   // sky blue
primary[4]:  "#ff8c6f"   // warm coral (streak / Calendar hero)
```

Card radius: `24px` · Main horizontal padding: `16px` · Font: Google Sans Flex

---

## 📝 License

MIT
