import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import TaskScreen from "../screens/TaskScreen";
import BrainDumpScreen from "../screens/BrainDumpScreen";
import theme from "../data/color-theme";
import { LayoutDashboard, ListTodo, Settings, Brain } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SettingScreen from "../screens/SettingScreen";

const Tab = createBottomTabNavigator();

export const routeNames = {
    home: "Home",
    tasks: "Tasks",
    braindump: "Brain Dump",
    settings: "Settings",
};

export default function TabNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                animation: "shift",
                tabBarActiveTintColor: theme.text,
                tabBarInactiveTintColor: theme.text + "80",
                tabBarStyle: {
                    backgroundColor: theme.background,
                    borderColor: theme.text + "20",
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom + 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontFamily: theme.fonts[500],
                    fontSize: 12,
                    marginTop: 2,
                },
            }}
        >
            <Tab.Screen
                name={routeNames.home}
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <LayoutDashboard color={focused ? theme.text : theme.text + "60"} size={22} />
                    ),
                }}
            />
            <Tab.Screen
                name={routeNames.braindump}
                component={BrainDumpScreen}
                options={{
                    tabBarLabel: "Brain Dump",
                    tabBarIcon: ({ focused }) => (
                        <Brain color={focused ? theme.text : theme.text + "60"} size={22} />
                    ),
                }}
            />
            <Tab.Screen
                name={routeNames.tasks}
                component={TaskScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <ListTodo color={focused ? theme.text : theme.text + "60"} size={22} />
                    ),
                }}
            />

            <Tab.Screen
                name={routeNames.settings}
                component={SettingScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Settings color={focused ? theme.text : theme.text + "60"} size={22} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
