import React from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView,} from 'react-native';
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";

type SmartPlannerModalProps = {
  visible: boolean;
  onClose: () => void;
};

const SmartPlannerModal = ({ visible, onClose }: SmartPlannerModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>

          <TouchableOpacity onPress={onClose}>
            <IconSymbol name={"arrow-back" as IconSymbolName} size={40} color="white" style={styles.modeIcon} testID="smart-planner-back-button"/>
          </TouchableOpacity>

          <Text style={styles.title}>Smart Planner</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.chatBubble}>
          <Text style={styles.chatBubbleText}>
            Hi there! I'm your Smart Planner assistant. 
            Set your current location and add tasks to create a plan for your day.
          </Text>
          <Text style={styles.timestamp}>02:41 PM</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#b2b3b8"
            />
            <TouchableOpacity style={styles.sendButton}>
                <IconSymbol name={"paperplane.fill" as IconSymbolName} size={18} color="white" style={styles.sendIcon} testID="smart-planne-send-button"/>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Set Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Add Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Add Class</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SmartPlannerModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010213',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c38',
  },
  backButton: {
    width: 60,
    padding: 8,
  },
  modeIcon: {
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 16,
  },
  sendIcon: {
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
    borderColor: 'white',
  },
  backButtonText: {
    color: '#b2b3b8',
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  chatBubble: {
    margin: 16,
    padding: 16,
    backgroundColor: '#111111',
    borderRadius: 8,
  },
  chatBubbleText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  timestamp: {
    color: '#b2b3b8',
    fontSize: 12,
    textAlign: 'left',
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    backgroundColor: '#010213',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2c2c38',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2c2c38',
    borderRadius: 8,
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#3a3a4d',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2c2c38',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
  },
});
