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

  const markDone = (id: number) => {
    // Optionally handle "Done" state here
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const editTask = (task: Task) => {
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
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
      onDismiss={Keyboard.dismiss}
    >
     <KeyboardAvoidingView
     style={{ flex: 1 }}
     behavior={Platform.OS === 'ios' ? 'padding' : undefined}
     >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tasks for {planName}</Text>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name={'close' as IconSymbolName} size={32} color="white" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            style={{ maxHeight: '65%' }}
            renderItem={({ item }) => {
              const isEditing = editingTaskId === item.id;
              return (
                <View style={styles.taskRow}>
                  {isEditing ? (
                    <>
                      <TextInput
                        style={styles.editTaskInput}
                        value={tempTaskName}
                        onChangeText={setTempTaskName}
                      />
                      <TextInput
                        style={styles.editTaskInput}
                        value={tempTaskLocation}
                        onChangeText={setTempTaskLocation}
                      />
                      <TextInput
                        style={styles.editTaskInput}
                        value={tempTaskTime}
                        onChangeText={setTempTaskTime}
                      />
                      <TouchableOpacity style={styles.doneButton} onPress={saveTaskEdit}>
                        <Text style={{ color: 'white' }}>Save</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.taskItemText}>{item.name}</Text>
                        <Text style={styles.taskItemSubText}>{item.location}</Text>
                        <Text style={styles.taskItemSubText}>{item.time}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.directionsButton}
                        onPress={() => {}}
                      >
                        <Text style={{ color: 'white' }}>Directions</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => markDone(item.id)}
                      >
                        <Text style={{ color: 'white' }}>Done</Text>
                      </TouchableOpacity>
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
                    </>
                  )}
                </View>
              );
            }}
          />

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.planBuilderButton}
              onPress={openPlanBuilder}
            >
              <Text style={{ color: 'white' }}>Plan Builder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deletePlanButton} onPress={deletePlan}>
              <Text style={{ color: 'white' }}>Delete Plan</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    marginVertical: 6,
    borderRadius: 8,
    padding: 8,
  },
  taskItemText: {
    color: 'white',
    fontSize: 14,
  },
  taskItemSubText: {
    color: '#b2b3b8',
    fontSize: 12,
  },
  editTaskInput: {
    flex: 1,
    backgroundColor: '#2c2c38',
    borderRadius: 8,
    color: 'white',
    paddingHorizontal: 8,
    marginRight: 8,
  },
  directionsButton: {
    backgroundColor: '#122F92',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  doneButton: {
    backgroundColor: '#00AA44',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
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
    justifyContent: 'space-evenly',
  },
  planBuilderButton: {
    backgroundColor: '#2c2c38',
    borderRadius: 8,
    padding: 12,
  },
  deletePlanButton: {
    backgroundColor: '#A30000',
    borderRadius: 8,
    padding: 12,
  },
});