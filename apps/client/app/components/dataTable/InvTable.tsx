import * as React from 'react';
import {DataTable, Modal, Portal, Button, Searchbar} from 'react-native-paper';
import {Image, ScrollView, StyleSheet, Text, TextInput, View} from "react-native";
import { DefaultTheme } from '@react-navigation/native';
import {testInventoryItems} from "@/src/features/inventory/dev/testdata";
import {useEffect, useState} from "react";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import * as ImagePicker from 'expo-image-picker';
import geraetServiceWithMapping from "@/src/features/inventory/services/inventory.mapper";
import {useInventory} from "@/src/features/inventory/context/InventoryContext";
import UIGrid from "@/app/components/dataTable/DetailGrid";
import DetailModal from "@/app/components/dataTable/DetailPage";
import DataTableComponent from "@/app/components/dataTable/dataTable";
import AddPage from "@/app/components/dataTable/AddPage";
import herstellerService from "@/src/features/masterdata/services/herstellerService";

const MyComponent = () => {
    const [page, setPage] = React.useState<number>(0);
    const {numberOfItemsPerPageList} = useInventory();
    const [itemsPerPage, onItemsPerPageChange] = React.useState(
        numberOfItemsPerPageList[1]
    );
    const [visibleModal, setVisibleModal] = useState(false);
    const {selectedItem, setSelectedItem} = useInventory();
    const openDetailModal = (item: any) => {
        setSelectedItem(item);
        setVisibleModal(true);
    };
    const {brands, addBrand, fetchItems} = useInventory()
    const {isAddPageVisible,setIsAddPageVisible} = useInventory();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const FALLBACK_VALUE = "N/A";
    const {models, setModels} = useInventory();
    const {items, setItems} = useInventory();
    enum SortOrder { //Enum für Sortorder für Titel der Tabelle
        Ascending = "ascending",
        Descending = "descending",
    }
    const [columns, setColumns] = React.useState([
        { title: 'InvNr', key: 'invNr', numeric: false, sortDirection: undefined}, //sortDirection: SortDirection.Ascending z.B.
        { title: 'Status', key: 'statusid', numeric: false, sortDirection:undefined },
        { title: 'Modell', key: 'modell', numeric: false, sortDirection:undefined },
        { title: 'Standort', key: 'standort', numeric: false, sortDirection:undefined },
        { title: 'Foto', key: 'foto', numeric: false, sortDirection:undefined },

    ]);

    const overriddenStyle = StyleSheet.flatten([
        DefaultTheme,
        { flexShrink: 1 }, //
        // Überschreibt den Default

    ]);
    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, items.length);

    React.useEffect(() => {
        setPage(0);
    }, [itemsPerPage]);



// Step 1: Extract constant

// Step 2: Extract function with meaningful name and type annotations
    function getValueOrFallback<T>(
        item: T,
        key: keyof T,
        fallback: string = FALLBACK_VALUE
    ): string {
        return (item[key] as string) || fallback;
    }
    const handleAddBrand = async (brandName: string) => {
        return await addBrand(brandName);
    };

    const filteredItems = items.filter(item => {
        return (
            String(item.invNr).toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(item.modell).toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(item.standort).toLowerCase().includes(searchQuery.toLowerCase())
        );
    });
    const handleSubmit = async (itemData: any) => {
        try {
            await fetchItems();
        } catch (error) {
            console.error('Fehler beim Einfügen eines neuen Geraets:', error);
            throw error;
        }
    };
    return (
        <View style={styles.container}>
            <DataTableComponent columns={columns} from={from} to={to} openDetailModal={openDetailModal} page={page} setPage={setPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={onItemsPerPageChange} numberOfItemsPerPageList={numberOfItemsPerPageList}></DataTableComponent>
            {/* Detail-Modal */}
            <DetailModal visible={visibleModal} onDismiss={()=>setVisibleModal(false)} selectedItem={selectedItem} columns={columns}>
            </DetailModal>
            <AddPage
                visible={isAddPageVisible}
                onDismiss={() =>setIsAddPageVisible(false)}
                existingBrands={brands}
                existingModels={models}
                onAddBrand={handleAddBrand}
                onSubmit={handleSubmit}></AddPage>
        </View>
    );
};





const styles = StyleSheet.create({
    container: {
        display: "flex",
        flex:1,
        justifyContent:"space-between",
        height:"100%",
        overflow:"hidden",

    },
    datacontainer:{
        flex:1,
    },
    scrollView: {
        flex:1,
    },
    scrollContent: {
        flexGrow: 1, // Verhindert, dass der ScrollView größer als der Bildschirm wird
    },
    pagination: {
        width:"100%",
        marginTop:"auto",
        backgroundColor: 'white',
        paddingTop:15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});

export default MyComponent;

