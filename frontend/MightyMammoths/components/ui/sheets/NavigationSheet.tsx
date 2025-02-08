import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState, useRef } from 'react';

import GoogleCalendarButton from '../input/GoogleCalendarButton';
import ActionSheet from 'react-native-actions-sheet';
import ToggleSwitch from '../input/ToggleSwitch';
import RetroSwitch from '../input/RetroSwitch';
import { ActionSheetProps } from 'react-native-actions-sheet';
import {ActionSheetRef, useSheetRef} from "react-native-actions-sheet";

import { TransportChoice } from "@/components/RoutesSheet";
import { StartNavigation } from "@/components/RouteStart";
import { getRoutes, RouteData } from "@/services/directionsService";

export type NavigationSheetProps = ActionSheetProps & {
    actionsheetref: React.MutableRefObject<ActionSheetRef | null>;
    closeChooseDest: React.Dispatch<React.SetStateAction<boolean>>;
}

function NavigationSheet({
    isModal = false,
    snapPoints = [100],
    backgroundInteractionEnabled = true,
    closable = true,
    gestureEnabled = true,
    initialSnapIndex = 0,
    overdrawEnabled = false,
    overdrawSize = 200,
    actionsheetref,
    closeChooseDest
}: NavigationSheetProps) {
    const [isEnabled, setIsEnabled] = useState(false);
    const [origin, setOrigin] = useState<string>("");
    const [destination, setDestination] = useState<string>("");
    const [routeEstimates, setRouteEstimates] = useState<{
      [mode: string]: RouteData[];
    }>({});
    const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false);
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
    const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
    const [twoBuildingsSelected, setTwoBuildingsSelected] = useState<boolean>(false);

    return (
      <ActionSheet
        ref={actionsheetref}
        isModal={isModal} 
        snapPoints={snapPoints} 
        backgroundInteractionEnabled={backgroundInteractionEnabled}
        closable={closable}
        gestureEnabled={gestureEnabled}
        initialSnapIndex={initialSnapIndex}
        containerStyle={styles.root}
        overdrawEnabled={overdrawEnabled}
        overdrawSize={overdrawSize}
        onClose={() =>{
            closeChooseDest(false)
        }}
        >
          <View style={styles.centeredView}>
                {selectedMode === null ? (
                // Show the transportation mode options
                <TransportChoice
                    routeEstimates={routeEstimates}
                    onSelectMode={(mode) => setSelectedMode(mode)}
                    destinationBuilding={selectedBuilding}
                    bothSelected={twoBuildingsSelected}
                />
                ) : (
                // Once a mode is selected, show alternative routes for that mode.
                <StartNavigation
                    mode={selectedMode}
                    routes={routeEstimates[selectedMode] || []}
                    onSelectRoute={setSelectedRoute}
                    onBack={() => setSelectedMode(null)}
                    destinationBuilding={selectedBuilding}
                />
                )}
          </View>
      </ActionSheet>
    );
  }

  const styles = StyleSheet.create({
    root:{
        height: '60%',
        backgroundColor: '#010213',
        borderRadius: 10
    },
    centeredView: {
        marginTop: "10%",
        alignItems: "center",
        justifyContent: 'flex-start',
      },
      subTitleText : {
        color: "#b2b3b8",
        fontSize: 16,
        marginLeft: 40,
        marginTop: 30,
      },
      accessibilityContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginLeft: 40,
        marginRight: 40,
        marginTop: 20,
      },
      accessibilityLabel: {
        color: "white",
        fontSize: 22,
      },
  });
   
  export default NavigationSheet;