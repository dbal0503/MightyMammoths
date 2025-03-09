import { View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import { ActionSheetProps, ActionSheetRef } from 'react-native-actions-sheet';
import { TransportChoice } from "@/components/RoutesSheet";
import { StartNavigation } from "@/components/RouteStart";
import { useNavigation } from "@/components/NavigationProvider"
import { LiveInformation } from '@/components/LiveInformation';
import polyline from "@mapbox/polyline"
import { LatLng } from 'react-native-maps';
import { StaticNavigationInformation } from '@/components/StaticNavigationInformation';

export type NavigationSheetProps = ActionSheetProps & {
    actionsheetref: React.MutableRefObject<ActionSheetRef | null>;
    closeChooseDest: React.Dispatch<React.SetStateAction<boolean>>;
    setNavigationMode: React.Dispatch<React.SetStateAction<boolean>>;
    setLatitudeStepByStep: React.Dispatch<React.SetStateAction<number>>;
    setLongitudeStepByStep:  React.Dispatch<React.SetStateAction<number>>;
    onPolylineUpdate: (poly:LatLng[])=>void;
    onExtraClose?: () => void;
    onZoomIn: (originCoordsPlaceID: string, originPlaceName: string) => void;
    onZoomOut: (destinationCoordsPlaceID: string, destinationPlaceName: string) => void;
    isZoomedIn: boolean;
    userLocation: {latitude: number, longitude: number};
}

function NavigationSheet({
    setLatitudeStepByStep,
    setLongitudeStepByStep,
    onPolylineUpdate,
    isModal = false,
    snapPoints = [25 ,50 ,100],
    backgroundInteractionEnabled = true,
    closable = false,
    gestureEnabled = false,
    initialSnapIndex = 1,
    overdrawEnabled = false,
    overdrawSize = 200,
    actionsheetref,
    closeChooseDest,
    setNavigationMode,
    onExtraClose,
    onZoomIn,
    onZoomOut,
    isZoomedIn,
    userLocation
}: NavigationSheetProps) {
    const [navigationIsStarted, setNavigationIsStarted] = useState(false);
    const { state, functions } = useNavigation();
    const { 
        routeEstimates, 
        selectedMode, 
        selectedBuilding, 
        twoBuildingsSelected,
        origin,
        destination,
        originCoords,
        destinationCoords,
        routesValid
    } = state;
    
    const { 
        setSelectedMode, 
        setSelectedRoute,
        setRouteEstimates,
        setRoutesValid,
    } = functions;

    const [startedSelectedRoute,setStartedSelectedRoute] = useState(false);
    const [isOriginYourLocation, setIsOriginYourLocation] = useState(false);
    const [shuttlePolyline, setShuttlePolyline] = useState('');
    const [walk1Polyline, setWalk1Polyline] = useState('');
    const [walk2Polyline, setWalk2Polyline] = useState('');


    const setPoly = (poly: string) => {
      const decodedPoly: LatLng[] = polyline.decode(poly).map(([latitude, longitude]) => ({
        latitude,
        longitude,
      }));
      onPolylineUpdate(decodedPoly);
    }

    useEffect(() => {
      if (origin){
        setIsOriginYourLocation(origin === "Your Location");
      }
    }, [origin]);
  

    return (
      <>
        {navigationIsStarted && selectedMode &&(
          <StaticNavigationInformation                       
            routes={routeEstimates[selectedMode] || []}
            setLatitudeStepByStep = {setLatitudeStepByStep}
            setLongitudeStepByStep = {setLongitudeStepByStep}
            userLocation = {userLocation}
            isOriginYL = {isOriginYourLocation}
          />
        )}   
    
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
            setNavigationMode(false);
            closeChooseDest(false);
            setSelectedMode(null);
            setRouteEstimates({});
            if (onExtraClose) onExtraClose();
          }}
          >
            <View style={styles.centeredView}>
                  {selectedMode === null || startedSelectedRoute===false? (
                  <TransportChoice
                      onBack={()=>{
                        actionsheetref.current?.hide();
                        setRoutesValid(false);
                        
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
                        console.log(selectedMode)
                        if (selectedMode === "shuttle") {
                          const walkingBeforeShuttle = steps
                            .filter(step => step.mode === "WALKING" && step.polyline)
                            .map(step => step.polyline)
                            .join('');
                      
                          const shuttlePolyline = steps.find(step => step.mode === "BUS")?.polyline || '';
                      
                          const walkingAfterShuttle = steps
                            .filter(step => step.mode === "WALKING" && step.polyline)
                            .slice(-1)
                            .map(step => step.polyline)
                            .join('');
                          
                          setWalk1Polyline(walkingBeforeShuttle)
                          setShuttlePolyline(shuttlePolyline);
                          setWalk2Polyline(walkingAfterShuttle)
                        }
                      }}
                      destinationBuilding={selectedBuilding}
                      bothSelected={twoBuildingsSelected}
                      routesValid={routesValid}
                      showStepByStep ={setNavigationIsStarted}
                      routes={selectedMode && routeEstimates[selectedMode] ? routeEstimates[selectedMode] : []}
                      starting={()=> {
                        closeChooseDest(false)
                        setStartedSelectedRoute(true);
                        actionsheetref.current?.snapToIndex(0);
                      }}
                      defPoly={() => {
                        if (selectedMode && routeEstimates[selectedMode]?.length > 0 && selectedMode!=='shuttle') {
                          setPoly(routeEstimates[selectedMode][0].polyline);
                        } else if(selectedMode==="shuttle" && routeEstimates[selectedMode]?.length > 0){
                          setPoly(walk1Polyline);
                          setPoly(shuttlePolyline);
                          setPoly(walk2Polyline);
                        }
                      }}
                      onZoomIn={onZoomIn}
                      origin={origin}
                      originCoords={originCoords}
                  />
                  ) : (
                    <LiveInformation
                      onStop={()=>{
                        setNavigationIsStarted(false);
                        actionsheetref.current?.hide();
                        setPoly("");
                        setStartedSelectedRoute(false);
                        setIsOriginYourLocation(false);
                        setRoutesValid(false);
                      }}
                      routes={routeEstimates[selectedMode] || []}
                      onZoomOut={onZoomOut}
                      isZoomedIn={isZoomedIn}
                      destination={destination}
                      destinationCoords={destinationCoords}
                    /> 
                  )
                }
            </View>
        </ActionSheet>
      </>
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