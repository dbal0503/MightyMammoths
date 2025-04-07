import React, { useState, useEffect } from 'react';
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
import { calculateAllPairsDistances } from '@/services/smartPlannerDistancePairs';
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
  const [pendingOrigin, setPendingOrigin] = useState('');
  const [pendingDestination, setPendingDestination] = useState('');

  // Controls for nested modals
  const [planBuilderVisible, setPlanBuilderVisible] = useState(false);
  const [taskViewVisible, setTaskViewVisible] = useState(false);

  // State for tasks being edited in PlanBuilderModal
  const [editingTasks, setEditingTasks] = useState<Task[]>([]);

  const [initBuilder, setInitBuilder] = useState(false);

  // Should prob stay commented out, leaving in case for now
  // useEffect(() => {
  //   if (!visible) {
  //     setHasPlan(false); setPlanName(''); setTasks([]); setGeneratedPlan([]); setIsStartLocationSet(false);
  //     setPlanBuilderVisible(false); setTaskViewVisible(false); setEditingTasks([]); setTaskViewFromEditor(false); setIsLoading(false);
  //   }
  // }, [visible]);


  const handleCloseAllModals = () => {
    setTaskViewVisible(false);
    setPlanBuilderVisible(false);
    setTaskViewFromEditor(false);
    onClose();
  };

  const handleCreatePlan = () => {
    const openBuilder = () => {
      setPlanName(''); setTasks([]); setGeneratedPlan([]); setIsStartLocationSet(false); setHasPlan(false);
      setEditingTasks([]);
      setInitBuilder(true);
      openPlanBuilderForEdit();
    };
    if (hasPlan) { Alert.alert('Confirm New Plan', 'Are you sure you want to create a new plan? This will delete the current plan.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Yes', onPress: openBuilder },], { cancelable: true }); }
    else { openBuilder(); }
  };

  const openPlanBuilderForEdit = () => {
    setPlanBuilderVisible(true);
    setEditingTasks([...tasks]); // Pass the current tasks to the PlanBuilderModal for editing
    setInitBuilder(false);
  };


  const handleSavePlan = async (name: string, updatedTasks: Task[], startLocationSet: boolean) => {
    setIsLoading(true);
    setPlanName(name);
    setTasks([...updatedTasks]);
    setIsStartLocationSet(startLocationSet);
    setHasPlan(true);
    setPlanBuilderVisible(false);
    await handleRegeneratePlan(updatedTasks);
  };

