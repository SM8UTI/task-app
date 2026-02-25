import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import TaskScreen from "../screens/TaskScreen";
import theme from "../data/color-theme";
import { LayoutDashboard, ListTodo } from "lucide-react-native";

const Tab = createBottomTabNavigator();

export const routeNames = {
    home: "Home",
    tasks: "Tasks"
}

export default function TabNavigator() {
    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.text,
            tabBarInactiveTintColor: theme.text + "80",
            tabBarStyle: {
                backgroundColor: theme.background,
                borderColor: theme.text + "20",
                height: 80,
                paddingTop: 8,
            },
            tabBarLabelStyle: {
                fontFamily: theme.fonts[500],
                fontSize: 12,
                marginTop: 2
            }
        }}>
            <Tab.Screen options={{
                tabBarIcon: ({ focused }) => (
                    <LayoutDashboard color={focused ? theme.text : theme.text + "60"} size={22} />
                )
            }} name={routeNames.home} component={HomeScreen} />
            <Tab.Screen options={{
                tabBarIcon: ({ focused }) => (
                    <ListTodo color={focused ? theme.text : theme.text + "60"} size={22} />
                )
            }} name={routeNames.tasks} component={TaskScreen} />
        </Tab.Navigator>
    )
}
