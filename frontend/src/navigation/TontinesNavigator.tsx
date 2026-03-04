import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TontinesScreen } from '../screens/Tontines/TontinesScreen';
import { CreateTontineScreen } from '../screens/Tontines/CreateTontineScreen';
import { ConfirmTontineScreen } from '../screens/Tontines/ConfirmTontineScreen';
import { TontineDetailsScreen } from '../screens/Tontines/TontineDetailsScreen';
import { InviteMembersScreen } from '../screens/Tontines/InviteMembersScreen';
import { AdminTontineScreen } from '../screens/Tontines/AdminTontineScreen';
import { PaymentHistoryScreen } from '../screens/Tontines/PaymentHistoryScreen';
import { CotisationsScreen } from '../screens/Cotisations/CotisationsScreen';
import { StatistiquesCotisationsScreen } from '../screens/Cotisations/StatistiquesCotisationsScreen';
import { ChatScreen } from '../screens/Chat/ChatScreen';
import { DistributionScreen } from '../screens/Tontines/DistributionScreen';

export type TontinesStackParamList = {
    TontinesList: undefined;
    CreateTontine: undefined;
    ConfirmTontine: { tontineData: any };
    TontineDetails: { id: string };
    InviteMembers: { tontineId: string; tontineName: string };
    AdminTontine: { tontineId: string; tontineName: string };
    PaymentHistory: { tontineId: string };
    Cotisations: { tontineId: string };
    StatistiquesCotisations: { tontineId: string };
    Chat: { tontineId: string; tontineName: string };
    Distribution: { tontineId: string };
};

const Stack = createNativeStackNavigator<TontinesStackParamList>();

export const TontinesNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="TontinesList" component={TontinesScreen} />
            <Stack.Screen name="CreateTontine" component={CreateTontineScreen} />
            <Stack.Screen name="ConfirmTontine" component={ConfirmTontineScreen} />
            <Stack.Screen name="TontineDetails" component={TontineDetailsScreen} />
            <Stack.Screen name="InviteMembers" component={InviteMembersScreen} />
            <Stack.Screen name="AdminTontine" component={AdminTontineScreen} />
            <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
            <Stack.Screen name="Cotisations" component={CotisationsScreen} />
            <Stack.Screen name="StatistiquesCotisations" component={StatistiquesCotisationsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Distribution" component={DistributionScreen} />
        </Stack.Navigator>
    );
};
