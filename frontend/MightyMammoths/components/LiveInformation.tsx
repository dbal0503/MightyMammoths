import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { buildingList } from '../utils/getBuildingList';

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
    roomNumber?: string | null;
    onViewBuildingInfo?: (isLoyolaCampus: boolean) => void;
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
    
    // Check if the destination is a Concordia building, considering both full names and building codes
    const isConcordiaBuilding = (() => {
      // First check if it's a direct match with any building name
      const isNameMatch = buildingList.some(building =>
        destination.toLowerCase().includes(building.buildingName.toLowerCase())
      );
      
      if (isNameMatch) return true;
      
      // If not a name match, check if it's a building code like "H" or "EV"
      // Only match single letter or 2-3 letter building codes, not full names that happen to include those letters
      const isCodeMatch = /^([A-Z]{1,3})$/i.test(destination.trim());
      
      if (isCodeMatch) {
        console.log('[LiveInformation] Detected potential building code:', destination);
        return true;
      }
      
      // Check if it's a class name with building code like "SOEN 345 H"
      const classCodeMatch = /\b([A-Z]+)\s+\d+\s+([A-Z])\b/i.exec(destination);
      if (classCodeMatch) {
        console.log('[LiveInformation] Detected building code from class name:', classCodeMatch[2]);
        return true;
      }
      
      return false;
    })();

    // Determine if building is on Loyola campus
    const isLoyolaCampusBuilding = (() => {
      try {
        // Import building coordinates data to access campus property
        const campusBuildingCoords = require('../assets/buildings/coordinates/campusbuildingcoords.json');
        
        // Look up building by name or code
        const buildingInfo = campusBuildingCoords.features.find(
          (feature: any) => {
            const buildingName = feature.properties.BuildingName || '';
            const buildingCode = feature.properties.Building || '';
            
            return destination.includes(buildingName) || 
                   destination.trim().toUpperCase() === buildingCode.trim().toUpperCase() ||
                   // Class code format
                   destination.match(new RegExp(`\\b[A-Z]+\\s+\\d+\\s+${buildingCode}\\b`, 'i'));
          }
        );
        
        if (buildingInfo && buildingInfo.properties.Campus === 'LOY') {
          console.log('[LiveInformation] Detected Loyola campus building:', buildingInfo.properties.BuildingName);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('[LiveInformation] Error detecting campus:', error);
        return false;
      }
    })();
    
    console.log('[LiveInformation] destination:', destination);
    console.log('[LiveInformation] roomNumber:', roomNumber);
    console.log('[LiveInformation] hasRoomNumber:', hasRoomNumber);
    console.log('[LiveInformation] isConcordiaBuilding:', isConcordiaBuilding);
    console.log('[LiveInformation] isLoyolaCampusBuilding:', isLoyolaCampusBuilding);

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
                        {/* Show "View Indoor" button for Concordia buildings */}
                        {isConcordiaBuilding && onViewBuildingInfo && (
                            <TouchableOpacity 
                                style={[
                                    styles.actionButton, 
                                    styles.buildingInfoButton,
                                    hasRoomNumber ? styles.roomNumberButton : null
                                ]} 
                                onPress={() => {
                                    console.log('[LiveInformation] View Indoor button clicked');
                                    console.log('[LiveInformation] roomNumber:', roomNumber);
                                    console.log('[LiveInformation] Using specific room number:', hasRoomNumber ? roomNumber : 'No room number available');
                                    // First execute the callback to show the room prompt
                                    if (onViewBuildingInfo) {
                                        onViewBuildingInfo(isLoyolaCampusBuilding);
                                    }
                                }}
                            >
                                <Text style={styles.buttonText}>{hasRoomNumber ? `View Room ${roomNumber}` : (isLoyolaCampusBuilding ? 'View VE Map' : 'View Indoor')}</Text>
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
    },
    roomNumberButton: {
        backgroundColor: '#1e88e5',
    },
});