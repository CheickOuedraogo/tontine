import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Home, Bell, User } from 'lucide-react-native';

import { theme } from '../theme';

// DEFINITIONS BEFORE IMPORTS TO AVOID CIRCULAR REF ISSUES
export type TabParamList = {
    Dashboard: undefined;
    Notifications: undefined;
    Profile: undefined;
};

export type AppStackParamList = {
    MainTabs: undefined;
    Tontines: { screen?: string; params?: any };
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

// NOW IMPORTS
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { TontinesNavigator } from './TontinesNavigator';
import { NotificationsScreen } from '../screens/Dashboard/NotificationsScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { useNotificationStore } from '../store/useNotificationStore';

export const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.white,
                    borderTopColor: theme.colors.border,
                    paddingTop: 4,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 4,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Accueil',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('Dashboard');
                    },
                })}
            />
            <Tab.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{
                    tabBarLabel: 'Alertes',
                    tabBarIcon: ({ color, size }) => {
                        const unreadCount = useNotificationStore(state => state.unreadCount);
                        return (
                            <View>
                                <Bell color={color} size={size} />
                                {unreadCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    },
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('Notifications');
                    },
                })}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profil',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('Profile');
                    },
                })}
            />
        </Tab.Navigator>
    );
};

export const AppNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Tontines" component={TontinesNavigator} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        right: -6,
        top: -3,
        backgroundColor: '#EF4444',
        borderRadius: 8,
        minWidth: 16,
        paddingHorizontal: 4,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
    },
});
