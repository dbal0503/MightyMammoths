import React, { Dispatch, SetStateAction, useCallback, useEffect } from 'react';
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
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import AutoCompleteDropdown, { BuildingData } from './input/AutoCompleteDropdown';
import * as Location from "expo-location";
import { buildingList } from '@/utils/getBuildingList';
import { suggestionResult } from '@/services/searchService';


type PlanBuilderModalProps = {
  visible: boolean;
  onClose: () => void;
  planName: string;
  setPlanName: Dispatch<SetStateAction<string>>;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  onSavePlan: () => void; // callback from parent
  openTaskView: () => void;
};

export default function PlanBuilderModal({
  visible,
  onClose,
  planName,
  setPlanName,
  tasks,
  setTasks,
  onSavePlan,
  openTaskView,
}: PlanBuilderModalProps) {
  const [tempTaskName, setTempTaskName] = React.useState('');
  const [tempTaskLocation, setTempTaskLocation] = React.useState('');
  const [tempTaskLocationPlaceId, setTempTaskLocationPlaceId] = React.useState('');
  const [tempTaskTime, setTempTaskTime] = React.useState('');
  const [date, setDate] = React.useState(new Date());
  const [isStartLocationButton, setIsStartLocationButton] = React.useState(false);
  const [searchSuggestions, setSearchSuggestions] = React.useState<suggestionResult[]>([]);

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
      setTasks([...tasks, newTask]);
      setTempTaskName('');
      setTempTaskLocation('');
      setTempTaskLocationPlaceId('');
      setTempTaskTime('');
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
      setTasks([...tasks, newOriginLocation]);
      setTempTaskName('');
      setTempTaskLocation('');
      setTempTaskLocationPlaceId('');
      setTempTaskTime('');
      setIsStartLocationButton(false);
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
    const buildingResults: suggestionResult[] = buildingListPlusMore.map(
      (building) => ({
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

  const isSaveDisabled = !planName.trim() || tasks.length < 1;

  const _openAppSetting = useCallback(async () => {
      await Linking.openSettings();
    }, []);

  const handleSearch = async (placeName: string) => {
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
              },
              {
                text: "Enable",
                onPress: () => {
                  _openAppSetting();
                },
              },
            ]
          );
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
          return;
        }
        setTempTaskLocation(data.placePrediction.structuredFormat.mainText.text);
        setTempTaskLocationPlaceId(data.placePrediction.placeId);
      } catch (error) {
        console.log(`Index.tsx: Error selecting place: ${error}`);
      }
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
          <TouchableOpacity onPress={onClose} style={styles.backIcon}>
            <IconSymbol name={'arrow-back' as IconSymbolName} size={32} color="white" />
          </TouchableOpacity>

          <Text style={styles.title}>Smart Planner</Text>
          <View style={styles.underlineBox} />
          <TextInput
            style={styles.planNameInput}
            placeholder="New Plan 1"
            placeholderTextColor="#b2b3b8"
            value={planName}
            onChangeText={setPlanName}
          />
          <View style={styles.underlineBox} />

          {isStartLocationButton === false ? (
            <>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => setIsStartLocationButton(true)}>
                <Text style={{ color: 'white', fontSize: 15 }}>Set Start Location</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={{ color: 'white', fontSize: 15}}>Add Next Class</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.underlineBox} />
              <View style={styles.taskHeaderRow}>
                <Text style={styles.addTaskTitle}>Add Task</Text>
                <TouchableOpacity style={styles.viewTasksButton} onPress={openTaskView}>
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
              />
              <Text style={styles.addTaskHeader}>Location</Text>
              <View style={{ alignSelf: 'flex-start', marginLeft: -4 , marginBottom: 12, marginTop: 4}}>
                <AutoCompleteDropdown
                  testID="locationSmartPlannerDropdown"
                  locked={false}
                  searchSuggestions={searchSuggestions}
                  setSearchSuggestions={setSearchSuggestions}
                  buildingData={buildingListPlusMore}
                  onSelect={(selected) => handleSearch(selected)}
                  darkTheme={true}
                />
              </View>
              <Text style={styles.addTaskHeader}>Time (Optional)</Text>
              {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={date}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={onTimeChange}
                    themeVariant="dark"
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
              >
                <Text style={{ color: 'white', fontSize: 17 }}>Add Task</Text>
              </TouchableOpacity>
            </View> 
          </>
          ) : (
            <>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => setIsStartLocationButton(false)}>
                <Text style={{ color: 'white', fontSize: 15 }}>Add Task</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={{ color: 'white', fontSize: 15}}>Add Next Class</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.underlineBox} />
            <View style={styles.taskHeaderRow}>
              <Text style={styles.addTaskTitle}>Start Location</Text>
              <TouchableOpacity style={styles.viewTasksButton} onPress={openTaskView}>
                <Text style={{ color: 'white', fontSize: 15 }}>View Current Tasks</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.addTaskContainer}>
              <Text style={styles.addTaskHeader}>Location</Text>
              <View style={{ alignSelf: 'flex-start', marginLeft: -4 , marginBottom: 12, marginTop: 4}}>
                <AutoCompleteDropdown
                  testID="locationSmartPlannerDropdown"
                  locked={false}
                  searchSuggestions={searchSuggestions}
                  setSearchSuggestions={setSearchSuggestions}
                  buildingData={buildingListPlusMore}
                  onSelect={(selected) => handleSearch(selected)}
                  darkTheme={true}
                />
              </View>

              <TouchableOpacity
                style={[styles.addTaskButton, isOriginLocationDisabled && styles.disabledButton]}
                onPress={addOriginLocation}
                disabled={isOriginLocationDisabled}
              >
                <Text style={{ color: 'white', fontSize: 17 }}>Add Start Location</Text>
              </TouchableOpacity>
            </View> 
            </>)}
          

          <TouchableOpacity
              style={[styles.saveButton, isSaveDisabled && styles.disabledButton]}
              onPress={onSavePlan}
              disabled={isSaveDisabled}
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
    maxHeight: '80%',
    backgroundColor: '#010213',
    borderRadius: 10,
    padding: 16,
  },
  backIcon: {
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 22,
    color: 'white',
    marginBottom: 8,
    alignSelf: 'center',
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
    backgroundColor: '#2c2c38',
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
    paddingVertical: 8,
    marginVertical: 4,
    fontSize: 17,
    marginBottom: 12,
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