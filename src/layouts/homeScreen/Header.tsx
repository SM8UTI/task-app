import { Text, View } from "react-native";
import theme from "../../data/color-theme";
import { Flame } from "lucide-react-native";

export default function HeaderHeroScreen() {

    const Day = () => {
        const date = new Date();
        const hours = date.getHours();

        if (hours < 12) {
            return "Morning"
        } else if (hours < 18) {
            return "Afternoon"
        } else {
            return "Evening"
        }

    }

    return (
        <View style={{
            paddingHorizontal: theme.padding.paddingMainX,
            paddingVertical: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        }}>
            <View style={{
                flexDirection: "column",
                gap: 2
            }}>
                <Text style={{
                    color: theme.text + "80",
                    fontFamily: theme.fonts[400],
                    fontSize: 16
                }}>
                    Welcome Back,
                </Text>
                <Text style={{
                    color: theme.text,
                    fontFamily: theme.fonts[500],
                    fontSize: 24
                }}>
                    Good {
                        Day()
                    }
                </Text>
            </View>
            <View style={{
                flexDirection: "row",
                backgroundColor: theme.primary[4] + "10",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 120,
                gap: 4,
                borderWidth: 1,
                borderColor: theme.primary[4] + "40"
            }}>
                <Flame stroke={theme.text + "10"} fill={theme.primary[4]} />
                {/* streaks  */}
                <Text style={{
                    fontFamily: theme.fonts[500],
                    fontSize: 16,
                    color: theme.primary[4]
                }}>
                    01
                </Text>
            </View>
        </View>
    )
}