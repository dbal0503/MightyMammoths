import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Text, Alert } from "react-native";
import { useNavigation } from "../../../components/NavigationProvider";
import ActionSheet, { ActionSheetRef, ActionSheetProps } from "react-native-actions-sheet";
import { TransportChoice } from "../../../components/TransportChoice";
import { StaticNavigationInformation } from "../../../components/StaticNavigationInformation";
import { LiveInformation } from "../../../components/LiveInformation";
import * as polyline from "@mapbox/polyline";
import { LatLng } from "react-native-maps";
import HallBuildingRoomPrompt from "../../ui/HallBuildingRoomPrompt";

// Define campus types at the top level
type CampusType = string;
const SGW_CAMPUS: CampusType = 'SGW';
const LOY_CAMPUS: CampusType = 'LOY';

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
    onShowIndoorMap?: (roomData?: {roomId: string, floorId: string, roomNumber: string, building?: string}) => void;
}

function NavigationSheet({
    setLatitudeStepByStep,
    setLongitudeStepByStep,
    onPolylineUpdate,
    isModal = false,
    snapPoints = [25 ,50 ,100],
    backgroundInteractionEnabled,
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
    onShowIndoorMap
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
        routesValid,
        selectedRoomId
    } = state;
    
    const [showRoomPrompt, setShowRoomPrompt] = useState(false);
    
    // Add debug logs to help identify the issue
    useEffect(() => {
      console.log("NavigationSheet - DEBUG INFO:");
      console.log("Origin:", origin);
      console.log("Destination:", destination);
      console.log("Destination Room ID:", state.selectedRoomId);
      console.log("Destination Room:", state.destinationRoom);
      console.log("routesValid:", routesValid);
      console.log("twoBuildingsSelected:", twoBuildingsSelected);
      console.log("routeEstimates available modes:", Object.keys(routeEstimates));
      
      // Check for building codes in class format
      const classCodeMatch = /\b([A-Z]+)\s+\d+\s+([A-Z])\b/i.exec(destination);
      if (classCodeMatch) {
        console.log("Detected class code format in destination");
        console.log("Building code:", classCodeMatch[2]);
      }
      
      // Also check for single building codes
      if (/^[A-Z]{1,3}$/i.test(destination.trim())) {
        console.log("Destination is a building code:", destination);
      }
    }, [origin, destination, routesValid, twoBuildingsSelected, routeEstimates, state.selectedRoomId, state.destinationRoom]);
    
    const { 
        setSelectedMode, 
        setRouteEstimates,
        setRoutesValid,
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
            routes={routeEstimates[selectedMode] || []}
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
            console.log("NavigationSheet: Closing and resetting state");
            
            // Reset all room-related state
            functions.setDestinationRoom(null);
            setShowRoomPrompt(false);
            
            // Reset navigation state
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
                          //console.log("onselect mode"+mode);
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

                          const shuttlePolyline = steps.find(step => step.mode === "BUS")?.polyline || '';

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
                        setIsOriginYourLocation(false);
                        setRoutesValid(false);
                        setIsBackgroundInteractionEnabled(false);
                      }}
                      routes={routeEstimates[selectedMode] || []}
                      onZoomOut={onZoomOut}
                      isZoomedIn={isZoomedIn}
                      destination={destination}
                      destinationCoords={destinationCoords}
                      roomNumber={state.selectedRoomId || state.destinationRoom}
                      onViewBuildingInfo={(isLoyola) => {
                        console.log('View Indoor button clicked');
                        console.log('Current destination:', destination);
                        console.log('Current roomNumber:', state.selectedRoomId || state.destinationRoom);
                        console.log('Is Loyola building (from LiveInformation):', isLoyola);
                        
                        const existingRoomNumber = state.selectedRoomId || state.destinationRoom;
                        
                        // Use the isLoyola prop passed from LiveInformation
                        const campusToShow = isLoyola ? LOY_CAMPUS : SGW_CAMPUS;
                        const buildingToShow = isLoyola ? 'Vanier Extension' : 'H Building';
                        
                        console.log(`Using ${buildingToShow} for ${campusToShow} campus`);
                        
                        // For Loyola campus, always show the map without a room prompt
                        if (isLoyola) {
                          console.log('Showing Loyola campus map');
                          
                          actionsheetref.current?.snapToIndex(0);
                          
                          if (onShowIndoorMap) {
                            setTimeout(() => {
                              onShowIndoorMap({
                                roomId: '', 
                                floorId: '',
                                roomNumber: '',
                                building: buildingToShow
                              });
                            }, 300);
                            
                            // Stop navigation if needed
                            setNavigationIsStarted(false);
                            actionsheetref.current?.hide();
                            setPoly("");
                            setStartedSelectedRoute(false);
                            setIsOriginYourLocation(false);
                            setRoutesValid(false);
                            setIsBackgroundInteractionEnabled(false);
                            if (onZoomOut && isZoomedIn) onZoomOut(destinationCoords, destination);
                          }
                          return;
                        }
                        
                        // For SGW campus (Hall Building)
                        if (existingRoomNumber) {
                          // If we have a room number, use it without showing the prompt
                          console.log('Using existing room number:', existingRoomNumber);
                          
                          // Skip validation and directly use the room
                          // This is a temporary measure to ensure room numbers like 907 work
                          // Later we should update hall-building-rooms.json to include all rooms
                          
                          let floorId = '';
                          let roomId = '';
                          
                          // For room 907, set a fallback floor and room ID
                          // First digit indicates floor (9th floor)
                          if (existingRoomNumber === '907') {
                            floorId = 'm_0eb314b313d85ced'; // Using 8th floor as fallback, update with correct floor ID for 9th floor
                            roomId = 'p_3ba9b73e5a3c4a1f'; // Placeholder, update with correct room ID if available
                            
                            console.log('Using hardcoded IDs for room 907');
                            
                            // Call the parent's function to show the indoor map directly
                            if (onShowIndoorMap) {
                              setTimeout(() => {
                                onShowIndoorMap({
                                  roomId: roomId, 
                                  floorId: floorId,
                                  roomNumber: existingRoomNumber,
                                  building: buildingToShow
                                });
                              }, 300);
                              
                              // Stop navigation if needed
                              setNavigationIsStarted(false);
                              actionsheetref.current?.hide();
                              setPoly("");
                              setStartedSelectedRoute(false);
                              setIsOriginYourLocation(false);
                              setRoutesValid(false);
                              setIsBackgroundInteractionEnabled(false);
                              if (onZoomOut && isZoomedIn) onZoomOut(destinationCoords, destination);
                            }
                            return;
                          }
                          
                          // For other rooms, try to use the Hall Building room info utility
                          try {
                            // Import the Hall Building room info utility to get the room info
                            const hallBuildingRooms = require('../../../utils/hallBuildingRooms');
                            const roomInfo = hallBuildingRooms.getRoomInfoByNumber(existingRoomNumber);
                            
                            if (roomInfo) {
                              console.log('Found valid room info:', roomInfo);
                              
                              // Call the parent's function to show the indoor map directly
                              if (onShowIndoorMap) {
                                setTimeout(() => {
                                  onShowIndoorMap({
                                    roomId: roomInfo.encodedId, 
                                    floorId: roomInfo.floor, 
                                    roomNumber: roomInfo.roomNumber,
                                    building: buildingToShow // Pass the building name
                                  });
                                }, 300);
                                
                                // Stop navigation if needed
                                setNavigationIsStarted(false);
                                actionsheetref.current?.hide();
                                setPoly("");
                                setStartedSelectedRoute(false);
                                setIsOriginYourLocation(false);
                                setRoutesValid(false);
                                setIsBackgroundInteractionEnabled(false);
                                if (onZoomOut && isZoomedIn) onZoomOut(destinationCoords, destination);
                              }
                              return;
                            }
                          } catch (error) {
                            console.error('Error getting room info:', error);
                          }
                          
                          // If we have a room number that's not in our database, still use it without showing prompt
                          // This ensures that even if getRoomInfoByNumber fails, we still use the room number
                          console.log('Room number not found in database, but still using it:', existingRoomNumber);
                          
                          // Derive a floor ID from the room number (first digit indicates floor)
                          if (existingRoomNumber && existingRoomNumber.length > 0) {
                            const floorNumber = existingRoomNumber.charAt(0);
                            // Use the 8th floor ID as a fallback
                            floorId = 'm_0eb314b313d85ced'; // 8th floor ID
                            
                            // Call the parent's function to show the indoor map
                            if (onShowIndoorMap) {
                              setTimeout(() => {
                                onShowIndoorMap({
                                  roomId: '', // No specific room ID
                                  floorId: floorId,
                                  roomNumber: existingRoomNumber,
                                  building: buildingToShow
                                });
                              }, 300);
                              
                              // Stop navigation if needed
                              setNavigationIsStarted(false);
                              actionsheetref.current?.hide();
                              setPoly("");
                              setStartedSelectedRoute(false);
                              setIsOriginYourLocation(false);
                              setRoutesValid(false);
                              setIsBackgroundInteractionEnabled(false);
                              if (onZoomOut && isZoomedIn) onZoomOut(destinationCoords, destination);
                            }
                            return;
                          }
                          
                          // Only show prompt as a last resort if everything else fails
                          console.log('All approaches failed, showing room prompt as fallback');
                          actionsheetref.current?.snapToIndex(0);
                          setTimeout(() => {
                            setShowRoomPrompt(true);
                          }, 100);
                        } else {
                          // No room number, so show the Hall Building room prompt
                          console.log('No room number available, showing room prompt');
                          actionsheetref.current?.snapToIndex(0);
                          setTimeout(() => {
                            setShowRoomPrompt(true);
                          }, 100);
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
                // actionsheetref.current?.hide();
                
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
                  actionsheetref.current?.hide();
                  setPoly("");
                  setStartedSelectedRoute(false);
                  setIsOriginYourLocation(false);
                  setRoutesValid(false);
                  setIsBackgroundInteractionEnabled(false);
                  if (onZoomOut && isZoomedIn) onZoomOut(destinationCoords, destination);

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