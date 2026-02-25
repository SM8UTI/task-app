import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { X, CheckCircle, Trash2, Calendar1 } from "lucide-react-native";
import theme from "../data/color-theme";
import { taskData } from "../data/temp-mock-data/task";
import AnimatedIconButton from "./AnimatedIconButton";

type TaskProps = {
    task: typeof taskData[0];
    onClose: () => void;
    onComplete?: () => void;
    onDelete?: () => void;
};

export default function TaskDetailsInfo({ task, onClose, onComplete, onDelete }: TaskProps) {
    const tDate = new Date(task.dueDate);
    const timeStr = tDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    return (
        <View style={{ paddingHorizontal: 24, paddingBottom: 8, paddingTop: 20 }}>
            {/* Top Row: Date Pill & Close Button */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8
                }}>
                    <Calendar1 size={16} color={theme.background + "80"} />
                    <Text style={{
                        fontFamily: theme.fonts[500],
                        fontSize: 14,
                        color: theme.background + "80",
                    }}>
                        Today, {timeStr}
                    </Text>
                </View>
            </View>

            {/* Title & Description */}
            <Text style={{
                fontFamily: theme.fonts[500],
                fontSize: 16,
                color: theme.background + "90",
                marginBottom: 2,
                lineHeight: 40
            }}>
                {task.title}
            </Text>

            <Text style={{
                fontFamily: theme.fonts[700],
                fontSize: 24,
                color: theme.background,
                marginBottom: 24,
                lineHeight: 36
            }}>
                {task.description}
            </Text>

            {/* Tags array */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 40, flexWrap: "wrap", borderTopWidth: 1, borderColor: theme.background + "10", paddingTop: 20 }}>
                {task.tag?.map((tag: string, idx: number) => (
                    <Text key={idx} style={{
                        fontFamily: theme.fonts[500],
                        fontSize: 15,
                        color: theme.background + "80",
                        textTransform: "capitalize"
                    }}>
                        #{tag}
                    </Text>
                ))}
            </View>

            {/* Bottom Action Buttons */}
            <View style={{ flexDirection: "row", gap: 16, borderTopWidth: 1, borderColor: theme.background + "10", paddingTop: 20 }}>
                <View style={{ flex: 1 }}>
                    <AnimatedIconButton
                        style={{
                            width: "100%",
                            height: 64,
                            borderRadius: 120,
                            backgroundColor: theme.success,
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 12
                        }}
                        onPress={onComplete}
                    >
                        <CheckCircle color={theme.white} size={18} />
                        <Text style={{
                            fontFamily: theme.fonts[400],
                            fontSize: 16,
                            color: theme.white
                        }}>Complete Task</Text>
                    </AnimatedIconButton>
                </View>
                <AnimatedIconButton
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: theme.errorDark + "20",
                        backgroundColor: theme.error + "20"
                    }}
                    onPress={onDelete}
                >
                    <Trash2 color={theme.error} size={24} />
                </AnimatedIconButton>
            </View>
        </View>
    );
}
