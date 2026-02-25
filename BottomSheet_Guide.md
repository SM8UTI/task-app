# Guide: How to Create a Custom Animated Bottom Sheet in React Native

A Bottom Sheet is a common UI pattern that slides up from the bottom of the screen to reveal more content. Instead of using a basic modal that just pops up or slides up rigidly, we can build a highly interactive, swipeable bottom sheet using completely native-feeling animations using React Native's built-in `Animated` and `PanResponder` APIs.

---

## Core Concepts

To build a buttery-smooth custom bottom sheet, we rely on three main components from React Native:

1. **`Modal`**: The container that ensures our sheet floats above the rest of the application content.
2. **`Animated.View`**: Used for animating the sliding motion of the sheet and the fading opacity of the dark background backdrop.
3. **`PanResponder`**: Used to listen to user touch gestures (dragging up/down) to physically move the sheet with the user's finger.

---

## How It Works: Step-by-Step

### 1. Setting up the Animation Value

We use `Animated.Value` to track the state of our sheet. `0` means the sheet is hidden (slid down), and `1` means the sheet is fully visible (slid up).

```tsx
const slideAnim = useRef(new Animated.Value(0)).current;
```

### 2. Opening and Closing the Sheet

When a user triggers the sheet (e.g., clicking a task), we set the Modal to visible and run an `Animated.spring` to smoothly bounce the sheet up.

```tsx
const openSheet = () => {
  setVisible(true);
  Animated.spring(slideAnim, {
    toValue: 1, // Move to open state
    useNativeDriver: true, // Offloads animation to the UI thread for 60fps
    bounciness: 0,
    speed: 14,
  }).start();
};

const closeSheet = () => {
  Animated.timing(slideAnim, {
    toValue: 0, // Move to closed state
    duration: 250,
    useNativeDriver: true,
  }).start(() => setVisible(false)); // Hide modal after animation ends
};
```

### 3. Adding Drag-to-Dismiss (PanResponder)

This is where the magic happens. We create a `PanResponder` to track when the user touches the sheet and moves their finger.

```tsx
const panResponder = useRef(
  PanResponder.create({
    // 1. Allow this PanResponder to take over when the user touches down
    onStartShouldSetPanResponder: () => true,

    // 2. Only start tracking if they move their finger down a bit (5 pixels)
    onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,

    // 3. As the user drags their finger, update the animation value
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        // Only allow dragging downwards
        // gestureState.dy is the distance the finger moved down
        // We divide by 600 (approximate screen height) to map the drag distance to our 0-1 scale
        slideAnim.setValue(1 - gestureState.dy / 600);
      }
    },

    // 4. When the user lets go of the screen
    onPanResponderRelease: (_, gestureState) => {
      // Did they swipe fast (vy) or drag it down more than 120 pixels?
      if (gestureState.dy > 120 || gestureState.vy > 0.5) {
        closeSheet(); // Dismiss the sheet
      } else {
        // Otherwise, they didn't drag it enough. Snap it back open entirely!
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 0,
        }).start();
      }
    },
  }),
).current;
```

### 4. Structuring the UI

In our `render` (or `return`), we connect the animations to values like `translateY` (to move the sheet) and `opacity` (to fade the backdrop).

```tsx
<Modal visible={visible} transparent animationType="none">
  {/* ==== THE DARK BACKDROP ==== */}
  <Animated.View
    style={[
      styles.backdrop,
      {
        opacity: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1], // Fades from 0 to 1
        }),
      },
    ]}
  >
    {/* Tapping the backdrop closes the sheet */}
    <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
  </Animated.View>

  {/* ==== THE ACTUAL BOTTOM SHEET ==== */}
  <Animated.View
    {...panResponder.panHandlers} // Attach our drag listeners
    style={[
      styles.sheet,
      {
        transform: [
          {
            // Move the sheet depending on the animation
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [600, 0], // 600px down when hidden, 0px down when visible
            }),
          },
        ],
      },
    ]}
  >
    <View style={styles.handleBar} />
    <Text>Your Sheet Content Goes Here!</Text>
  </Animated.View>
</Modal>
```

---

## Why this approach over a standard Modal?

1. **Dynamic Heights**: The sheet automatically adjusts to the height of its content (unlike `height: '50%'` which is hardcoded).
2. **Gesture Support**: Users naturally want to swipe things away with their thumbs. Default modals do not support pan gestures natively.
3. **Smooth Aesthetics**: Using `Animated.spring` makes the UI feel playful and native, compared to the rigid linear movement of standard modals.
4. **Performance**: Everything runs on the `useNativeDriver` which ensures our gesture tracking and animations run smoothly at 60 FPS without blocking Javascript logic.
