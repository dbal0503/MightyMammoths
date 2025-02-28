import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState, useRef, act } from 'react';
import GoogleCalendarButton from '../input/GoogleCalendarButton';
import ActionSheet from 'react-native-actions-sheet';
import ToggleSwitch from '../input/ToggleSwitch';
import RetroSwitch from '../input/RetroSwitch';
import { ActionSheetProps } from 'react-native-actions-sheet';
import {ActionSheetRef, useSheetRef} from "react-native-actions-sheet";
import { TransportChoice } from "@/components/RoutesSheet";
import { StartNavigation } from "@/components/RouteStart";
import { getRoutes, RouteData } from "@/services/directionsService";
import { useNavigation } from "@/components/NavigationProvider"
import { LiveInformation } from '@/components/LiveInformation';
import polyline from "@mapbox/polyline"
import { LatLng } from 'react-native-maps';

export type NavigationSheetProps = ActionSheetProps & {
    actionsheetref: React.MutableRefObject<ActionSheetRef | null>;
    closeChooseDest: React.Dispatch<React.SetStateAction<boolean>>;
    setNavigationMode: React.Dispatch<React.SetStateAction<boolean>>;
    onPolylineUpdate: (poly:LatLng[])=>void;
    onExtraClose?: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    isZoomedIn: boolean;
}

function NavigationSheet({
    onPolylineUpdate,
    isModal = false,
    snapPoints = [30 ,50 ,100],
    backgroundInteractionEnabled = true,
    closable = false,
    gestureEnabled = false,
    initialSnapIndex = 2,
    overdrawEnabled = false,
    overdrawSize = 200,
    actionsheetref,
    closeChooseDest,
    setNavigationMode,
    onExtraClose,
    onZoomIn,
    onZoomOut,
    isZoomedIn
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
          if (onExtraClose) onExtraClose();
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
                        actionsheetref.current?.snapToIndex(1)
                      }
                    }}
                    onSetSteps={(steps) => {
                      console.log("Steps set: ", steps);
                    }}
                    destinationBuilding={selectedBuilding}
                    bothSelected={twoBuildingsSelected}
                />
                ) : (startedSelectedRoute===false? (
                <StartNavigation
                    mode={selectedMode}
                    routes={routeEstimates[selectedMode] || []}
                    onSelectRoute={setSelectedRoute}
                    onBack={() => {
                      setSelectedMode(null);
                      actionsheetref.current?.snapToIndex(2);
                    }}
                    destinationBuilding={selectedBuilding}
                    starting={()=> {
                      closeChooseDest(false)
                      setStartedSelectedRoute(true);
                      actionsheetref.current?.snapToIndex(0);
                    }}
                    defPoly={() => setPoly(routeEstimates[selectedMode][0].polyline)}
                    onZoomIn={onZoomIn}
                    origin={origin}
                />
                ) : (
                  <LiveInformation
                    onStop={()=>{
                      actionsheetref.current?.hide();
                      setPoly("");
                      setStartedSelectedRoute(false);
                    }}
                    routes={routeEstimates[selectedMode] || []}
                    onZoomOut={onZoomOut}
                    isZoomedIn={isZoomedIn}
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