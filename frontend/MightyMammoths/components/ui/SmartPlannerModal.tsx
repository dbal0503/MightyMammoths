import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import PlanBuilderModal from './PlanBuilderModal';
import TaskViewModal from './TaskViewModal';
import { Task } from './types';

type SmartPlannerModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function SmartPlannerModal({
  visible,
  onClose,
}: SmartPlannerModalProps) {
  const [hasPlan, setHasPlan] = useState(false);
  const [planName, setPlanName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Controls for nested modals
  const [planBuilderVisible, setPlanBuilderVisible] = useState(false);
  const [taskViewVisible, setTaskViewVisible] = useState(false);

  const handleCreatePlan = () => {
    setPlanBuilderVisible(true);
  };

  const handleSavePlan = () => {
    if (planName.trim()) {
      setHasPlan(true);
    }
  };

  const handleDeletePlan = () => {
    setHasPlan(false);
    setPlanName('');
    setTasks([]);
    setTaskViewVisible(false);
  };

  const renderNoPlan = () => (
    <View style={styles.modalContentContainer}>
      <Text style={styles.planTitle}>Smart Planner</Text>
      <Text style={styles.noPlanText}>No current plan</Text>
      <TouchableOpacity
        style={styles.createPlanButton}
        onPress={handleCreatePlan}
      >
        <Text style={styles.createPlanButtonText}>Create Plan</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHasPlan = () => (
    <View style={styles.modalContentContainer}>
      <Text style={styles.planTitle}>{planName}</Text>
      {tasks.length > 0 ? (
        <>
          <Text style={styles.nextTaskLabel}>Next Task</Text>
          <TouchableOpacity style={styles.nextTaskDirectionsButton}>
            <Text style={{ color: 'white' }}>Get Directions</Text>
          </TouchableOpacity>
          <Text style={styles.taskItemText}>{tasks[0].name}</Text>
          <Text style={styles.taskItemSubText}>{tasks[0].location}</Text>
          <Text style={styles.taskItemSubText}>{tasks[0].time}</Text>
        </>
      ) : (
        <Text style={styles.noPlanText}>No tasks yet</Text>
      )}
      <TouchableOpacity
        style={styles.viewPlanButton}
        onPress={() => setTaskViewVisible(true)}
      >
        <Text style={styles.viewPlanButtonText}>View Plan</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      onDismiss={Keyboard.dismiss}
      transparent
    >
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.modalContainer}>
          {/* Close Icon */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name={'close' as IconSymbolName} size={30} color="white" />
          </TouchableOpacity>

          {/* Conditional Content */}
          {!hasPlan ? renderNoPlan() : renderHasPlan()}
        </View>

        {/* Plan Builder Modal */}
        <PlanBuilderModal
          visible={planBuilderVisible}
          onClose={() => setPlanBuilderVisible(false)}
          planName={planName}
          setPlanName={setPlanName}
          tasks={tasks}
          setTasks={setTasks}
          onSavePlan={() => {
            handleSavePlan();
            setPlanBuilderVisible(false);
          }}
          openTaskView={() => {
            setTaskViewVisible(true);
            setPlanBuilderVisible(false);
          }}
        />

        {/* Task View Modal */}
        <TaskViewModal
          visible={taskViewVisible}
          onClose={() => setTaskViewVisible(false)}
          planName={planName}
          tasks={tasks}
          setTasks={setTasks}
          deletePlan={handleDeletePlan}
          openPlanBuilder={() => {
            setPlanBuilderVisible(true);
            setTaskViewVisible(false);
          }}
        />
      </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'rgba(1,2,19,0.8)',
    justifyContent: 'center',
  },
  modalContainer: {
    margin: 20,
    backgroundColor: '#010213',
    borderRadius: 10,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  planTitle: {
    fontSize: 22,
    color: 'white',
    marginBottom: 16,
    alignSelf: 'center',
  },
  noPlanText: {
    fontSize: 18,
    color: '#b2b3b8',
    textAlign: 'center',
    marginVertical: 8,
  },
  createPlanButton: {
    backgroundColor: '#122F92',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
    width: '80%',
    alignItems: 'center',
  },
  createPlanButtonText: {
    color: 'white',
    fontSize: 18,
  },
  modalContentContainer: {
    alignItems: 'center',
  },
  nextTaskLabel: {
    color: '#b2b3b8',
    fontSize: 16,
    marginTop: 8,
  },
  nextTaskDirectionsButton: {
    backgroundColor: '#122F92',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  taskItemText: {
    color: 'white',
    fontSize: 14,
  },
  taskItemSubText: {
    color: '#b2b3b8',
    fontSize: 12,
  },
  viewPlanButton: {
    backgroundColor: '#122F92',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  viewPlanButtonText: {
    color: 'white',
  },
});
