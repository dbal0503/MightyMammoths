import { View, Text, StyleSheet, Pressable } from 'react-native';
import ActionSheet, { ActionSheetRef, ActionSheetProps} from 'react-native-actions-sheet';
import { GeoJsonFeature } from '../BuildingMapping';


export type BuildingInfoSheetProps = ActionSheetProps & {
  actionsheetref: React.MutableRefObject<ActionSheetRef | null>;
  building: GeoJsonFeature;
  navigate: (destination: string) => void;
    navigateIndoor: () => void;
  onClose: () => void; 
}


function BuildingInfoSheet({
    isModal = false,
    snapPoints = [80],
    backgroundInteractionEnabled = false,
    closable = true,
    gestureEnabled = true,
    initialSnapIndex = 0,
    overdrawEnabled = false,
    overdrawSize = 200,
    actionsheetref,
    building,
    navigate,
    navigateIndoor,
    onClose,
}: BuildingInfoSheetProps) {
    return (
      <ActionSheet
        ref={actionsheetref}
        isModal={isModal} 
        snapPoints={snapPoints} 
        backgroundInteractionEnabled={backgroundInteractionEnabled}
        closable={closable}
        gestureEnabled={gestureEnabled}
        initialSnapIndex={initialSnapIndex}
        overdrawEnabled={overdrawEnabled}
        overdrawSize={overdrawSize}
        containerStyle={styles.root}
        onClose={onClose}
        >
      <View style={styles.container}>
    <Text style={styles.header1} testID='buildingLongName'>{building?.properties['Building Long Name']}</Text>
    <View style={styles.buttonsContainer}>
            <View style={[
                styles.button, styles.destinationButton
                ]}>
            <Pressable onPress={navigate} testID='setDestinationButton'>
                <Text style={styles.buttonText}>Set As Destination</Text>
            </Pressable>
            </View>

            <View style={
                [styles.button, styles.indoorMapButton]
                }>
            <Pressable onPress={navigateIndoor} testID='indoorMapButton'>
                <Text style={styles.buttonText}>View Indoor Map</Text>
                </Pressable>
            </View>  
    </View>
    
    <Text style={styles.header2}>Information</Text>
    <View style={styles.buttonsContainer}>
        <View style={[styles.button, {flexDirection:'row', alignItems:'center', justifyContent:"center"}]}>
            <Text style={styles.buttonText} testID='buildingInformation'>{building.properties.BuildingName} @</Text>
            <Text style={styles.buttonText} testID='buildingCampus'>{building.properties.Campus}</Text>
        </View>
    </View>

    <View style={styles.buttonsContainer}>
        <View style={styles.button}>
            <Text style={styles.buttonText} testID='buildingAddress'>{building.properties.Address}</Text>
        </View>
    </View>
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
  container: {
    backgroundColor: '#0f0f17',
    padding: 20,
    borderRadius: 15,
    maxWidth: 400,
  },
  button: {
    backgroundColor: '#1c1c1e',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
},
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom:0,
    paddingBottom:2,
  },
  indoorMapButton: {
    backgroundColor: '#800000', 
    fontWeight: 'bold',
    fontSize: 20
},
buttonText: {
  color: 'white',
  fontSize: 16,
},
destinationButton: {
  backgroundColor: '#4b54ad', 
  fontWeight: 'bold',
  fontSize: 10
},
  header1: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  header2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop:20,
  }
});

export default BuildingInfoSheet;