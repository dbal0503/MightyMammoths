import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useNavigation } from "../../../components/NavigationProvider";
import ActionSheet, { ActionSheetRef, ActionSheetProps } from "react-native-actions-sheet";
import { TransportChoice } from "../../../components/TransportChoice";
import { StaticNavigationInformation } from "../../../components/StaticNavigationInformation";
import { LiveInformation } from "../../../components/LiveInformation";
import * as polyline from "@mapbox/polyline";
import { LatLng } from "react-native-maps";
import HallBuildingRoomPrompt from "../../ui/HallBuildingRoomPrompt";
import {isValidRoom, findBuildingCampus, getFloorIdbyRoomID, getRoomInfoByNumberString} from "../../../utils/hallBuildingRooms";

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
    onShowIndoorMap?: (roomData?: {roomId: string, floorId: string, roomNumber: string}) => void;
    classBuilding?: string | null;
    classRoom?: string | null;
}

function NavigationSheet({
    setLatitudeStepByStep,
    setLongitudeStepByStep,
    onPolylineUpdate,
    isModal = false,
    snapPoints = [25 ,50 ,100],
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
    userLocation,
    onShowIndoorMap,
    classBuilding,
    classRoom,
}: NavigationSheetProps) {

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
        routesValid,
        selectedRoomId,
        navigationIsStarted
    } = state;
    
    const [showRoomPrompt, setShowRoomPrompt] = useState(false);
    
    const { 
        setSelectedMode, 
        setRouteEstimates,
        setRoutesValid,
        setNavigationIsStarted
    } = functions;

    const [startedSelectedRoute,setStartedSelectedRoute] = useState(false);
    const [isOriginYourLocation, setIsOriginYourLocation] = useState(false);
    const [shuttlePolyline, setShuttlePolyline] = useState('');
    const [walk1Polyline, setWalk1Polyline] = useState('');
    const [walk2Polyline, setWalk2Polyline] = useState('');
    const [isBackgroundInteractionEnabled, setIsBackgroundInteractionEnabled]=useState(false);

    const setPoly = (poly: string) => {
      const decodedPoly: LatLng[] = polyline.decode(poly).map(([latitude, longitude]) => ({
        latitude,
        longitude,
      }));
      onPolylineUpdate(decodedPoly);
    }

    const validateCoordinates = (coords: [number, number][]): [number, number][] => {
      return coords.filter(([lat, lng]) => {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
      });
    };

    const combinePolylines = (walk1: string, shuttle: string, walk2: string) => {
      const walk1Coords = walk1 ? polyline.decode(walk1) : [];
      const shuttleCoords = shuttle ? polyline.decode(shuttle) : [];
      const walk2Coords = walk2 ? polyline.decode(walk2) : [];

      const validWalk1Coords = validateCoordinates(walk1Coords);
      const validShuttleCoords = validateCoordinates(shuttleCoords);
      const validWalk2Coords = validateCoordinates(walk2Coords);

      const combinedCoords = [...validWalk1Coords, ...validShuttleCoords, ...validWalk2Coords];

      const combinedPoly = polyline.encode(combinedCoords);

      return combinedPoly;
    }

    useEffect(() => {
      if (origin){
        setIsOriginYourLocation(origin === "Your Location");
        console.log("isOriginYourLocation: ", isOriginYourLocation); //! Don't remove
      }
    }, [origin]);


    return (
      <>
        {navigationIsStarted && selectedMode &&(
          <StaticNavigationInformation                       
            routes={routeEstimates[selectedMode] ?? []}
            setLatitudeStepByStep = {setLatitudeStepByStep}
            setLongitudeStepByStep = {setLongitudeStepByStep}
            userLocation = {userLocation}
            isOriginYL = {isOriginYourLocation}
            selectedMode={selectedMode}
            walk1Polyline={walk1Polyline}
            walk2Polyline={walk2Polyline}
            shuttlePolyline={shuttlePolyline}
            destination={destination}
          />
        )}   
    
        <ActionSheet
          ref={actionsheetref}
          isModal={isModal} 
          snapPoints={snapPoints} 
          backgroundInteractionEnabled={isBackgroundInteractionEnabled}
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
                      onSelectMode={(mode: string) => {
                        if(origin && destination){
                          setSelectedMode(mode);
                          actionsheetref.current?.snapToIndex(1)
                        }
                      }}
                      onSetSteps={(steps: any) => {
                        console.log("Steps set: ", steps);
                        console.log("steps mode: " + selectedMode)
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
                        setIsBackgroundInteractionEnabled(true);
                      }}
                      defPoly={() => {
                        console.log("defpoly"+selectedMode);
                        if (selectedMode && routeEstimates[selectedMode]?.length > 0 && selectedMode!=='shuttle') {
                          setPoly(routeEstimates[selectedMode][0].polyline);
                        } else if(selectedMode==="shuttle" && routeEstimates[selectedMode]?.length > 0){
                          console.log("mode is shuttle");
                          console.log(routeEstimates[selectedMode][0].steps);
                          let steps = routeEstimates[selectedMode][0].steps;
                          const walkingBeforeShuttle = steps
                            .filter(step => step.mode === "WALKING" && step.polyline)
                            .map(step => step.polyline)
                            .join(''); 

                          const shuttlePolyline = steps.find(step => step.mode === "BUS")?.polyline ?? '';

                          const walkingAfterShuttle = steps
                            .filter(step => step.mode === "WALKING" && step.polyline)
                            .slice(-1)
                            .map(step => step.polyline)
                            .join('');

                          setWalk1Polyline(walkingBeforeShuttle);
                          setShuttlePolyline(shuttlePolyline);
                          setWalk2Polyline(walkingAfterShuttle);
                          const combinedPoly = combinePolylines(walk1Polyline, shuttlePolyline, walk2Polyline);
                          setPoly(combinedPoly);
                        }
                      }}
                      onZoomIn={onZoomIn}
                      origin={origin}
                      originCoords={originCoords}
                      destination={destination}
                  />
                  ) : (
                    <LiveInformation
                      onStop={()=>{
                        setNavigationIsStarted(false);
                        actionsheetref.current?.hide();
                        setPoly("");
                        setStartedSelectedRoute(false);
                        setRoutesValid(false);
                        setIsBackgroundInteractionEnabled(false);
                      }}
                      routes={routeEstimates[selectedMode] || []}
                      onZoomOut={onZoomOut}
                      isZoomedIn={isZoomedIn}
                      destination={destination}
                      destinationCoords={destinationCoords}
                      roomNumber={selectedRoomId}
                      onViewBuildingInfo={() => {
                        console.log('View Indoor button clicked - showing room prompt');
                        // Explicitly hide the sheet to prevent UI conflicts
                        
                        // Then show the room prompt after a small delay
                        if (!classRoom || !isValidRoom(classRoom, findBuildingCampus(classBuilding) )) {
                          setTimeout(() => {
                            setShowRoomPrompt(true);
                          }, 100);
                        } else {
                          setTimeout(() => {
                            // Before we call onShowIndoorMap, we need to ensure the room data is available
                            // The index.tsx file will handle the data through the callback
                            let campus = findBuildingCampus(classBuilding);
                            const roomId = getRoomInfoByNumberString(classRoom, campus);
                            console.log("Room ID: ", roomId);
                            const floorId = getFloorIdbyRoomID(roomId);
                            console.log("Floor ID: ", floorId);
                            onShowIndoorMap?.({
                              roomId, 
                              floorId, 
                              roomNumber: classRoom
                            });
                            
                          }, 300);
                          setNavigationIsStarted(false);
                        }
                      }}
                    /> 
                  )
                }
            </View>
            
            <HallBuildingRoomPrompt
              visible={showRoomPrompt}
              onClose={() => setShowRoomPrompt(false)}
              onSelectRoom={(roomId, floorId, roomNumber) => {
                console.log('Room selected in NavigationSheet:', roomId, floorId, roomNumber);
                
                // First close the prompt
                setShowRoomPrompt(false);
                
                // Hide sheet immediately to prevent UI conflicts

                // Call the parent's callback function to show the indoor map
                if (onShowIndoorMap) {
                  // Use a modified approach that directly handles the data
                  // Pass the data to the parent component through a callback
                  console.log(`Before showing indoor map, passing data: ${roomId}, ${floorId}, ${roomNumber}`);
                  
                  // Call the parent's function to show the indoor map
                  setTimeout(() => {
                    // Before we call onShowIndoorMap, we need to ensure the room data is available
                    // The index.tsx file will handle the data through the callback
                    onShowIndoorMap({
                      roomId, 
                      floorId, 
                      roomNumber
                    });
                  }, 300);
                  
                  //* Uncomment the following lines if you want it so that if the View Indoor is pressed then we stop navigation
                  //* If left commented, when the back arrow for indoor is pressed, the user will return back to the outdoor navigation
                  setNavigationIsStarted(false);

                } else {
                  // Fallback alert if all else fails
                  Alert.alert(
                    "Room Selected",
                    `Room: ${roomNumber}\nID: ${roomId}\nFloor: ${floorId}`,
                    [{ text: "OK" }]
                  );
                }
              }}
            />
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