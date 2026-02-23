import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { JSX } from "react";
import TabNavigator from "./src/navigation/TabNavigator";
import customTheme from "./src/data/color-theme";

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: customTheme.background,
    text: customTheme.text,
    primary: customTheme.primary[2], // We can use one of your primary colors
  },
};

export default function App(): JSX.Element {
  return (
    <NavigationContainer theme={AppTheme}>
      <TabNavigator />
    </NavigationContainer>
  );
}