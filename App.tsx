import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { JSX } from "react";
import TabNavigator from "./src/navigation/TabNavigator";
import FocusSetupScreen from "./src/screens/FocusSetupScreen";
import FocusScreen from "./src/screens/FocusScreen";
import customTheme from "./src/data/color-theme";
import { TimerProvider } from "./src/context/TimerContext";

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: customTheme.background,
    text: customTheme.text,
    primary: customTheme.primary[2], // We can use one of your primary colors
  },
};

const Stack = createNativeStackNavigator();

export default function App(): JSX.Element {
  return (
    <TimerProvider>
      <NavigationContainer theme={AppTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: customTheme.background } }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="FocusSetupScreen" component={FocusSetupScreen} />
          <Stack.Screen name="FocusScreen" component={FocusScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </TimerProvider>
  );
}