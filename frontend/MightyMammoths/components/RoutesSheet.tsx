//Shows routes to a destination such as walk, bike, drive, shuttle
import React, {useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';

interface TransportChoiceProps {
    transportationChoice: string | null;
    setTransportationChoice: React.Dispatch<React.SetStateAction<string | null>>;
    destinationBuilding: string | null;
}

export function TransportChoice({
    transportationChoice,
    setTransportationChoice,
    destinationBuilding
}: TransportChoiceProps) {
    //TODO: make the variables dynamic according to buildings chosen
    const transportModes = ['Drive', 'Public Transit', 'Bicycle', 'Walk' ];
    const transportTime='8 minutes';
    const transportDistance='0.46km';


    const transportIcons = [<IconSymbol name='car.fill' size={30} color="black" style={styles.modeIcon} />,
                            <IconSymbol name='bus.fill' size={30} color="black" style={styles.modeIcon} />, 
                            <IconSymbol name='bicycle' size={30} color="black" style={styles.modeIcon} />,
                            <IconSymbol name='figure.walk' size={30} color="black" style={styles.modeIcon} />
                        ];

    const handlePress = (index: number) => {
        setTransportationChoice(transportModes[index]);
        console.log('Selected transportation mode:', transportModes[index]);
    };

    return (
        <View style={styles.container}>
            {/* Route Heading */}
            <Text style={styles.routeHeading}>Routes to</Text>
            <Text style={styles.routeHeadingDestination}>{destinationBuilding}</Text>

            <View style={styles.transportList}>
                {transportModes.map((mode, index) => (
                <TouchableOpacity key={index} style={styles.transportItem} onPress={() => handlePress(index)}>
                    <View style={styles.transportItemContainer}>
                        {transportIcons[index]}
                        <View style={styles.textInformation}>
                            <Text style={styles.transportMode}>{mode}</Text>
                            <Text style={styles.subRouteHeadingDestination}>{destinationBuilding}</Text>
                        </View>
                        <View style={styles.travelInformation}>
                            <Text style={styles.time}>{transportTime}</Text>
                            <Text style={styles.distance}>{transportDistance}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
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
        marginBottom: 8,
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
        height: '100%',
        borderRadius:20,
        width:'100%'
      },
    modeIcon: {
        marginRight: 10,
        marginLeft: 10,
        alignItems: 'center'
    },
    transportMode:{
        fontSize: 20,
        fontWeight: 'bold',
    },
    subRouteHeadingDestination:{
        fontSize:15,
    },
    textInformation:{
        
    },
    travelInformation:{
        marginLeft: 'auto',
        paddingRight:10
    },
    time:{
        fontSize:20,
        fontWeight: 'bold',
    },
    distance:{
        marginLeft:'auto',
        fontSize:18,
    },

});