import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,

} from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { Task } from './types';
import DateTimePicker, { DateTimePickerEvent, DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import AutoCompleteDropdown, { BuildingData, AutoCompleteDropdownRef } from './input/AutoCompleteDropdown';
import * as Location from "expo-location";
import { buildingList } from '@/utils/getBuildingList';
import { SuggestionResult } from '@/services/searchService';


type PlanBuilderModalProps = {
  visible: boolean;
  onClose: () => void;
  initialPlanName: string; 
  initialTasks: Task[];      
  initialIsStartLocationSet: boolean; 
  onSavePlan: (name: string, updatedTasks: Task[], startLocationSet: boolean) => void; 
  openTaskView: (currentTempTasks: Task[]) => void; 
  nextEvent?: {
    name: string;
    description: string;
    location: string;
    time: string;
  } | null;
  init: boolean;
};
export default function PlanBuilderModal({
  visible,
  onClose,
  initialPlanName,
  initialTasks,
  initialIsStartLocationSet,
  onSavePlan,
  nextEvent,
  openTaskView,
  init,
}: PlanBuilderModalProps) {
  const [tempPlanName, setTempPlanName] = useState('');
  const [tempTasks, setTempTasks] = useState<Task[]>([]);
  const [tempIsStartLocationSet, setTempIsStartLocationSet] = useState(false);
  const [tempIsStartLocationButton, setTempIsStartLocationButton] = useState(false); 

  const [tempTaskName, setTempTaskName] = React.useState('');
  const [tempTaskLocation, setTempTaskLocation] = React.useState('');
  const [tempTaskLocationPlaceId, setTempTaskLocationPlaceId] = React.useState('');
  const [tempTaskTime, setTempTaskTime] = React.useState('');
  const [date, setDate] = React.useState(new Date());
  const [searchSuggestions, setSearchSuggestions] = React.useState<SuggestionResult[]>([]);

  const locationDropdownRef = useRef<AutoCompleteDropdownRef>(null);


  useEffect(() => {
    if (init) {
      setTempPlanName(initialPlanName); 
      setTempTasks([...initialTasks]);
      setTempIsStartLocationSet(initialIsStartLocationSet);
    }
  }, [init]);

  const handleBackArrow = () => {
    setTempPlanName('');
    setTempTasks([]);
    setTempIsStartLocationSet(false);
    onClose();
  };

  const addTask = () => {
    if (tempTaskName.trim()) {
      const newTask: Task = {
        id: Date.now(),
        name: tempTaskName,
        location: tempTaskLocation,
        locationPlaceID: tempTaskLocationPlaceId,
        time: tempTaskTime,
        type: 'task',
      };
      setTempTasks([...tempTasks, newTask]);
      setTempTaskName('');
      setTempTaskLocation('');
      setTempTaskLocationPlaceId('');
      setTempTaskTime('');
      locationDropdownRef.current?.reset();
    }
  };

  const addOriginLocation = () => {
    if (tempTaskLocation.trim()) {
      const newOriginLocation: Task = {
        id: Date.now(),
        name: "Start Location",
        location: tempTaskLocation,
        locationPlaceID: tempTaskLocationPlaceId,
        time: '',
        type: 'location',
      };
      setTempIsStartLocationSet(true);
      setTempTasks([...tempTasks, newOriginLocation]);
      setTempTaskName('');
      setTempTaskLocation('');
      setTempTaskLocationPlaceId('');
      setTempTaskTime('');
      setTempIsStartLocationButton(false);
      locationDropdownRef.current?.reset();
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {

    const currentDate = selectedDate || date;

    setDate(currentDate);

    // Format the time to display
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;

    setTempTaskTime(formattedTime);
  };

  useEffect(() => {
    const buildingResults: SuggestionResult[] = buildingListPlusMore.map(
      (building) => ({
        discriminator: "building",
        placePrediction: {
          place: building.buildingName,
          placeId: building.placeID,
          text: {
            text: building.buildingName,
            matches: [
              { startOffset: 0, endOffset: building.buildingName.length },
            ],
          },
          structuredFormat: {
            mainText: {
              text: building.buildingName,
              matches: [
                { startOffset: 0, endOffset: building.buildingName.length },
              ],
            },
            secondaryText: {
              text: "",
            },
          },
          types: ["building"],
        },
      })
    );
    setSearchSuggestions(buildingResults);
    }, []);

  const isAddTaskDisabled =
  !tempTaskName.trim() || !tempTaskLocation.trim();

  const buildingListPlusMore: BuildingData[] = [
    { buildingName: "Any SGW campus building", placeID: "" },
    { buildingName: "Any LOY campus building", placeID: "" },
    { buildingName: "Any campus building", placeID: "" },
    { buildingName: "Any location", placeID: "" },
    ...buildingList,
  ];

  const isOriginLocationDisabled = !tempTaskLocation.trim();

  const isSaveDisabled = !tempPlanName.trim() || tempTasks.filter(task => task.type !== 'location').length < 1 || !tempIsStartLocationSet;

  const _openAppSetting = useCallback(async () => {
      await Linking.openSettings();
    }, []);

  const handleSearch = async (placeName: string) => {
      console.log("Placename: ", placeName);
      if (placeName === "Your Location") {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Location Services Disabled",
            "Please enable location services to use this feature.",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => locationDropdownRef.current?.reset(),
              },
              {
                text: "Enable",
                onPress: () => {
                  _openAppSetting();
                  locationDropdownRef.current?.reset();
                },
              },
            ]
          );
          return;
        } else {
          setTempTaskLocation(placeName);
          const loc = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Low});
          let locString = `${loc.coords.latitude},${loc.coords.longitude}`
          setTempTaskLocationPlaceId(locString);
          return;
        }
      }
      try {
        const data = searchSuggestions.find(
          (place) =>
            place.placePrediction.structuredFormat.mainText.text === placeName
        );
        if (data === undefined) {
          console.log("Index.tsx: selected place is undefined");
           setTempTaskLocation('');
           setTempTaskLocationPlaceId('');
          return;
        }
        setTempTaskLocation(data.placePrediction.structuredFormat.mainText.text);
        setTempTaskLocationPlaceId(data.placePrediction.placeId);
      } catch (error) {
        console.log(`Index.tsx: Error selecting place: ${error}`);
         setTempTaskLocation('');
         setTempTaskLocationPlaceId('');
      }
    };

    const handleAddNextClass = () => {
      if (!nextEvent) {
        Alert.alert("No next event found in your Google Calendar.");
        return;
      }

      // Check if the exact same event is already in the temp tasks array
      const alreadyExists = tempTasks.some(
        (task) =>
          task.name === nextEvent.name &&
          task.location === nextEvent.location &&
          task.time === nextEvent.time
      );

      if (alreadyExists) {
        Alert.alert("This class is already in your plan.");
        return;
      }

      const newTask: Task = {
        id: Date.now(),
        name: nextEvent.name,
        location: nextEvent.location,
        locationPlaceID: "",
        time: nextEvent.time,
        type: "task",
      };
      setTempTasks([...tempTasks, newTask]);
    };



  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity onPress={handleBackArrow} style={styles.backIcon}>
            <IconSymbol name={'arrow-back' as IconSymbolName} size={32} color="white" testID='back-button-editor-modal'/>
          </TouchableOpacity>

          <Text style={styles.title}>Smart Planner</Text>
          <View style={styles.underlineBox} />
          <TextInput
            style={styles.planNameInput}
            placeholder="New Plan 1"
            placeholderTextColor="#b2b3b8"
            value={tempPlanName}
            onChangeText={setTempPlanName}
            testID='plan-name-input'
          />
          <View style={styles.underlineBox} />

           {tempIsStartLocationButton === false ? (
            <>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                 style={{...styles.actionButton, backgroundColor: tempIsStartLocationSet ? '#2c2c38' : '#122F92'}}
                 onPress={() => setTempIsStartLocationButton(true)}
                 disabled={tempIsStartLocationSet}
                 testID='set-start-location-button'>
                <Text style={{ color: 'white', fontSize: 15 }}>Set Start Location</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleAddNextClass} testID='add-next-class-button-location-view'>
                <Text style={{ color: 'white', fontSize: 15}}>Add Next Class</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.underlineBox} />
              <View style={styles.taskHeaderRow}>
                <Text style={styles.addTaskTitle}>Add Task</Text>
                <TouchableOpacity style={styles.viewTasksButton} onPress={() => openTaskView(tempTasks)} testID='view-current-tasks-button-location-view'>
                  <Text style={{ color: 'white', fontSize: 15 }}>View Current Tasks</Text>
                </TouchableOpacity>
              </View>

            <View style={styles.addTaskContainer}>
              <Text style={styles.addTaskHeader}>Task Name</Text>
              <TextInput
                style={styles.taskInput}
                placeholder="Enter task name..."
                placeholderTextColor="#b2b3b8"
                value={tempTaskName}
                onChangeText={setTempTaskName}
                testID='task-name-input'
              />
              <Text style={styles.addTaskHeader}>Location</Text>
              <View style={{ alignSelf: 'flex-start', marginLeft: -4 , marginBottom: 12, marginTop: 4}}>
                <AutoCompleteDropdown
                  ref={locationDropdownRef}
                  testID="locationSmartPlannerDropdown-start"
                  locked={false}
                  searchSuggestions={searchSuggestions}
                  setSearchSuggestions={setSearchSuggestions}
                  buildingData={buildingListPlusMore}
                  onSelect={(selected) => handleSearch(selected)}
                  darkTheme={true}
                  currentVal={tempTaskLocation}
                />
              </View>
              <Text style={styles.addTaskHeader}>Time (Optional - Omit for any time)</Text>
              {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={date}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={onTimeChange}
                    themeVariant="dark"
                    testID='time-picker'
                  />
                ) : (
                <TouchableOpacity
                  onPress={() => {
                    DateTimePickerAndroid.open({
                      value: date,
                      mode: 'time',
                      is24Hour: false,
                      display: 'default',
                      onChange: onTimeChange,
                    });
                  }}
                  style={styles.taskInput}
                  testID='time-picker'
                >
                  <Text style={{ color: 'white', fontSize: 17 }}>
                    {tempTaskTime || 'Select Time'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.addTaskButton, isAddTaskDisabled && styles.disabledButton]}
                onPress={addTask}
                disabled={isAddTaskDisabled}
                testID='save-add-task-button'
              >
                <Text style={{ color: 'white', fontSize: 17 }}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </>
          ) : (
            <>
            <View style={styles.buttonRow}>
               <TouchableOpacity style={styles.actionButton} onPress={() => setTempIsStartLocationButton(false)} testID='add-task-mode-button'>
                <Text style={{ color: 'white', fontSize: 15 }}>Add Task</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleAddNextClass} testID='add-next-class-button-location-view'>
                <Text style={{ color: 'white', fontSize: 15}}>Add Next Class</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.underlineBox} />
            <View style={styles.taskHeaderRow}>
              <Text style={styles.addTaskTitle}>Start Location</Text>
              <TouchableOpacity style={styles.viewTasksButton} onPress={() => openTaskView(tempTasks)} testID='view-current-tasks-button'>
                <Text style={{ color: 'white', fontSize: 15 }}>View Current Tasks</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.addTaskContainer}>
              <Text style={styles.addTaskHeader}>Location</Text>
              <View style={{ alignSelf: 'flex-start', marginLeft: -4 , marginBottom: 12, marginTop: 4}}>
                <AutoCompleteDropdown
                  ref={locationDropdownRef}
                  testID="locationSmartPlannerDropdown-start"
                  locked={false}
                  searchSuggestions={searchSuggestions}
                  setSearchSuggestions={setSearchSuggestions}
                  buildingData={buildingListPlusMore}
                  onSelect={(selected) => handleSearch(selected)}
                  darkTheme={true}
                  currentVal={tempTaskLocation}
                />
              </View>

              <TouchableOpacity
                style={[styles.addTaskButton, isOriginLocationDisabled && styles.disabledButton]}
                onPress={addOriginLocation}
                disabled={isOriginLocationDisabled}
                testID='add-start-location-button'
              >
                <Text style={{ color: 'white', fontSize: 17 }}>Add Start Location</Text>
              </TouchableOpacity>
            </View>
            </>)}


          <TouchableOpacity
              style={[styles.saveButton, isSaveDisabled && styles.disabledButton]}
              onPress={() => onSavePlan(tempPlanName, tempTasks, tempIsStartLocationSet)}
              disabled={isSaveDisabled}
              testID='save-plan-button'
            >
            <Text style={{ color: 'white' , fontSize: 17}}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(1,2,19,0.8)',
    justifyContent: 'center',
  },
  container: {
    margin: 15,
    maxHeight: '90%',
    backgroundColor: '#010213',
    borderRadius: 10,
    padding: 16,
  },
  backIcon: {
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    color: 'white',
    marginBottom: 8,
    alignSelf: 'center',
    marginTop: 5,
  },
  disabledButton: {
    backgroundColor: '#555',
    opacity: 0.7,
  },
  addTaskTitle: {
    fontSize: 20,
    color: 'white',
    alignSelf: 'flex-start',
  },
  addTaskHeader: {
    fontSize: 17,
    color: 'white',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  taskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewTasksButton: {
    backgroundColor: '#2c2c38',
    borderRadius: 8,
    padding: 8,
    paddingHorizontal: 12,
  },
  planNameInput: {
    backgroundColor: '#2c2c38',
    borderRadius: 8,
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 17,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#122F92',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  addTaskContainer: {
    marginBottom: 16,
  },
  taskInput: {
    backgroundColor: '#2c2c38',
    borderRadius: 8,
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginVertical: 4,
    fontSize: 17,
    marginBottom: 12,
    justifyContent: 'center',
  },
  addTaskButton: {
    backgroundColor: '#122F92',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#A30000',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  underlineBox: {
    height: 1,
    backgroundColor: '#808080',
    width: '100%',
    alignSelf: 'center',
    marginBottom: 16,
  },
});