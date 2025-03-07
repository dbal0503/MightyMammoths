import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const getUpdatedTime = (duration: string) => {
    const numericDuration = parseInt(duration, 10);
    const timeNow = new Date();
    timeNow.setMinutes(timeNow.getMinutes() + numericDuration);
    return timeNow.toLocaleTimeString();
};

interface LiveInformationProps {
    onStop: ()=> void;
    routes: any;
    onZoomOut: (destinationCoordsPlaceID: string, destinationPlaceName: string) => void;
    isZoomedIn: boolean;
    destination: string;
    destinationCoords: string;
}

export function LiveInformation({
    onStop,
    routes,
    onZoomOut,
    isZoomedIn,
    destination,
    destinationCoords
}: LiveInformationProps) {
    const estimates = routes;
    const bestEstimate = estimates && estimates.length > 0 ? estimates[0] : null;
    const stopNavigation = () => {onStop(); if (onZoomOut && isZoomedIn) onZoomOut(destinationCoords, destination);}

    return (
    <>
    <View style={styles.container}>
        <View style={styles.destinationInformation}>
            <View style={styles.etaContainer}>
                <Text style={styles.routeHeading}>ETA</Text>
                <Text style={styles.destinationTime}>{getUpdatedTime(bestEstimate.duration)}</Text>
            </View>
            <View style={styles.travelInformation}>
                <Text style={styles.time}>{bestEstimate.duration}</Text>
                <Text style={styles.distance}>{bestEstimate.distance}</Text>
                <TouchableOpacity style={styles.startButton} onPress={stopNavigation}>
                    <Text style={styles.stop}>Stop</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
    </>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '30%',
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
        width: '80%',
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
    etaContainer:{
        display: 'flex',
        flexDirection: 'column'
    },
    destinationTime:{
        color: 'white',
        fontSize: 20
    }
});