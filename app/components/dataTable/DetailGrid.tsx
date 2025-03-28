import React from 'react';
import {View,StyleSheet} from 'react-native';

const UIGrid = ({
                    columns = 2,
                    xGap = 0,
                    yGap = 0,
                    children,
                }) => {
    const styles = StyleSheet.create({
        grid: {
            overflow: 'hidden',
            flexShrink: 0,
        },
        gridContent: {
            flexShrink: 0,
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -xGap / 2,
            marginVertical: -yGap / 2,
        },
        gridItem: {
            paddingHorizontal: xGap / 2,
            paddingVertical: yGap / 2,
            minWidth: 0,
            minHeight: 0,
            flexShrink: 0,
            width: `${100 / columns}%`,
        },
    });

    return (
        <View style={styles.grid}>
            <View style={styles.gridContent}>
                {React.Children.map(children, (child) => {
                    return (
                        <View style={styles.gridItem}>{React.cloneElement(child)}</View>
                    );
                })}
            </View>
        </View>
    );
};

export default UIGrid;