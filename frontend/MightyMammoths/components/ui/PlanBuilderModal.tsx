import React, { Dispatch, SetStateAction } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { Task } from './types';

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
  const [tempTaskTime, setTempTaskTime] = React.useState('');

  const addTask = () => {
    if (tempTaskName.trim()) {
      const newTask: Task = {
        id: Date.now(),
        name: tempTaskName,
        location: tempTaskLocation,
        time: tempTaskTime,
      };
      setTasks([...tasks, newTask]);
      setTempTaskName('');
      setTempTaskLocation('');
      setTempTaskTime('');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent={true}
      onDismiss={Keyboard.dismiss}
      onRequestClose={onClose}
    >
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <IconSymbol name={'close' as IconSymbolName} size={32} color="white" />
          </TouchableOpacity>

          <Text style={styles.title}>Smart Planner</Text>
          <TextInput
            style={styles.planNameInput}
            placeholder="New Plan 1"
            placeholderTextColor="#b2b3b8"
            value={planName}
            onChangeText={setPlanName}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={{ color: 'white' }}>Set Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={{ color: 'white' }}>Add Class</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={openTaskView}>
              <Text style={{ color: 'white' }}>View Tasks</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addTaskContainer}>
            <TextInput
              style={styles.taskInput}
              placeholder="Enter task name..."
              placeholderTextColor="#b2b3b8"
              value={tempTaskName}
              onChangeText={setTempTaskName}
            />
            <TextInput
              style={styles.taskInput}
              placeholder="Search building..."
              placeholderTextColor="#b2b3b8"
              value={tempTaskLocation}
              onChangeText={setTempTaskLocation}
            />
            <TextInput
              style={styles.taskInput}
              placeholder="Pick Time"
              placeholderTextColor="#b2b3b8"
              value={tempTaskTime}
              onChangeText={setTempTaskTime}
            />
            <TouchableOpacity style={styles.addTaskButton} onPress={addTask}>
              <Text style={{ color: 'white' }}>Add Task</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={onSavePlan}>
            <Text style={{ color: 'white' }}>Save</Text>
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
    margin: 20,
    backgroundColor: '#010213',
    borderRadius: 10,
    padding: 16,
  },
  closeIcon: {
    alignSelf: 'flex-end',
  },
  title: {
    fontSize: 18,
    color: 'white',
    marginBottom: 16,
    alignSelf: 'center',
  },
  planNameInput: {
    backgroundColor: '#2c2c38',
    borderRadius: 8,
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
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
  },
  addTaskButton: {
    backgroundColor: '#122F92',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#A30000',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
});
