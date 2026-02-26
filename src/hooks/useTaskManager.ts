import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NewTaskData } from '../components/AddTaskBottomSheet';

const TASKS_STORAGE_KEY = '@myapp_tasks_data';

const STATUS_ORDER = ['to-do', 'in-progress', 'completed'] as const;
type TaskStatus = (typeof STATUS_ORDER)[number];

/** Returns 9:00 AM the next calendar day */
const getTomorrow = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
};

export function useTaskManager() {
  const [tasks, setTasks] = useState<any[]>([]);

  // Load tasks whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, []),
  );

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks) {
        const parsed = JSON.parse(storedTasks);
        // Reconstruct Date objects after JSON parse
        const formattedTasks = parsed.map((t: any) => ({
          ...t,
          dueDate: new Date(t.dueDate),
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }));
        // Sort by newest first
        formattedTasks.sort(
          (a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
        setTasks(formattedTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load tasks', error);
      setTasks([]);
    }
  };

  const saveNewTask = async (data: NewTaskData, onSuccess?: () => void) => {
    const newTask = {
      id: Date.now(),
      title: data.title,
      description: data.description,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: data.priority,
      category: 'work',
      status: data.status,
      dueDate: data.dueDate,
      tag: data.tag,
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    onSuccess?.();

    try {
      await AsyncStorage.setItem(
        TASKS_STORAGE_KEY,
        JSON.stringify(updatedTasks),
      );
    } catch (error) {
      console.error('Failed to save task', error);
    }
  };

  const deleteTask = async (
    taskId: number,
    onTaskDeleted?: (id: number) => void,
  ) => {
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    setTasks(filteredTasks);
    onTaskDeleted?.(taskId);
    try {
      await AsyncStorage.setItem(
        TASKS_STORAGE_KEY,
        JSON.stringify(filteredTasks),
      );
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const toggleTaskComplete = async (
    taskId: number,
    onToggled?: (id: number) => void,
  ) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, isCompleted: true, status: 'completed' };
      }
      return t;
    });
    setTasks(updatedTasks);
    onToggled?.(taskId);
    try {
      await AsyncStorage.setItem(
        TASKS_STORAGE_KEY,
        JSON.stringify(updatedTasks),
      );
    } catch (error) {
      console.error('Failed to toggle task', error);
    }
  };

  /** Generic setter: update status (and optionally dueDate) for any task */
  const setTaskStatus = async (
    taskId: number,
    newStatus: TaskStatus,
    newDueDate?: Date,
    onDone?: () => void,
  ) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          isCompleted: newStatus === 'completed',
          dueDate: newDueDate ?? t.dueDate,
          updatedAt: new Date(),
        };
      }
      return t;
    });
    setTasks(updatedTasks);
    onDone?.();
    try {
      await AsyncStorage.setItem(
        TASKS_STORAGE_KEY,
        JSON.stringify(updatedTasks),
      );
    } catch (error) {
      console.error('Failed to set task status', error);
    }
  };

  /** Cycles: to-do → in-progress → completed → to-do (tomorrow) */
  const advanceTaskStatus = async (
    taskId: number,
    onAdvanced?: (id: number, nextStatus: TaskStatus) => void,
  ) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let nextStatus: TaskStatus;
    let nextDueDate: Date | undefined;

    if (task.status === 'completed') {
      nextStatus = 'to-do';
      nextDueDate = getTomorrow();
    } else {
      const idx = STATUS_ORDER.indexOf(task.status as TaskStatus);
      nextStatus = STATUS_ORDER[Math.min(idx + 1, STATUS_ORDER.length - 1)];
    }

    await setTaskStatus(taskId, nextStatus, nextDueDate, () =>
      onAdvanced?.(taskId, nextStatus),
    );
  };

  // Derived counts
  const todoCount = tasks.filter(t => t.status === 'to-do').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return {
    tasks,
    todoCount,
    inProgressCount,
    completedCount,
    saveNewTask,
    deleteTask,
    toggleTaskComplete,
    advanceTaskStatus,
    setTaskStatus,
    getTomorrow,
  };
}
