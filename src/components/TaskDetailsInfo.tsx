import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { X, CheckCircle, Trash2 } from "lucide-react-native";
import theme from "../data/color-theme";
import { taskData } from "../data/temp-mock-data/task";

type TaskProps = {
    task: typeof taskData[0];
    onClose: () => void;
    onComplete?: () => void;
    onDelete?: () => void;
};

export default function TaskDetailsInfo({ task, onClose, onComplete, onDelete }: TaskProps) {
    return (
        <View style={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <Text style={{
                    fontFamily: theme.fonts[700],
                    fontSize: 24,
                    color: theme.background,
                    flex: 1,
                    lineHeight: 32
                }} numberOfLines={2}>
                    {task.title}
                </Text>
                <TouchableOpacity
                    style={{
                        backgroundColor: theme.background + "08",
                        padding: 10,
                        borderRadius: 100,
                        marginLeft: 16
                    }}
                    onPress={onClose}
                >
                    <X size={20} color={theme.background} />
                </TouchableOpacity>
            </View>

            <Text style={{
                fontFamily: theme.fonts[500],
                fontSize: 16,
                color: theme.background + "80",
                marginBottom: 20,
                lineHeight: 24
            }}>
                {task.description}
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 36, flexWrap: "wrap" }}>
                {task.tag?.map((tag: string, idx: number) => (
                    <View key={idx} style={{
                        backgroundColor: theme.background + "08",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 100
                    }}>
                        <Text style={{
                            fontFamily: theme.fonts[600],
                            fontSize: 14,
                            color: theme.background
                        }}>#{tag}</Text>
                    </View>
                ))}
            </View>

            <View style={{ flexDirection: "row", gap: 16 }}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: theme.background,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 12
                    }}
                    onPress={onComplete}
                >
                    <CheckCircle color={theme.text} size={24} />
                    <Text style={{
                        fontFamily: theme.fonts[600],
                        fontSize: 18,
                        color: theme.text
                    }}>Complete Task</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: "#FFF0F0",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                    onPress={onDelete}
                >
                    <Trash2 color="#FF4D4D" size={24} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
