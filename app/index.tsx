import {Image, StyleSheet, Platform, ScrollView} from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {useTheme} from "react-native-paper";

import { Text, View, /* @tutinfo Import <CODE>StyleSheet</CODE> to define styles. */ } from 'react-native';
import InvTable from "@/app/DataTable/InvTable";

export default function Index() {
    const theme = useTheme();
    return (
        <View style={{height: "100%"}}>
            <InvTable></InvTable>
        </View>
    );
}

