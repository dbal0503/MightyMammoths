import React, {useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";

import { IconSymbol } from '@/components/ui/IconSymbol';

export function LiveNavigation() {
    const arrivalTime = '11:37 AM';
    const transportTime='8 minutes';
    const transportDistance='0.46km';
    const router = useRouter();

    const stopNavigation = () => {
        router.push("/navigation");
    };

    return (<View style={styles.container}>
                <View style={styles.destinationInformation}>
                    <Text style={styles.routeHeading}>ETA</Text>
                    <Text style={styles.routeHeadingDestination}>{arrivalTime}</Text>
                    <View style={styles.travelInformation}>
                        <Text style={styles.time}>{transportTime}</Text>
                        <Text style={styles.distance}>{transportDistance}</Text>
                        <TouchableOpacity style={styles.startButton} onPress={stopNavigation}>
                            <Text style={styles.stop}>Stop</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            );
}

const styles = StyleSheet.create({
    container: {
        height: '35%',
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
        marginBottom: 0,
        color: 'white',
    },
    destinationInformation: {
        paddingLeft: 20,
    },
    travelInformation:{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 0,
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
        marginTop:0,
        backgroundColor: 'red',
        borderRadius: 20,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 30,
        width:'40%',
        justifyContent: 'center',
    },
    navigationIcon: {
        paddingLeft: 10
    },
    stop:{
        
        fontSize: 23,
        color: 'white',
    },
});