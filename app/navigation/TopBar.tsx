import * as React from 'react';
import { Appbar } from 'react-native-paper';

const MyComponent = () => (
    <Appbar.Header>
        <Appbar.BackAction onPress={() => {}} />
        <Appbar.Content title="ChurchINV" />
        <Appbar.Action icon="plus" onPress={() => {}} />
        <Appbar.Action icon="magnify" onPress={() => {}} />
        <Appbar.Action icon="filter" onPress={() => {}} />
    </Appbar.Header>
);

export default MyComponent;