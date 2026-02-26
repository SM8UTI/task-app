import React from "react";
import { ScrollView, Text, View } from "react-native";
import theme from "../../data/color-theme";
import TaskCard from "../../components/TaskCard";

// ─── Date grouping helpers ────────────────────────────────────────────────
const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const getGroupLabel = (dueDate: Date | string): string => {
    const d = new Date(dueDate);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (isSameDay(d, now)) return "Today";
    if (isSameDay(d, tomorrow)) return "Tomorrow";
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
    });
};

type TaskGroup = { label: string; tasks: any[] };

const groupTasksByDate = (tasks: any[]): TaskGroup[] => {
    const sorted = [...tasks].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    const groupMap = new Map<string, any[]>();
    for (const task of sorted) {
        const label = getGroupLabel(task.dueDate);
        if (!groupMap.has(label)) groupMap.set(label, []);
        groupMap.get(label)!.push(task);
    }
    return Array.from(groupMap.entries()).map(([label, tasks]) => ({ label, tasks }));
};

// ─── Card color pool ──────────────────────────────────────────────────────
const CARD_COLORS = [theme.primary[1], theme.primary[3], theme.primary[4]];

// ─── Props ────────────────────────────────────────────────────────────────
type Props = {
    currentTab: string;
    tasks: any[];
    onOpenTask: (task: any) => void;
    onAdvanceStatus: (taskId: number) => void;
    onSetStatus: (taskId: number, newStatus: string, newDueDate?: Date) => void;
    onDelete: (taskId: number) => void;
    onComplete?: (taskId: number) => void;
};

// ─── Component ────────────────────────────────────────────────────────────
export default function TaskListContent({
    currentTab,
    tasks,
    onOpenTask,
    onAdvanceStatus,
    onSetStatus,
    onDelete,
}: Props) {
    const today = new Date();
    // For the completed tab: only show tasks completed today (auto-clears on next day)
    const filteredTasks = tasks.filter((t) => {
        if (t.status !== currentTab) return false;
        if (currentTab === "completed") {
            return isSameDay(new Date(t.dueDate), today);
        }
        return true;
    });
    const groups = groupTasksByDate(filteredTasks);

    // Per-tab empty state
    const EMPTY: Record<string, { emoji: string; title: string; hint: string }> = {
        "to-do": { emoji: "✅", title: "You're all caught up!", hint: "No to-do tasks. Tap \"Add Task\" to create one." },
        "in-progress": { emoji: "🚀", title: "Nothing in progress yet", hint: "Swipe right on a to-do card to move it here." },
        "completed": { emoji: "🎉", title: "No completions today yet", hint: "Finish a task and it will appear here." },
    };
    const empty = EMPTY[currentTab] ?? { emoji: "📭", title: "Nothing here", hint: "" };

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        >
            <View style={{
                paddingHorizontal: theme.padding.paddingMainX,
                marginTop: 20,
                gap: 28,
            }}>
                {filteredTasks.length === 0 ? (
                    <View style={{ alignItems: "center", marginTop: 60, gap: 8, paddingHorizontal: 24 }}>
                        <Text style={{ fontSize: 40 }}>{empty.emoji}</Text>
                        <Text style={{ fontFamily: theme.fonts[600], fontSize: 17, color: theme.text + "CC", textAlign: "center", marginTop: 4 }}>
                            {empty.title}
                        </Text>
                        <Text style={{ fontFamily: theme.fonts[400], fontSize: 14, color: theme.text + "55", textAlign: "center", lineHeight: 22 }}>
                            {empty.hint}
                        </Text>
                    </View>
                ) : (
                    groups.map(({ label, tasks: groupTasks }) => (
                        <View key={label} style={{ gap: 14 }}>

                            {/* ── Date section header ───────────────── */}
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 10,
                            }}>
                                <Text style={{
                                    fontFamily: theme.fonts[600],
                                    fontSize: 11,
                                    color: theme.text + "AA",
                                    textTransform: "uppercase",
                                    letterSpacing: 1,
                                }}>
                                    {label}
                                </Text>
                                <View style={{
                                    flex: 1,
                                    height: 1,
                                    backgroundColor: theme.text + "18",
                                }} />
                                <View style={{
                                    backgroundColor: theme.text + "14",
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 10,
                                }}>
                                    <Text style={{
                                        fontFamily: theme.fonts[600],
                                        fontSize: 11,
                                        color: theme.text + "70",
                                    }}>
                                        {groupTasks.length}
                                    </Text>
                                </View>
                            </View>

                            {/* ── Task cards under this date ────────── */}
                            <View style={{ gap: 14 }}>
                                {groupTasks.map((task, index) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        bgColor={CARD_COLORS[index % CARD_COLORS.length]}
                                        onPress={() => onOpenTask(task)}
                                        onAdvanceStatus={() => onAdvanceStatus(task.id)}
                                        onSetStatus={(s, d) => onSetStatus(task.id, s, d)}
                                        onDelete={() => onDelete(task.id)}
                                    />
                                ))}
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}
