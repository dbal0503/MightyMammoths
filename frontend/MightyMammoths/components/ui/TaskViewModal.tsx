import React, { Dispatch, SetStateAction, useState } from 'react';
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
  Keyboard,
} from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { Task } from './types';

type TaskViewModalProps = {
  visible: boolean;
  onClose: () => void;
  planName: string;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  deletePlan: () => void;
  openPlanBuilder: () => void;
};

export default function TaskViewModal({
  visible,
  onClose,
  planName,
  tasks,
  setTasks,
  deletePlan,
  openPlanBuilder,
}: TaskViewModalProps) {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [tempTaskName, setTempTaskName] = useState('');
  const [tempTaskLocation, setTempTaskLocation] = useState('');
  const [tempTaskTime, setTempTaskTime] = useState('');
  const [editingTask, setEditingTask] = useState(false);

  const markDone = (id: number) => {
    // Optionally handle "Done" state here
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const editTask = (task: Task) => {
    setEditingTask(true);
    setEditingTaskId(task.id);
    setTempTaskName(task.name);
    setTempTaskLocation(task.location);
    setTempTaskTime(task.time);
  };

  const saveTaskEdit = () => {
    if (!editingTaskId) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTaskId
          ? { ...t, name: tempTaskName, location: tempTaskLocation, time: tempTaskTime }
          : t
      )
    );
    setEditingTaskId(null);
    setTempTaskName('');
    setTempTaskLocation('');
    setTempTaskTime('');
    setEditingTask(false);
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
        <View style={[
          styles.container, 
          {height: editingTask ? '70%' : '40%'},
          ]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tasks for {planName}</Text>
            <TouchableOpacity onPress={() => {
                onClose();
                setEditingTask(false);
              }}>

              <IconSymbol name={'close' as IconSymbolName} size={32} color="white" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            style={{ maxHeight: '63%' }}
            renderItem={({ item }) => {
              const isEditing = editingTaskId === item.id;
              return (
                <View style={styles.taskRow}>
                  {isEditing ? (
                    <>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.addTaskHeader}>Task Name</Text>
                      <View style={styles.inputRow}>
                        <TextInput
                          style={styles.editTaskInput}
                          value={tempTaskName}
                          onChangeText={setTempTaskName}
                        />
                      </View>
                      <Text style={styles.addTaskHeader}>Location</Text>
                      <View style={styles.inputRow}>
                        <TextInput
                          style={styles.editTaskInput}
                          value={tempTaskLocation}
                          onChangeText={setTempTaskLocation}
                        />
                      </View>
                      <Text style={styles.addTaskHeader}>Time</Text>
                      <View style={styles.inputRow}>
                        <TextInput
                          style={styles.editTaskInput}
                          value={tempTaskTime}
                          onChangeText={setTempTaskTime}
                        />
                      </View>
                      <View style={styles.saveButtonRow}>
                        <TouchableOpacity style={styles.doneButton} onPress={saveTaskEdit}>
                          <Text style={{ color: 'white', fontSize: 16 }}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.taskRow}>
                      <View style={{ flex: 1 }}>
                      <View style={styles.taskNameRow}>
                        <Text style={styles.taskItemText}>{item.name}</Text>
                        <View style={styles.iconButtonsRow}>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => editTask(item)}
                          >
                            <IconSymbol
                              name={'pencil' as IconSymbolName}
                              size={20}
                              color="white"
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deleteTask(item.id)}
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
                          <IconSymbol name={'location' as IconSymbolName} size={16} color="#b2b3b8" />
                          <Text style={styles.taskItemSubText}>{item.location}</Text>
                        </View>
                        <View style={styles.iconRow}>
                          <IconSymbol name={'clock' as IconSymbolName} size={16} color="#b2b3b8" />
                          <Text style={styles.taskItemSubText}>{item.time}</Text>
                        </View>

                        <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.directionsButton}
                            onPress={() => {}}
                          >
                            <Text style={{ color: 'white', fontSize: 16 }}>Directions</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.doneButton}
                            onPress={() => markDone(item.id)}
                          >
                            <Text style={{ color: 'white', fontSize: 16 }}>Done</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    </>
                  )}
                </View>
              );
            }}
          />
          {!editingTask && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.planBuilderButton}
              onPress={openPlanBuilder}
            >
              <Text style={{ color: 'white', fontSize: 16 }}>Plan Builder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deletePlanButton} onPress={deletePlan}>
              <Text style={{ color: 'white', fontSize: 16 }}>Delete Plan</Text>
            </TouchableOpacity>
          </View>)}
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
    maxHeight: '80%',
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
    justifyContent: 'flex-end',
    marginTop: 8,
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
  },
  inputRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  headerTitle: {
    marginTop: 8,
    fontSize: 22,
    marginLeft: 8,
    color: 'white',
  },
  editTaskInput: {
    flex: 1,
    backgroundColor: '#2c2c38',
    borderRadius: 8,
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginRight: 8,
    fontSize: 16,
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
  footer: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  planBuilderButton: {
    backgroundColor: '#2c2c38',
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
    marginBottom: 4,
  },
  taskItemSubText: {
    color: 'white',
    fontSize: 17,
    marginLeft: 4,
    marginBottom: 4,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
  iconButton: {
    padding: 6,
    marginHorizontal: 4,
  },
});