const handleRegeneratePlan = async (taskList: Task[]) => {
  const actualTasks = taskList.filter(
    task => task.type !== 'location' && !task.completed
  );
  if (actualTasks.length === 0) {
    setGeneratedPlan([]);
    setIsLoading(false);
    return;
  }
  setIsLoading(true);
  try {
    let distanceDurationArr = await calculateAllPairsDistances(taskList);
    const plan = await generatePlanFromChatGPT(
      taskList,
      distanceDurationArr,
      getBuildingsByCampus()['SGW'],
      getBuildingsByCampus()['LOY']
    );
    setGeneratedPlan(plan);
  } catch (error) {
      setGeneratedPlan([]);
      Alert.alert("Error", "Failed to generate plan.");
      console.log(error);
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
    setInitBuilder(true);
  };

  
  const handleGetDirections = (origin: string, destination:string) => {
    console.log("Generated Plan: ", generatedPlan);
    console.log("Tasks: ", tasks);
    if (!generatedPlan || generatedPlan.length < 2) {
      Alert.alert("Error", "No next task found in the plan.");
      return;
    }
  
    // const nextIncompleteTaskIndex = generatedPlan.findIndex((task, index) => 
    //   index > 0 && !task.completed
    // );

    // console.log("Next Incomplete Task Index: ", nextIncompleteTaskIndex);
    
    // if (nextIncompleteTaskIndex === -1) {
    //   Alert.alert("Info", "All tasks have been completed.");
    //   return;
    // }
    
    // const origin = generatedPlan[nextIncompleteTaskIndex].origin;
    // const destination = generatedPlan[nextIncompleteTaskIndex].destination;
    // console.log(origin + ', ' + destination);

    onClose();
  
  // Add a small delay before navigation to ensure modal is closed
    setTimeout(() => {
      if (!origin || !destination) {
        Alert.alert("Error", "Origin or destination is missing.");
        return;
      }
      
      // Navigate to routes
      navigateToRoutes({ origin, destination });
    }, 800);
  };

  useEffect(() => {
    if (pendingOrigin && pendingDestination) {
      onClose();
      setTimeout(() => {
        navigateToRoutes({ origin: pendingOrigin, destination: pendingDestination });
        setPendingOrigin('');
        setPendingDestination('');
      }, 500);
    }
  }, [pendingOrigin, pendingDestination]);


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

  const renderHasPlan = () => {
    const allTasksCompleted = generatedPlan.length > 1 && 
      generatedPlan.slice(1).every(task => task.completed);
    
    const nextIncompleteTaskIndex = generatedPlan.length > 1 ? 
      generatedPlan.findIndex((task, index) => index > 0 && !task.completed) : -1;
    
    const hasNextTask = nextIncompleteTaskIndex !== -1;
    const origin = hasNextTask ? generatedPlan[nextIncompleteTaskIndex].origin ?? '' : '';
    const destination = hasNextTask ? generatedPlan[nextIncompleteTaskIndex].destination ?? '' : '';

  
    return (
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
              allTasksCompleted ? (
                <>
                  <Text style={styles.noPlanText}>All tasks completed!</Text>
                  <TouchableOpacity
                    style={styles.viewPlanButton}
                    onPress={() => setTaskViewVisible(true)}
                    testID="view-plan-button"
                  >
                    <Text style={styles.viewPlanButtonText}>View Full Plan</Text>
                  </TouchableOpacity>
                </>
              ) : hasNextTask ? (
                <>
                  <View style={styles.taskHeaderRow}>
                    <Text style={styles.nextTaskLabel}>Next Task</Text>
                    <TouchableOpacity
                      style={styles.nextTaskDirectionsButton}
                      testID="get-directions-button-main-modal"
                      onPress={() => handleGetDirections(origin, destination)}
                    >
                      <Text style={{ color: 'white', fontSize: 15 }}>Get Directions</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.iconTextRow}>
                    <IconSymbol name={'info' as IconSymbolName} size={30} color="white" testID="info-icon-main-modal" />
                    <Text style={styles.taskItemSubText}>{generatedPlan[nextIncompleteTaskIndex].taskName}</Text>
                  </View>
                  <View style={styles.iconTextRow}>
                    <IconSymbol name={'location' as IconSymbolName} size={30} color="white" testID="location-icon-main-modal" />
                    <Text style={styles.taskItemSubText}>{generatedPlan[nextIncompleteTaskIndex].taskLocation}</Text>
                  </View>
                  <View style={styles.iconTextRow}>
                    <IconSymbol name={'clock' as IconSymbolName} size={30} color="white" testID="clock-icon-main-modal" />
                    {!generatedPlan[nextIncompleteTaskIndex].taskTime ? (
                      <Text style={styles.taskItemSubText}>No time specified</Text>
                    ) : (
                      <Text style={styles.taskItemSubText}>{generatedPlan[nextIncompleteTaskIndex].taskTime}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.viewPlanButton}
                    onPress={() => setTaskViewVisible(true)}
                    testID="view-plan-button"
                  >
                    <Text style={styles.viewPlanButtonText}>View Full Plan</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.noPlanText}>No incomplete tasks found.</Text>
                  <TouchableOpacity
                    style={styles.viewPlanButton}
                    onPress={() => setTaskViewVisible(true)}
                    testID="view-plan-button"
                  >
                    <Text style={styles.viewPlanButtonText}>View Full Plan</Text>
                  </TouchableOpacity>
                </>
              )
            ) : (
              <>
                <Text style={styles.noPlanText}>{tasks.length > 0 ? 'Plan generated, but no tasks found.' : 'No tasks added yet.'}</Text>
                <TouchableOpacity
                  style={styles.viewPlanButton}
                  onPress={openPlanBuilderForEdit}
                  testID="edit-tasks-button"
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
          testID="create-plan-button"
        >
          <Text style={styles.createPlanButtonText}>Create New Plan</Text>
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent={true} transparent>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.mainContainer}>
        <View style={[styles.modalContainer, { maxHeight: hasPlan ? (isLoading ? '45%' : (generatedPlan.length > 1 ? '63%' : '45%')) : '35%' },]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={isLoading}>
            <IconSymbol name={'close' as IconSymbolName} size={30} color="white" testID='close-icon-main-modal' />
          </TouchableOpacity>
          {!hasPlan ? renderNoPlan() : renderHasPlan()}
        </View>

        {/* Plan Builder Modal */}
        <PlanBuilderModal
          visible={planBuilderVisible}
          onClose={() => {
            setPlanBuilderVisible(false)
          }}
          initialPlanName={planName}
          initialTasks={editingTasks}
          initialIsStartLocationSet={isStartLocationSet}
          nextEvent={nextEvent}
          onSavePlan={handleSavePlan}
          openTaskView={(currentTempTasks) => {
              setEditingTasks([...currentTempTasks]);
              setTaskViewVisible(true);
              setPlanBuilderVisible(false);
              setTaskViewFromEditor(true);
          }}
          init={initBuilder}
        />

        <TaskViewModal
          visible={taskViewVisible}
          navigateToRoutes={navigateToRoutes}
          onCloseAllModals={handleCloseAllModals}
           onClose={() => {
                setTaskViewVisible(false);
                if (taskViewFromEditor) {
                  openPlanBuilderForEdit();
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
          deletePlan={() => { handleDeletePlan(); setTaskViewVisible(false); }}
          onRegeneratePlan={handleRegeneratePlan}
          openPlanBuilder={() => {
            openPlanBuilderForEdit();
            setTaskViewVisible(false);
            setTaskViewFromEditor(false); }}
          handleGetDirections={(origin, destination) => {
            // Close before navigation
            onClose();
            // Add delay before navigation
            setTimeout(() => navigateToRoutes({ origin, destination }), 500);
          }}
          setPendingOrigin={setPendingOrigin}
          setPendingDestination={setPendingDestination}
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