import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import { ActionSheetProps } from 'react-native-actions-sheet';
import {ActionSheetRef } from "react-native-actions-sheet";
import { TransportChoice } from "@/components/RoutesSheet";
import { StartNavigation } from "@/components/RouteStart";
import { useNavigation } from "@/components/NavigationProvider"
import { LiveInformation } from '@/components/LiveInformation';
import polyline from "@mapbox/polyline"
import { LatLng } from 'react-native-maps';

export type NavigationSheetProps = ActionSheetProps & {
    actionsheetref: React.MutableRefObject<ActionSheetRef | null>;
    closeChooseDest: React.Dispatch<React.SetStateAction<boolean>>;
    setNavigationMode: React.Dispatch<React.SetStateAction<boolean>>;
    onPolylineUpdate: (poly:LatLng[])=>void;
}

function NavigationSheet({
    onPolylineUpdate,
    isModal = false,
    snapPoints = [50 ,100],
    backgroundInteractionEnabled = true,
    closable = false,
    gestureEnabled = false,
    initialSnapIndex = 1,
    overdrawEnabled = false,
    overdrawSize = 200,
    actionsheetref,
    closeChooseDest,
    setNavigationMode
}: NavigationSheetProps) {
    const { state, functions } = useNavigation();
    const { 
        routeEstimates, 
        selectedMode, 
        selectedBuilding, 
        twoBuildingsSelected,
        origin,
        destination
    } = state;
    
    const { 
        setSelectedMode, 
        setSelectedRoute,
        setRouteEstimates,
    } = functions;

    const [startedSelectedRoute,setStartedSelectedRoute] = useState(false);

    const setPoly = (poly: string) => {
      const decodedPoly: LatLng[] = polyline.decode(poly).map(([latitude, longitude]) => ({
        latitude,
        longitude,
      }));
      onPolylineUpdate(decodedPoly);
    }

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
        onClose={() =>{ //cleanup 
          setNavigationMode(false);
          closeChooseDest(false);
          setSelectedMode(null);
          setRouteEstimates({});
        }}
        >
          <View style={styles.centeredView}>
                {selectedMode === null ? (
                // Show the transportation mode options
                <TransportChoice
                    onBack={()=>{
                      actionsheetref.current?.hide();
                    }}
                    routeEstimates={routeEstimates}
                    onSelectMode={(mode) => {
                      if(origin && destination){
                        setSelectedMode(mode);
                        actionsheetref.current?.snapToIndex(0)
                      }
                    }}
                    destinationBuilding={selectedBuilding}
                    bothSelected={twoBuildingsSelected}
                />
                ) : (startedSelectedRoute===false? (
                <StartNavigation
                    routes={routeEstimates[selectedMode] || []}
                    onBack={() => {
                      setSelectedMode(null);
                      actionsheetref.current?.snapToIndex(1);
                    }}
                    destinationBuilding={selectedBuilding}
                    starting={()=> {
                      closeChooseDest(false)
                      setStartedSelectedRoute(true);
                    }}
                    defPoly={() => setPoly(routeEstimates[selectedMode][0].polyline)}
                />
                ) : (
                  <LiveInformation
                    onStop={()=>{
                      actionsheetref.current?.hide();
                      setPoly("");
                      setStartedSelectedRoute(false);
                    }}
                    routes={routeEstimates[selectedMode] || []}
                  /> 
                )
              )}


          </View>
      </ActionSheet>
    );
  }

  const styles = StyleSheet.create({
    root:{
        width: '100%',
        height: '65%',
        backgroundColor: '#010213',
        borderRadius: 10
    },
    centeredView: {
        height: '100%',
        width: '100%',
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