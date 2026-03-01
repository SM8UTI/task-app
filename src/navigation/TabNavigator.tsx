import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import TaskScreen from "../screens/TaskScreen";
import CalendarScreen from "../screens/CalendarScreen";
import theme from "../data/color-theme";
import { CalendarDays, LayoutDashboard, ListTodo } from "lucide-react-native";

const Tab = createBottomTabNavigator();

export const routeNames = {
    home: "Home",
    tasks: "Tasks",
    calendar: "Calendar",
};

export default function TabNavigator() {
    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            animation: "shift",
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
                marginTop: 2,
            },
        }}>
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
                name={routeNames.tasks}
                component={TaskScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <ListTodo color={focused ? theme.text : theme.text + "60"} size={22} />
                    ),
                }}
            />
            <Tab.Screen
                name={routeNames.calendar}
                component={CalendarScreen}
                options={{
                    tabBarLabel: "Calendar",
                    tabBarIcon: ({ focused }) => (
                        <CalendarDays color={focused ? theme.text : theme.text + "60"} size={22} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
