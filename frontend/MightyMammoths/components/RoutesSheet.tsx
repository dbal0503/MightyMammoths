//Shows routes to a destination such as walk, bike, drive, shuttle
import React, {useState} from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol'

export function TransportChoice() {
    const destinationBuilding = 'Henry F.Hall Building';
    const transportModes = ['Drive', 'Public Transit', 'Bicycle', 'Walk' ];
    const modeIcons = {
        'Drive': 'car',  // Replace with the icon name for Drive
        'Public Transit': 'directions-bus',  // Icon for bus
        'Bike': 'directions-bike',  // Icon for bike
        'Walk': 'directions-walk',  // Icon for walking
    };

    return (
        <View style={styles.container}>
            {/* Route Heading */}
            <Text style={styles.routeHeading}>Routes to</Text>
            <Text style={styles.routeHeadingDestination}>{destinationBuilding}</Text>

            <View style={styles.transportList}>
                {transportModes.map((mode, index) => (
                <Text key={index} style={styles.transportItem}>
                    <View key={index} style={styles.transportItemContainer}>
                        <IconSymbol name='map.fill' size={30} color="black" style={styles.modeIcon} />
                        <Text style={styles.transportMode}>{mode}</Text>
                    </View>
                </Text>
                ))}
            </View>
        </View>
        );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: 'black'
      },
      routeHeading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 0,
        color: 'white',
      },
      routeHeadingDestination: {
        fontSize: 20,
        marginBottom: 16,
        color: 'white',
      },
      transportList: {
        marginTop: 5,
        flex: 1
      },
      transportItem: {
        fontSize: 18,
        marginBottom: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        height:90,
      },
      transportItemContainer: {
        flexDirection: 'row',
        alignItems: 'center', // Center items vertically
        marginBottom: 8,
        backgroundColor: 'blue',
        flex:1
      },
    modeIcon: {
        marginRight: 10,
        marginLeft: 10,
        alignItems: 'center'
    },
    transportMode:{
        fontSize: 15,
    }
});