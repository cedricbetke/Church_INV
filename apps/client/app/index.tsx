import {Image, StyleSheet, Platform, ScrollView} from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {useTheme} from "react-native-paper";

import { Text, View, /* @tutinfo Import <CODE>StyleSheet</CODE> to define styles. */ } from 'react-native';
import InvTable from "@/src/features/inventory/components/InvTable";
import TopBar from "@/app/navigation/TopBar";
import { InventoryProvider } from "@/src/features/inventory/context/InventoryContext";

export default function Index() {
    const theme = useTheme();
    return (
        <InventoryProvider>
            <View style={{height: "100%"}}>
                <TopBar></TopBar>
                <InvTable></InvTable>
            </View>
        </InventoryProvider>
    );
}

