import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TimerContextType = {
    activeTaskId: number | null;
    timeLeft: number;
    isActive: boolean;
    durationMins: number;
    startTimer: (taskId: number | null, duration: number) => void;
    stopTimer: () => void;
    resumeTimer: () => void;
    endTimer: () => void;
    resetTimer: () => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);
const TIMER_STORAGE_KEY = '@myapp_timer_data';

export function TimerProvider({ children }: { children: ReactNode }) {
    const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [durationMins, setDurationMins] = useState(0);
    const [endTime, setEndTime] = useState<number | null>(null);

    // Initial load
    useEffect(() => {
        const loadTimer = async () => {
            try {
                const stored = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
                if (stored) {
                    const data = JSON.parse(stored);
                    setActiveTaskId(data.activeTaskId);
                    setDurationMins(data.durationMins);

                    if (data.isActive && data.endTime) {
                        const now = Date.now();
                        if (now >= data.endTime) {
                            setTimeLeft(0);
                            setIsActive(false);
                            setEndTime(null);
                        } else {
                            setTimeLeft(Math.floor((data.endTime - now) / 1000));
                            setIsActive(true);
                            setEndTime(data.endTime);
                        }
                    } else {
                        setTimeLeft(data.timeLeft || 0);
                        setIsActive(data.isActive || false);
                        setEndTime(data.endTime || null);
                    }
                }
            } catch (error) { }
        };
        loadTimer();
    }, []);

    const stateRef = useRef({ activeTaskId, timeLeft, isActive, durationMins, endTime });
    useEffect(() => {
        stateRef.current = { activeTaskId, timeLeft, isActive, durationMins, endTime };
    }, [activeTaskId, timeLeft, isActive, durationMins, endTime]);

    const saveTimerState = async (customState?: any) => {
        try {
            const dataToSave = customState || stateRef.current;
            await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (error) { }
    };

    // Handle AppState changes
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                const { isActive: curActive, endTime: curEndTime } = stateRef.current;
                if (curActive && curEndTime) {
                    const now = Date.now();
                    if (now >= curEndTime) {
                        setTimeLeft(0);
                        setIsActive(false);
                        setEndTime(null);
                        saveTimerState({ ...stateRef.current, timeLeft: 0, isActive: false, endTime: null });
                    } else {
                        setTimeLeft(Math.floor((curEndTime - now) / 1000));
                    }
                }
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                saveTimerState();
            }
        });
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isActive && endTime) {
            interval = setInterval(() => {
                const now = Date.now();
                if (now >= endTime) {
                    setTimeLeft(0);
                    setIsActive(false);
                    setEndTime(null);
                    saveTimerState({ ...stateRef.current, timeLeft: 0, isActive: false, endTime: null });
                    if (interval) clearInterval(interval);
                } else {
                    setTimeLeft(Math.floor((endTime - now) / 1000));
                }
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, endTime]);

    const startTimer = (taskId: number | null, duration: number) => {
        const seconds = duration * 60;
        const newEndTime = Date.now() + seconds * 1000;
        setDurationMins(duration);
        setActiveTaskId(taskId);
        setTimeLeft(seconds);
        setIsActive(true);
        setEndTime(newEndTime);
        saveTimerState({ activeTaskId: taskId, durationMins: duration, timeLeft: seconds, isActive: true, endTime: newEndTime });
    };

    const stopTimer = () => {
        setIsActive(false);
        setEndTime(null);
        saveTimerState({ ...stateRef.current, isActive: false, endTime: null });
    };

    const resumeTimer = () => {
        const newEndTime = Date.now() + stateRef.current.timeLeft * 1000;
        setIsActive(true);
        setEndTime(newEndTime);
        saveTimerState({ ...stateRef.current, isActive: true, endTime: newEndTime });
    };

    const endTimer = () => {
        setIsActive(false);
        setTimeLeft(0);
        setEndTime(null);
        setActiveTaskId(null);
        saveTimerState({ activeTaskId: null, durationMins: stateRef.current.durationMins, timeLeft: 0, isActive: false, endTime: null });
    };

    const resetTimer = () => {
        const seconds = stateRef.current.durationMins * 60;
        setIsActive(false);
        setTimeLeft(seconds);
        setEndTime(null);
        saveTimerState({ ...stateRef.current, timeLeft: seconds, isActive: false, endTime: null });
    };

    return (
        <TimerContext.Provider value={{ activeTaskId, timeLeft, isActive, durationMins, startTimer, stopTimer, resumeTimer, endTimer, resetTimer }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useTimer() {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
}
