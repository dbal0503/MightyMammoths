import React, {useState} from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BuildingDropdown from '@/components/ui/input/BuildingDropdown';
import { IconSymbol } from '@/components/ui/IconSymbol';

export function DestinationChoices({ setSelectedBuilding }: { setSelectedBuilding: (building: string) => void }) {
    const buildingList = ["EV","Hall", "JMSB", "CL Building", "Learning Square"];
    const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
    return (<View style={styles.container}>
                <View style={styles.dropdownWrapper}>
                    <BuildingDropdown options={buildingList} onSelect={(selected) => console.log(selected)} />
                </View>
                <IconSymbol name='more-vert' size={30} color="black" style={styles.modeIcon} />
                <View style={styles.dropdownWrapper}>
                    <BuildingDropdown options={buildingList} onSelect={(selected) => {
                        setSelectedDestination(selected);
                        setSelectedBuilding(selected); 
                    }}  />
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
});