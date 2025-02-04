import React, {useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';

export function StartNavigation() {
    const destinationBuilding = 'Henry F.Hall Building';
    const transportTime='8 minutes';
    const transportDistance='0.46km';
    return (<View style={styles.container}>
                <IconSymbol name='arrow-back' size={50} color="black" style={styles.modeIcon} />
                <View style={styles.destinationInformation}>
                    <Text style={styles.routeHeading}>Routes to</Text>
                    <Text style={styles.routeHeadingDestination}>{destinationBuilding}</Text>
                    <View style={styles.travelInformation}>
                        <Text style={styles.time}>{transportTime}</Text>
                        <Text style={styles.distance}>{transportDistance}</Text>
                    </View>
                    <View style = {styles.startButton}>
                        <Text style={styles.time}>Start</Text>
                    </View>
                </View>
            </View>
            );
}

const styles = StyleSheet.create({
    container: {
        height: '60%',
        width: '100%',
        padding: 16,
        marginBottom:0,
        flexDirection: 'row',
        borderBottomLeftRadius:10,
        borderBottomRightRadius:10,
        backgroundColor: 'black',
      },
    dropdownWrapper: {
        alignItems: "center",
    },
    modeIcon: {
        alignItems: 'center',
        color: 'black',
        padding: 5,
        backgroundColor: 'white',
        borderRadius: 20,
        height:'22%'
    },
    routeHeading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 0,
        color: 'white',
    },
    routeHeadingDestination: {
        fontSize: 20,
        marginBottom: 8,
        color: 'white',
    },
    destinationInformation: {
        paddingLeft: 20,
    },
    travelInformation:{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 20,
    },
    time:{
        fontSize:20,
        fontWeight: 'bold',
        color: 'white',
        paddingRight: 40
    },
    distance:{
        fontSize:18,
        color: 'white',
    },
    startButton:{
        marginTop:40,
        backgroundColor: 'blue',
        borderRadius: 20,
        height: 60,
    }
});