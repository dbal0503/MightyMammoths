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
    setIsStartLocationSet(false);
    setPlanBuilderVisible(true);
  }
  };
  

  const handleSavePlan = async () => {
    if (planName.trim()) {
      setHasPlan(true);
      setIsLoading(true);
      
      console.log('Saved plan:', planName, tasks);

      try {
        let distanceDurationArr = await calculateAllPairsDistances(tasks);
        //console.log('Distance Duration array:', distanceDurationArr);
        
        setGeneratedPlan(await generatePlanFromChatGPT(tasks, distanceDurationArr, getBuildingsByCampus()['SGW'], getBuildingsByCampus()['LOY']));
        //console.log('Generated Plan:', generatedPlan);

      } catch (error) {
        console.error("Error in handleSavePlan: ", error);

      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeletePlan = () => {
    setHasPlan(false);
    setIsStartLocationSet(false);
    setPlanName('');
    setTasks([]);
    setTaskViewVisible(false);
    setGeneratedPlan([]);
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
      {isLoading && <Text style={styles.planTitle}>Generating {planName} plan ...</Text>}
      {!isLoading && (
        <>
          <Text style={styles.planTitle}>Current Plan: {planName}</Text>
          {tasks.length > 0 ? (
            <>
              <View style={styles.taskHeaderRow}>
                <Text style={styles.nextTaskLabel}>Next Task</Text>
                <TouchableOpacity style={styles.nextTaskDirectionsButton} testID='get-directions-button-main-modal'>
                  <Text style={{ color: 'white', fontSize: 15 }}>Get Directions</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.iconTextRow}>
                <IconSymbol name={'info' as IconSymbolName} size={30} color="white" testID='info-icon-main-modal'/>
                {/* TODO Get the task from generatedPlan */}
                <Text style={styles.taskItemSubText}>{generatedPlan[1].taskName}</Text> 
              </View>
              <View style={styles.iconTextRow}>
                <IconSymbol name={'location' as IconSymbolName} size={30} color="white" testID='location-icon-main-modal'/>
                <Text style={styles.taskItemSubText}>{generatedPlan[1].taskLocation}</Text>
              </View>
              <View style={styles.iconTextRow}>
                <IconSymbol name={'clock' as IconSymbolName} size={30} color="white" testID='clock-icon-main-modal' />
                <Text style={styles.taskItemSubText}>{generatedPlan[1].taskTime}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.noPlanText}>No tasks yet</Text>
          )}
        
      

        <TouchableOpacity
          style={styles.viewPlanButton}
          onPress={() => setTaskViewVisible(true)}
          testID='view-plan-button'
        >
          <Text style={styles.viewPlanButtonText}>View Plan</Text>
        </TouchableOpacity>
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
            { height: hasPlan ? '63%' : '35%' }, 
          ]}>
          {/* Close Icon */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name={'close' as IconSymbolName} size={30} color="white" testID='close-icon-main-modal' />
          </TouchableOpacity>

          {/* Conditional Content */}
          {!hasPlan ? renderNoPlan() : renderHasPlan()}
        </View>

        {/* Plan Builder Modal */}
        <PlanBuilderModal
          visible={planBuilderVisible}
          onClose={() => {setPlanBuilderVisible(false), setIsStartLocationButton(false)}}
          planName={planName}
          setPlanName={setPlanName}
          tasks={tasks}
          setTasks={setTasks}
          nextEvent={nextEvent}
          isStartLocationButton={isStartLocationButton}
          setIsStartLocationButton={setIsStartLocationButton}
          isStartLocationSet={isStartLocationSet}
          setIsStartLocationSet={setIsStartLocationSet}
          onSavePlan={() => {
            handleSavePlan();
            setPlanBuilderVisible(false);
          }}
          openTaskView={() => {
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
              setPlanBuilderVisible(true);
              setTaskViewFromEditor(false);
            }
          }}
          planName={planName}
          tasks={tasks}
          setTasks={setTasks}
          isStartLocationSet={isStartLocationSet}
          setIsStartLocationSet={setIsStartLocationSet}
          generatedPlan={generatedPlan}
          setGeneratedPlan={setGeneratedPlan}
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
    height: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
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
  },
  viewPlanButton: {
    backgroundColor: '#122F92',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 8,
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
