import React, {useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";

import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNavigation } from '@react-navigation/native';

interface TransportChoiceProps {
    transportationChoice: string | null;
    setTransportationChoice: React.Dispatch<React.SetStateAction<string | null>>;
}


export function LiveNavigation() {
    const arrivalTime = '11:37 AM';
    const transportTime='8 minutes';
    const transportDistance='0.46km';

    const stopNavigation = () => {
        
    };

    return (<View style={styles.container}>
                <View style={styles.destinationInformation}>
                    <Text style={styles.routeHeading}>ETA</Text>
                    <Text style={styles.routeHeadingDestination}>{arrivalTime}</Text>
                    <View style={styles.travelInformation}>
                        <Text style={styles.time}>{transportTime}</Text>
                        <Text style={styles.distance}>{transportDistance}</Text>
                    </View>
                    <TouchableOpacity style={styles.startButton} onPress={stopNavigation}>
                        <IconSymbol name='play' size={40} color="black" style={styles.navigationIcon} />
                        <Text style={styles.start}>Stop</Text>
                    </TouchableOpacity>

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
        flexDirection: 'row',
        alignItems: 'center',
    },
    navigationIcon: {
        paddingLeft: 20
    },
    start:{
        paddingLeft:15,
        fontSize: 23,
        color: 'white',
    },
});