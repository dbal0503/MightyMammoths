import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';

interface navigationInformationProps {
    visible?: boolean;
}

export function NavigationInformation({ visible = true }: navigationInformationProps) {
    if (!visible) return null;
    const nextStep='Rue Sainte-Catherine O';
    const distance='240m';
    return (<View style={styles.container}>
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
        position: 'absolute', 
        top: 0, 
        left: 0,
        right: 0,
        padding: 16,
        marginBottom: 0,
        backgroundColor: 'black',
        alignItems: 'center',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        zIndex: 10, 
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