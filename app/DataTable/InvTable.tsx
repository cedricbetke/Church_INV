import * as React from 'react';
import { DataTable } from 'react-native-paper';
import {ScrollView, View} from "react-native";
import {StyleSheet} from "react-native";

const MyComponent = () => {
    const [page, setPage] = React.useState<number>(0);
    const [numberOfItemsPerPageList] = React.useState([5,10,15,20]);
    const [itemsPerPage, onItemsPerPageChange] = React.useState(
        numberOfItemsPerPageList[1]
    );

    const [items] = React.useState([
        {
            key: 1,
            name: 'Cupcake',
            calories: 356,
            fat: 16,
        },
        {
            key: 2,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 3,
            name: 'Frozen yogurt',
            calories: 159,
            fat: 6,
        },
        {
            key: 4,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },
        {
            key: 5,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 6,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 7,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 8,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 9,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 10,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 11,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 12,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 13,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },
        {
            key: 14,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 15,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 16,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 17,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
    ]);

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, items.length);

    React.useEffect(() => {
        setPage(0);
    }, [itemsPerPage]);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title>Dessert</DataTable.Title>
                        <DataTable.Title numeric>Calories</DataTable.Title>
                        <DataTable.Title numeric>Fat</DataTable.Title>
                    </DataTable.Header>

                    {items.slice(from, to).map((item) => (
                        <DataTable.Row key={item.key}>
                            <DataTable.Cell>{item.name}</DataTable.Cell>
                            <DataTable.Cell numeric>{item.calories}</DataTable.Cell>
                            <DataTable.Cell numeric>{item.fat}</DataTable.Cell>
                        </DataTable.Row>
                    ))}
                </DataTable>
            </ScrollView>

            <View style={styles.pagination}>
                <DataTable.Pagination
                    page={page}
                    numberOfPages={Math.ceil(items.length / itemsPerPage)}
                    onPageChange={(page) => setPage(page)}
                    label={`${from + 1}-${to} of ${items.length}`}
                    numberOfItemsPerPageList={numberOfItemsPerPageList}
                    numberOfItemsPerPage={itemsPerPage}
                    onItemsPerPageChange={onItemsPerPageChange}
                    showFastPaginationControls
                />
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    scrollView: {
        maxHeight: '85%', // Setzt die Höhe der ScrollView
    },
    pagination: {
        position: 'absolute', // Mach die Pagination sticky
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});

export default MyComponent;

