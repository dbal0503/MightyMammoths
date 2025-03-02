import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';

interface NavigationInformationProps {
    destinationBuilding: string; // Accept destination as prop
}

export function NavigationInformation({ destinationBuilding }: NavigationInformationProps) {
    const address='1550 De Maisonnneuve West';
    const nextStep='Rue Sainte-Catherine O';
    const distance='240m';
    return (
    <View style={styles.container}>
        <View style={styles.destinationInformation}>
            <IconSymbol name="flag" size={50} color="black" style={styles.modeIcon}/>
            <View style={styles.textInformation}>
                <Text style={styles.buildingName}>{destinationBuilding}</Text>
                <Text style={styles.address}>{address}</Text>
            </View>
        </View>
        <View style={styles.directionInformation}>
            <IconSymbol name={"arrow-back" as IconSymbolName} size={50} color="white" style={styles.modeIcon}/>
            <View style={styles.distanceInformation}>
                <Text style={styles.nextStep}>{nextStep}</Text>
                <Text style={styles.distance}>{distance}</Text>
            </View>
        </View>
    </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '23%',
        width: '100%',
        padding: 16,
        marginBottom:0,
        borderBottomLeftRadius:10,
        borderBottomRightRadius:10,
        backgroundColor: 'black',
        alignItems: 'center'
      },
    dropdownWrapper: {
        alignItems: "center",
    },
    modeIcon: {
        alignItems: 'center',
        color: 'white',
        padding: 5
    },
    destinationInformation:{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'white',
        width: "90%",
        paddingTop: 10,
    },
    buildingName:{
        fontSize: 20,
        color: 'white',
    },
    address:{
        fontSize:16,
        color: 'white',
    },
    textInformation:{
        paddingLeft: 15,
    },
    directionInformation:{
        flexDirection: 'row',
        width: '90%',
        paddingTop: 25,
    },
    nextStep:{
        fontSize: 20,
        color: 'white',
    },
    distance:{
        fontSize: 20,
        color: 'white',
    },
    distanceInformation:{
        paddingLeft: 15,
    }
});