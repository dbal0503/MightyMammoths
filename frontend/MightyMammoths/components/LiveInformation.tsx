import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import campusBuildingdata from '../assets/buildings/coordinates/campusbuildingcoords.json';

const getUpdatedTime = (duration: string) => {
    const numericDuration = parseInt(duration, 10);
    const timeNow = new Date();
    timeNow.setMinutes(timeNow.getMinutes() + numericDuration);
    return timeNow.toLocaleTimeString();
};

interface LiveInformationProps {
    readonly onStop: ()=> void;
    readonly routes: any;
    readonly onZoomOut: (destinationCoordsPlaceID: string, destinationPlaceName: string) => void;
    readonly isZoomedIn: boolean;
    readonly destination: string;
    readonly destinationCoords: string;
    readonly roomNumber?: string | null;
    readonly onViewBuildingInfo?: () => void;
}

export function LiveInformation({
    onStop,
    routes,
    onZoomOut,
    isZoomedIn,
    destination,
    destinationCoords,
    roomNumber,
    onViewBuildingInfo
}: LiveInformationProps) {
    const estimates = routes;
    const bestEstimate = estimates && estimates.length > 0 ? estimates[0] : null;
    const stopNavigation = () => {onStop(); if (onZoomOut && isZoomedIn) onZoomOut(destinationCoords, destination);}

    // Check if room number is specified
    const hasRoomNumber = roomNumber !== null && roomNumber !== undefined && roomNumber !== '';
    console.log('[LiveInformation] hasRoomNumber:', hasRoomNumber);
    //const hasRoomNumber = true;
    console.log()
    const isConcordiaBuilding = (destination: string): boolean => {
        const lowerDestination = destination.toLowerCase();
        return campusBuildingdata.features.some((feature: any) => {
          const buildingName = feature.properties.BuildingName.toLowerCase();
          const buildingCode = feature.properties.Building.toLowerCase();
          return (
            lowerDestination.includes(buildingName) ||
            lowerDestination.includes(buildingCode)
          );
        });
      };
      
    
    console.log('[LiveInformation] destination:', destination);
    console.log('[LiveInformation] isConcordiaBuilding:', isConcordiaBuilding);

    return (
    <>
    {!isConcordiaBuilding ? (
        <View style={styles.container}>
            <View style={styles.destinationInformation}>
                <View style={styles.etaContainer}>
                    <Text style={styles.routeHeading}>ETA</Text>
                    <Text style={styles.destinationTime}>{getUpdatedTime(bestEstimate.duration)}</Text>
                </View>
                <View style={styles.travelInformation}>
                    <View style={styles.travelText}>
                        <Text style={styles.time}>{bestEstimate.duration}</Text>
                        <Text style={styles.distance}>{bestEstimate.distance}</Text>
                    </View>
                    <TouchableOpacity style={styles.startButton} onPress={stopNavigation}>
                        <Text style={styles.stop}>Stop</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    ) : (
        <View style={styles.container}>
            <View style={styles.destinationInformation}>
                <View style={styles.etaContainer}>
                    <Text style={styles.routeHeading}>ETA</Text>
                    <Text style={styles.destinationTime}>{getUpdatedTime(bestEstimate.duration)}</Text>
                </View>
                <View style={styles.travelInformation}>
                    <View style={styles.travelText}>
                        <Text style={styles.time}>{bestEstimate.duration}</Text>
                        <Text style={styles.distance}>{bestEstimate.distance}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        {/* Show "View Building Info" button if no room number */}
                        {!hasRoomNumber && onViewBuildingInfo && (
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.buildingInfoButton]} 
                                onPress={() => {
                                    console.log('[LiveInformation] View Indoor button clicked');
                                    // First execute the callback to show the room prompt
                                    if (onViewBuildingInfo) {
                                        onViewBuildingInfo();
                                    }
                                }}
                            >
                                <Text style={styles.buttonText}>View Indoor</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.stopButton]} 
                            onPress={stopNavigation}
                        >
                            <Text style={styles.buttonText}>Stop</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )}
    </>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: -30,
        width: '100%',
        height: 500,
        paddingBottom: 30,
        marginBottom: '100%',
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
        paddingTop: 20,
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
    buttonContainer: {
        position: 'absolute',
        flexDirection: 'row',
        marginLeft: 100,
        marginTop: 100,
        justifyContent: 'space-between',
        width: '70%',
    },
    actionButton: {
        borderRadius: 20,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    stopButton: {
        backgroundColor: 'red',
        minWidth: 120,
    },
    buildingInfoButton: {
        backgroundColor: '#1e88e5',
        marginRight: 10,
        minWidth: 120,
    },
    startButton:{
        position: 'absolute',
        backgroundColor: 'red',
        borderRadius: 20,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 230,
        width:'40%',
        justifyContent: 'center',
        marginTop: 100
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
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
    },
    travelText:{
        marginTop:10
    }
});