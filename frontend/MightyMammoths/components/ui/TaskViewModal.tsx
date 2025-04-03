import React, { Dispatch, SetStateAction, useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert
} from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { Task } from './types';
import * as Location from "expo-location";
import { buildingList } from '@/utils/getBuildingList';
import { suggestionResult } from '@/services/searchService';
import AutoCompleteDropdown, { BuildingData, AutoCompleteDropdownRef } from './input/AutoCompleteDropdown';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { TaskPlan } from '@/services/spOpenAI';

type TaskViewModalProps = {
  visible: boolean;
  onClose: () => void;
  planName: string;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  isStartLocationSet: boolean;
  setIsStartLocationSet: Dispatch<SetStateAction<boolean>>;
  generatedPlan: TaskPlan[];
  setGeneratedPlan: Dispatch<SetStateAction<TaskPlan[]>>;
  deletePlan: () => void;
  openPlanBuilder: () => void;
  onRegeneratePlan: (updatedTasks: Task[]) => Promise<void>;
  navigateToRoutes: (
    destination: string | { origin?: string; destination: string }
  ) => void;
  onCloseAllModals: () => void;
};

type DisplayItem = Task | TaskPlan;

export default function TaskViewModal({
  visible,
  onClose,
  planName,
  tasks,
  setTasks,
  isStartLocationSet,
  setIsStartLocationSet,
  generatedPlan,
  setGeneratedPlan,
  deletePlan,
  openPlanBuilder,
  onRegeneratePlan,
  navigateToRoutes,
  onCloseAllModals,
}: TaskViewModalProps) {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [tempTaskName, setTempTaskName] = useState('');
  const [tempTaskLocation, setTempTaskLocation] = useState('');
  const [tempTaskLocationPlaceId, setTempTaskLocationPlaceId] = useState('');
  const [tempTaskTime, setTempTaskTime] = useState('');
  const [editingTask, setEditingTask] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<suggestionResult[]>([]);
  const [date, setDate] = useState(new Date());
  const editLocationDropdownRef = useRef<AutoCompleteDropdownRef>(null);
  const isDeletePlanDisabled = tasks.length === 0 && generatedPlan.length === 0;
  const isAddEditPlanDisabled = tasks.length === 0 && generatedPlan.length === 0;

  // Whenever the modal closes, reset any editing state so it won't remain in edit mode
  useEffect(() => {
    if (!visible) {
      setEditingTask(false);
      setEditingTaskId(null);
      setTempTaskName('');
      setTempTaskLocation('');
      setTempTaskLocationPlaceId('');
      setTempTaskTime('');
    }
  }, [visible]);

  const markDone = (id: number) => {
    // TODO: Implement "Done" state visually or functionally if needed
     Alert.alert("Mark as Done", "Functionality not yet implemented.");
  };

  const deleteTask = async (item: DisplayItem) => {
    let newTasks: Task[] = [];
  
    setTasks((prevTasks) => {
      let taskToDelete: Task | undefined;
  
      if ("id" in item) {
        taskToDelete = prevTasks.find((t) => t.id === item.id);
        newTasks = prevTasks.filter((t) => t.id !== item.id);
      } else {
        taskToDelete = prevTasks.find(
          (t) => t.name === item.taskName && t.location === item.taskLocation
        );
        if (taskToDelete) {
          newTasks = prevTasks.filter((t) => t.id !== taskToDelete!.id);
        } else {
          newTasks = [...prevTasks];
        }
      }
  
      if (taskToDelete?.name === "Start Location") {
        setIsStartLocationSet(false);
      }
  
      return newTasks;
    });
  
    if (onRegeneratePlan) {
      await onRegeneratePlan(newTasks);
    }
  };
  

  const editTask = (item: DisplayItem) => {
    let taskToEdit: Task;
    
    if ('id' in item) {
      taskToEdit = item;
    } else {
      const matchingTask = tasks.find(task => 
        task.name === item.taskName && 
        task.location === item.taskLocation
      );
      
      if (!matchingTask) {
        console.log("Task not found for editing");
        return;
      }
      
      taskToEdit = matchingTask;
    }
    
    setEditingTask(true);
    setEditingTaskId(taskToEdit.id);
    setTempTaskName(taskToEdit.name);
    setTempTaskLocation(taskToEdit.location);
    setTempTaskLocationPlaceId(taskToEdit.locationPlaceID);
    setTempTaskTime(taskToEdit.time);
  
    setDate(new Date()); 
    editLocationDropdownRef.current?.reset();
  };

  const saveTaskEdit = async () => {
    if (!editingTaskId) return;

    let updatedTasks: Task[] = [];
    setTasks((prev) => {
      updatedTasks = prev.map((t) =>
        t.id === editingTaskId
          ? {
              ...t,
              name: tempTaskName,
              location: tempTaskLocation,
              locationPlaceID: tempTaskLocationPlaceId,
              time: tempTaskTime,
            }
          : t
      );
      return updatedTasks;
    });

     setEditingTaskId(null);
     setTempTaskName('');
     setTempTaskLocation('');
     setTempTaskLocationPlaceId('');
     setTempTaskTime('');
     setEditingTask(false);

     if (onRegeneratePlan) {
        await onRegeneratePlan(updatedTasks);
     }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);

    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;

    setTempTaskTime(formattedTime);
  };

  const buildingListPlusMore: BuildingData[] = [
    { buildingName: "Any SGW campus building", placeID: "" },
    { buildingName: "Any LOY campus building", placeID: "" },
    { buildingName: "Any campus building", placeID: "" },
    { buildingName: "Any location", placeID: "" },
    ...buildingList,
  ];

  const handleDirections = (item: DisplayItem, index: number) => {

    if (!generatedPlan || generatedPlan.length < 2) {
      Alert.alert("Error", "No next task found in the plan.");
      return;
    }
  
    const nextTaskIndex = 1;
  
    // If it's the first actual task, origin is the start location (index 0);
    // otherwise origin is the task's previous destination
    const origin = generatedPlan[nextTaskIndex - 1].taskLocation;
    const destination = generatedPlan[nextTaskIndex].taskLocation;
    console.log(origin + ', ' + destination);
  
    if (!destination) {
      Alert.alert("Error", "Next task location is not specified.");
      return;
    }
  
    // Pass both to navigateToRoutes
    navigateToRoutes({ origin, destination });
    onCloseAllModals();
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
             { text: "Cancel", style: "cancel", onPress: () => editLocationDropdownRef.current?.reset() },
             { text: "Enable", onPress: () => { _openAppSetting(); editLocationDropdownRef.current?.reset(); } },
           ]
        );
        return;
      }
    }
    try {
      const data = searchSuggestions.find(
        (place) => place.placePrediction.structuredFormat.mainText.text === placeName
      );
      if (data === undefined) {
        console.log("Selected place is undefined");
        setTempTaskLocation(''); 
        setTempTaskLocationPlaceId('');
        return;
      }
      setTempTaskLocation(data.placePrediction.structuredFormat.mainText.text);
      setTempTaskLocationPlaceId(data.placePrediction.placeId);
    } catch (error) {
      console.log(`Error selecting place: ${error}`);
       setTempTaskLocation('');
       setTempTaskLocationPlaceId('');
    }
  };

   const handleDeletePlanPress = () => {
    if (isDeletePlanDisabled) return;
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this entire plan?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deletePlan();
              onClose();
            },
          },
        ],
        { cancelable: true }
      );
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
          {/* Make the container tall so more tasks are visible */}
          <View style={[styles.container, { height: '85%' }]}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{editingTask ? 'Edit Task' : `Plan: ${planName}`}</Text>
              <TouchableOpacity onPress={onClose}>
                <IconSymbol name={'close' as IconSymbolName} size={32} color="white" testID="close-task-view-button"/>
              </TouchableOpacity>
            </View>

             {editingTask ? (
               <View style={styles.editTaskContainer}>
                <Text style={styles.addTaskHeader}>Task Name</Text>
                <TextInput
                    style={styles.editTaskInput}
                    value={tempTaskName}
                    onChangeText={setTempTaskName}
                    placeholder="Enter task name..."
                    placeholderTextColor="#b2b3b8"
                    testID='task-name-input-edit-task'
                    editable={editingTaskId !== null && tasks.find(t => t.id === editingTaskId)?.name !== 'Start Location'}
                />

                <Text style={styles.addTaskHeader}>Location</Text>
                <View style={{ alignSelf: 'stretch', marginBottom: 12, marginTop: 4, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <AutoCompleteDropdown
                        ref={editLocationDropdownRef}
                        locked={false}
                        searchSuggestions={searchSuggestions}
                        setSearchSuggestions={setSearchSuggestions}
                        buildingData={buildingListPlusMore}
                        onSelect={(selected) => handleSearch(selected)}
                        darkTheme={true}
                        currentVal={tempTaskLocation} // Show current temp location
                        testID='location-dropdown-edit-task'
                    />
                </View>

                 {/* Only show time picker if it's not the Start Location task */}
                 {editingTaskId !== null && tasks.find(t => t.id === editingTaskId)?.name !== 'Start Location' && (
                     <>
                        <Text style={styles.addTaskHeader}>Time (Optional)</Text>
                        {Platform.OS === 'ios' ? (
                            <DateTimePicker
                                value={date}
                                mode="time"
                                is24Hour={false}
                                display="default"
                                onChange={onTimeChange}
                                themeVariant="dark"
                                testID='time-picker-edit-task'
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
                                testID='time-picker-android-edit-task'
                                >
                                <Text style={{ color: 'white', fontSize: 17 }}>
                                    {tempTaskTime || 'Select Time'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                 )}


                <View style={styles.saveButtonRow}>
                    <TouchableOpacity
                        style={{ ...styles.editTaskActionButton, backgroundColor: '#555' }} // Cancel button
                        onPress={() => setEditingTask(false)} // Go back without saving
                        testID='cancel-edit-button-task'
                    >
                        <Text style={{ color: 'white', fontSize: 16 }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ ...styles.editTaskActionButton, backgroundColor: '#00AA44' }} // Save button
                        onPress={saveTaskEdit}
                        testID='save-button-task'
                    >
                        <Text style={{ color: 'white', fontSize: 16 }}>Save</Text>
                    </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <FlatList
                    data={generatedPlan.length > 0 ? generatedPlan as DisplayItem[] : tasks as DisplayItem[]}
                    keyExtractor={(item: DisplayItem) => {
                      return 'id' in item ? item.id.toString() : item.order.toString();
                    }}
                    style={{ maxHeight: '75%' }}
                    renderItem={({ item, index }) => {
                      const itemId = 'id' in item ? item.id : item.order;
                      const itemName = 'name' in item ? item.name : item.taskName;
                      const itemLocation = 'location' in item ? item.location : item.taskLocation;
                      const itemTime = 'time' in item ? item.time : item.taskTime || '';
                      const isStartLocation = itemName === 'Start Location';

                      return (
                        <View style={styles.taskRow}>
                            <View style={{ flex: 1 }}>
                                <View style={styles.taskNameRow}>
                                  <Text style={styles.taskItemText}>{itemName}</Text>
                                  <View style={styles.iconButtonsRow}>
                                      <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() => editTask(item)}
                                        testID={`edit-icon-task-${itemId}`}
                                      >
                                        <IconSymbol
                                            name={'pencil' as IconSymbolName}
                                            size={20}
                                            color="white"
                                        />
                                      </TouchableOpacity>

                                      <TouchableOpacity
                                          style={styles.deleteButton}
                                          onPress={() => deleteTask(item)}
                                          testID={`delete-icon-task-${itemId}`}
                                      >
                                          <IconSymbol
                                              name={'trash' as IconSymbolName}
                                              size={20}
                                              color="white"
                                          />
                                      </TouchableOpacity>
                                  </View>
                                </View>

                                <View style={styles.iconRow}>
                                  <IconSymbol
                                      name={'location' as IconSymbolName}
                                      size={16}
                                      color="#b2b3b8"
                                      testID={`location-icon-task-${itemId}`}
                                  />
                                  <Text style={styles.taskItemSubText}>{itemLocation}</Text>
                                </View>
                                
                                {itemTime && !isStartLocation && (
                                  <View style={styles.iconRow}>
                                      <IconSymbol
                                          name={'clock' as IconSymbolName}
                                          size={16}
                                          color="#b2b3b8"
                                          testID={`time-icon-task-${itemId}`}
                                      />
                                      <Text style={styles.taskItemSubText}>{itemTime}</Text>
                                  </View>
                                )}

                                {!itemTime && !isStartLocation && (
                                  <View style={styles.iconRow}>
                                      <IconSymbol
                                          name={'clock' as IconSymbolName}
                                          size={16}
                                          color="#b2b3b8"
                                          testID={`time-icon-task-${itemId}`}
                                      />
                                      <Text style={styles.taskItemSubText}>Any time</Text>
                                  </View>
                                )}

                                {!isStartLocation && (
                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            style={styles.directionsButton}
                                            onPress={() => handleDirections(item, index)}
                                            testID={`directions-button-task-${itemId}`}
                                        >
                                            <Text style={{ color: 'white', fontSize: 16 }}>
                                            Directions
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.doneButton}
                                            onPress={() => markDone(itemId)}
                                            testID={`done-button-task-${itemId}`}
                                        >
                                            <Text style={{ color: 'white', fontSize: 16 }}>
                                            Done
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                      );
                    }}
                    ListEmptyComponent={() => (
                        <Text style={styles.emptyListText}>No tasks added to this plan yet.</Text>
                    )}
                />

                 <View style={styles.footer}>
                    <TouchableOpacity
                      style={[
                        styles.planBuilderButton,
                        isAddEditPlanDisabled && styles.disabledButton
                      ]}
                      disabled={isAddEditPlanDisabled}
                      onPress={openPlanBuilder}
                      testID='plan-builder-button'
                    >
                      <Text style={{ color: 'white', fontSize: 16 }}>Add/Edit Plan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                          styles.deletePlanButton,
                          isDeletePlanDisabled && styles.disabledButton
                        ]}
                        onPress={handleDeletePlanPress}
                        disabled={isDeletePlanDisabled}
                        testID='delete-plan-button'
                      >
                        <Text style={{ color: 'white', fontSize: 16,}}>Delete Plan</Text>
                      </TouchableOpacity>
                  </View>
                </>
            )}
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
    margin: 20,
    backgroundColor: '#010213',
    borderRadius: 10,
    padding: 16,
  },
   editTaskContainer: { 
    flex: 1,
    paddingTop: 10,
  },
  addTaskHeader: {
    fontSize: 17,
    color: 'white',
    marginBottom: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  saveButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  editTaskActionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#2c2c38',
  },
  taskNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  headerTitle: {
    marginTop: 8,
    fontSize: 22,
    marginLeft: 8,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  editTaskInput: {
    backgroundColor: '#2c2c38',
    borderRadius: 8,
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    width: '100%',
  },
  iconButtonsRow: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#3A3A4D',
    borderRadius: 8,
    padding: 6,
    marginHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: '#A30000',
    borderRadius: 8,
    padding: 6,
    marginHorizontal: 4,
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
  footer: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  planBuilderButton: {
    backgroundColor: '#122F92',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  deletePlanButton: {
    backgroundColor: '#A30000',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    marginVertical: 6,
    borderRadius: 8,
    padding: 12,
  },
  taskItemText: {
    color: 'white',
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 4,
    flexShrink: 1,
  },
  taskItemSubText: {
    color: '#b2b3b8',
    fontSize: 17,
    marginLeft: 8,
    marginBottom: 4,
    flexShrink: 1,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  directionsButton: {
    flex: 1,
    backgroundColor: '#122F92',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: '#00AA44',
    flex: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  emptyListText: {
    color: '#b2b3b8',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});