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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import PlanBuilderModal from './PlanBuilderModal';
import TaskViewModal from './TaskViewModal';
import { Task } from './types';
import {calculateAllPairsDistances} from '@/services/smartPlannerDistancePairs';
import { generatePlanFromChatGPT, TaskPlan } from '@/services/spOpenAI';
import { getBuildingsByCampus } from '@/utils/getBuildingsByCampus';


type SmartPlannerModalProps = {
  visible: boolean;
  onClose: () => void;
  navigateToRoutes: (
    destination: string | { origin?: string; destination: string }
  ) => void;
  nextEvent?: {
    name: string;
    description: string;
    location: string;
    time: string;
  } | null;
};

export default function SmartPlannerModal({
  visible,
  onClose,
  navigateToRoutes,
  nextEvent,
}: SmartPlannerModalProps) {
  const [hasPlan, setHasPlan] = useState(false);
  const [planName, setPlanName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<TaskPlan[]>([]);
  const [taskViewFromEditor, setTaskViewFromEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStartLocationSet, setIsStartLocationSet] = useState(false);
  const [isStartLocationButton, setIsStartLocationButton] = React.useState(false);

  // Controls for nested modals
  const [planBuilderVisible, setPlanBuilderVisible] = useState(false);
  const [taskViewVisible, setTaskViewVisible] = useState(false);

  // State for tasks being edited in PlanBuilderModal
  const [editingTasks, setEditingTasks] = useState<Task[]>([]);


  const handleCreatePlan = () => {
    if(hasPlan) {
    Alert.alert(
      'Confirm New Plan',
      'Are you sure you want to create a new plan? This will delete the current plan.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            handleDeletePlan(); 
            setPlanBuilderVisible(true);
          },
        },
      ],
      { cancelable: true }
    );
  } else {
    handleDeletePlan();
    setPlanBuilderVisible(true);
  }
  };


  const handleSavePlan = async (name: string, updatedTasks: Task[], startLocationSet: boolean) => {
      console.log(startLocationSet);
      setIsLoading(true);
      setPlanName(name);
      setTasks(updatedTasks);
      setIsStartLocationSet(startLocationSet);
      setHasPlan(true);
      setPlanBuilderVisible(false);

      console.log('Saved plan:', name, updatedTasks);

      await handleRegeneratePlan(updatedTasks);
      setIsLoading(false); 
  };

  const handleRegeneratePlan = async (taskList: Task[]) => {
    if (taskList.length === 0 || (taskList.length === 1 && taskList[0].type === 'location')) {
        console.log("Skipping regeneration: No tasks or only start location.");
        setGeneratedPlan([]); 
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
        console.log('Regenerating plan with tasks:', taskList);
        let distanceDurationArr = await calculateAllPairsDistances(taskList);
        //console.log('Distance Duration array:', distanceDurationArr);

        const plan = await generatePlanFromChatGPT(taskList, distanceDurationArr, getBuildingsByCampus()['SGW'], getBuildingsByCampus()['LOY']);
        setGeneratedPlan(plan);
        console.log('Generated Plan:', plan);

    } catch (error) {
        console.error("Error regenerating plan: ", error);
        setGeneratedPlan([]);
        Alert.alert("Error", "Failed to generate the plan. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };


  const handleDeletePlan = () => {
    setHasPlan(false);
    setIsStartLocationSet(false);
    setPlanName('');
    setTasks([]);
    setTaskViewVisible(false);
    setGeneratedPlan([]);
    setEditingTasks([]);
  };

  
  const handleGetDirections = () => {
    if (!generatedPlan || generatedPlan.length < 2) {
      Alert.alert("Error", "No next task found in the plan.");
      return;
    }
  
    const nextTaskIndex = 1;
  
    // If it's the first actual task, origin is the start location (index 0);
    // otherwise origin is the task's previous destination
    const origin = generatedPlan[nextTaskIndex - 1].taskLocation;
    const destination = generatedPlan[nextTaskIndex].taskLocation;
  
    if (!destination) {
      Alert.alert("Error", "Next task location is not specified.");
      return;
    }
  
    // Pass both to navigateToRoutes
    navigateToRoutes({ origin, destination });
    onClose();
  };
  


  const renderNoPlan = () => (
    <View style={styles.modalContentContainer}>
      <Text style={styles.planTitle}>Smart Planner</Text>
      <View style={styles.underlineBox} />
      <Text style={styles.noPlanText}>No current plan</Text>
      <View style={styles.underlineBox} />
      <TouchableOpacity
        style={styles.createPlanButton}
        onPress={handleCreatePlan}
        testID='create-plan-button'
      >
        <Text style={styles.createPlanButtonText}>Create New Plan</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHasPlan = () => (
    <View style={styles.modalContentContainer}>
      <Text style={styles.smartPlannerTitle}>Smart Planner</Text>
      <View style={styles.underlineBox} />
      {isLoading ? (
         <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Generating {planName} plan...</Text>
         </View>
      ) : (
        <>
          <Text style={styles.planTitle}>Current Plan: {planName}</Text>
          {generatedPlan.length > 1 ? (
            <>
              <View style={styles.taskHeaderRow}>
                <Text style={styles.nextTaskLabel}>Next Task</Text>
                <TouchableOpacity
                    style={styles.nextTaskDirectionsButton}
                    testID='get-directions-button-main-modal'
                    onPress={handleGetDirections}
                    >
                  <Text style={{ color: 'white', fontSize: 15 }}>Get Directions</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.iconTextRow}>
                <IconSymbol name={'info' as IconSymbolName} size={30} color="white" testID='info-icon-main-modal'/>
                <Text style={styles.taskItemSubText}>{generatedPlan[1].taskName}</Text>
              </View>
              <View style={styles.iconTextRow}>
                <IconSymbol name={'location' as IconSymbolName} size={30} color="white" testID='location-icon-main-modal'/>
                <Text style={styles.taskItemSubText}>{generatedPlan[1].taskLocation}</Text>
              </View>
              <View style={styles.iconTextRow}>
                <IconSymbol name={'clock' as IconSymbolName} size={30} color="white" testID='clock-icon-main-modal' />
                {!generatedPlan[1].taskTime ? (
                  <Text style={styles.taskItemSubText}>No time specified</Text>
                ) : (
                  <Text style={styles.taskItemSubText}>{generatedPlan[1].taskTime}</Text>
                )}
              </View>
               <TouchableOpacity
                style={styles.viewPlanButton}
                onPress={() => setTaskViewVisible(true)}
                testID='view-plan-button'
                >
                <Text style={styles.viewPlanButtonText}>View Full Plan</Text>
               </TouchableOpacity>
            </>
          ) : (
            <>
            <Text style={styles.noPlanText}>{tasks.length > 0 ? 'Plan generated, but no tasks found.' : 'No tasks added yet.'}</Text>
             <TouchableOpacity
                style={styles.viewPlanButton}
                onPress={openPlanBuilder}
                testID='edit-tasks-button'
              >
                <Text style={styles.viewPlanButtonText}>Edit Tasks</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
      <View style={styles.underlineBox} />
      <TouchableOpacity
        style={styles.createPlanButton}
        onPress={handleCreatePlan}
        testID='create-plan-button'
      >
        <Text style={styles.createPlanButtonText}>Create New Plan</Text>
      </TouchableOpacity>
    </View>
  );

  const openPlanBuilder = () => {
    setEditingTasks([...tasks]);
    setPlanBuilderVisible(true);
  };


  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      transparent
    >
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.mainContainer}>
        <View style={[
            styles.modalContainer,
            { maxHeight: hasPlan ? (isLoading ? '45%' : '63%') : '35%' },
          ]}>
          {/* Close Icon */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={isLoading}>
            <IconSymbol name={'close' as IconSymbolName} size={30} color="white" testID='close-icon-main-modal' />
          </TouchableOpacity>

          {/* Conditional Content */}
          {!hasPlan ? renderNoPlan() : renderHasPlan()}
        </View>

        {/* Plan Builder Modal */}
        <PlanBuilderModal
          visible={planBuilderVisible}
          onClose={() => {setPlanBuilderVisible(false)}}
          initialPlanName={planName}
          initialTasks={tasks}
          initialIsStartLocationSet={isStartLocationSet}
          nextEvent={nextEvent}
          onSavePlan={handleSavePlan}
          openTaskView={(currentTempTasks) => {
              setEditingTasks(currentTempTasks);
              setTaskViewVisible(true);
              setPlanBuilderVisible(false);
              setTaskViewFromEditor(true);
          }}
        />


        {/* Task View Modal */}
        <TaskViewModal
          visible={taskViewVisible}
           onClose={() => {
                setTaskViewVisible(false);
                
                if (taskViewFromEditor) {

                    setTasks([...editingTasks]);
                    setPlanBuilderVisible(true);
                    setTaskViewFromEditor(false);
                }
           }}
          planName={planName}
          tasks={taskViewFromEditor ? editingTasks : tasks}
          setTasks={taskViewFromEditor ? setEditingTasks : setTasks}
          isStartLocationSet={isStartLocationSet}
          setIsStartLocationSet={setIsStartLocationSet}
          generatedPlan={generatedPlan}
          setGeneratedPlan={setGeneratedPlan}
          deletePlan={handleDeletePlan}
          onRegeneratePlan={handleRegeneratePlan}
          openPlanBuilder={() => {
                setEditingTasks([...tasks]);
                setPlanBuilderVisible(true);
                setTaskViewVisible(false);
                setTaskViewFromEditor(false);
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
   loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  planTitle: {
    fontSize: 22,
    color: 'white',
    marginBottom: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
    marginLeft: 16,
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
    marginTop: 30,
  },
  nextTaskLabel: {
    color: 'white',
    fontSize: 16,
    marginTop: 8,
  },
  nextTaskDirectionsButton: {
    backgroundColor: '#122F92',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  taskItemText: {
    color: 'white',
    fontSize: 14,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 4,
    marginLeft: 50,
  },

  taskItemSubText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    flexShrink: 1,
  },
  viewPlanButton: {
    backgroundColor: '#122F92',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'center',
    width: '80%',
    alignItems: 'center',
  },
  viewPlanButtonText: {
    color: 'white',
    fontSize: 18,
  },
  underlineBox: {
    height: 1,
    backgroundColor: '#808080',
    width: '90%',
    alignSelf: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  smartPlannerTitle:{
    fontSize: 22,
    color: 'white',
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
  taskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});