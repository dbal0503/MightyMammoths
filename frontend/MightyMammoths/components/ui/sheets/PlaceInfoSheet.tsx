import { View, Text, StyleSheet, Pressable } from 'react-native';
import ActionSheet, { ActionSheetProps, ActionSheetRef} from 'react-native-actions-sheet';
import { placeDetails } from '@/services/searchService';

export type PlaceInfoSheetProps = ActionSheetProps & {
    actionsheetref: React.MutableRefObject<ActionSheetRef | null>;
    mainsheet: React.MutableRefObject<ActionSheetRef | null>;
    placeDetails?: placeDetails;
    navigate: () => void;
}

function PlaceInfoSheet({
    isModal = false,
    snapPoints = [40],
    backgroundInteractionEnabled = false,
    closable = true,
    gestureEnabled = false,
    initialSnapIndex = 0,
    overdrawEnabled = false,
    overdrawSize = 200,
    actionsheetref,
    placeDetails,
    navigate,
    mainsheet
}: PlaceInfoSheetProps) {

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
        onClose={()=>mainsheet.current?.show()}
        >
      <View style={styles.container}>
    <Text style={styles.header}>{placeDetails?.shortFormattedAddress || ""}</Text>
    <View style={styles.buttonsContainer}>
            <View style={[
                styles.button, styles.destinationButton
                ]}>
            <Pressable onPress={navigate}>
                <Text style={styles.buttonText}>Set As Destination</Text>
                </Pressable>
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
    paddingBlock: 8
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
  backgroundColor: '#007AFF', 
  fontWeight: 'bold',
  fontSize: 20
  
},
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  }
});

export default PlaceInfoSheet;