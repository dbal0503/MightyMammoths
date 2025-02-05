//screen for choosing start and end destination
import React, {useRef, useMemo, useEffect,useState} from 'react';
import {StyleSheet, View, Text } from 'react-native';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {TransportChoice} from "@/components/RoutesSheet";
import { DestinationChoices } from '@/components/Destinations';
import { StartNavigation } from '@/components/RouteStart';


export default function NavigationScreen () {
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["30%", "60%"], []);
    const [transportationChoice, setTransportationChoice] = useState<string | null>(null);
    const [showStartNavigation, setShowStartNavigation] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState<string>('Hall');

    useEffect(() => {
        if (transportationChoice !== null) {
            setShowStartNavigation(true);
        }
    }, [transportationChoice]); 

    return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <DestinationChoices
            setSelectedBuilding={setSelectedBuilding}>
        </DestinationChoices>
        <BottomSheet
            ref={sheetRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            backgroundStyle={{backgroundColor: '#010213'}}
            handleIndicatorStyle={{backgroundColor: 'white'}}
            >
            {transportationChoice === null ? (
                <TransportChoice 
                    transportationChoice={transportationChoice} 
                    setTransportationChoice={setTransportationChoice}
                    destinationBuilding={selectedBuilding} 
                />
            ) : (
                <StartNavigation
                    transportationChoice={transportationChoice} 
                    setTransportationChoice={setTransportationChoice}
                    destinationBuilding={selectedBuilding}
                />
            )}
        </BottomSheet>
      </GestureHandlerRootView>
    </>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      paddingTop:25,
      padding: 0,

    },

    
  });
