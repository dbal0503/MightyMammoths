import { View, StyleSheet, Pressable} from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import { ActionSheetProps } from 'react-native-actions-sheet';
import {ActionSheetRef} from "react-native-actions-sheet";
import { GeoJsonFeature } from '../BuildingMapping';


export type IndoorMapSheetProps = ActionSheetProps & {
    actionsheetref: React.MutableRefObject<ActionSheetRef | null>;
    building: GeoJsonFeature;
    onClose: () => void; 
}

function IndoorMapSheet({
    isModal = true,
    snapPoints = [100],
    backgroundInteractionEnabled = false,
    closable = false,
    initialSnapIndex = 0,
    overdrawEnabled = false,
    overdrawSize = 900,
    actionsheetref,
    onClose,
}: IndoorMapSheetProps) {

    return (
      <ActionSheet
        ref={actionsheetref}
        isModal={isModal} 
        snapPoints={snapPoints} 
        backgroundInteractionEnabled={backgroundInteractionEnabled}
        closable={closable}
        initialSnapIndex={initialSnapIndex}
        overdrawEnabled={overdrawEnabled}
        overdrawSize={overdrawSize}
        containerStyle={styles.root}
        onClose={onClose}
        >
        <View style={styles.sheet}>
            <Pressable style = {styles.closeButton} onPress={onClose}/>  
            <Pressable style = {styles.dropdown1}/> 
            <Pressable style = {styles.dropdown2}/> 
            <Pressable style = {styles.nextFloorButton}/>
            <Pressable style = {styles.prevFloorButton}/>
        </View>
    </ActionSheet>
    );
  }

const styles = StyleSheet.create({
  root: {
    height: '100%',
    backgroundColor: '#010213',
    borderRadius: 0
  },
  sheet: {
    backgroundColor: '#010213',
    padding: 20,
    borderRadius: 15,
    maxWidth: 400,
    paddingBottom: 575,
  },
  dropdown1: {
    width: '90%',
    marginTop: 70,
    marginVertical: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    fontSize: 16,
    height: 45,
    marginBottom: 25,
    marginLeft: 20
  },
  dropdown2: {
    width: '90%',
    marginTop: 0,
    paddingTop: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    fontSize: 16,
    height: 45,
    marginLeft: 20
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 30,
  },
  nextFloorButton: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    width: 100,
    height: 50,
    backgroundColor: 'blue',
    borderRadius: 30,
  },
  prevFloorButton: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    width: 100,
    height: 50,
    backgroundColor: 'blue',
    borderRadius: 30,
  },
  placeHolder : {
    backgroundColor: 'white',
    height: 600,
    width: 700,
    right: 100,
    marginTop: 70,
  }
});

export default IndoorMapSheet;