import React, {useState} from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { Easing, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export function StaticNavigationInformation() {
    
    const nextStep='Rue Sainte-Catherine O';
    const distance='240m';
    const steps=[
        { step: 'Start at the intersection of Main St and Rue Sainte-Catherine O.', distance: '100m' },
        { step: 'Turn right onto Rue Sainte-Catherine O.', distance: '50m' },
        { step: 'Walk towards the bus stop.', distance: '90m' }
    ];

    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const translateX = useSharedValue(0);

    
    const onGestureEvent = (event: any) => {
        translateX.value = event.translationX;
    };

    const onGestureEnd = () => {
        // If swipe distance is more than half of the screen width, change step
        if (translateX.value > width / 2) {
          setCurrentStepIndex((prevIndex) => Math.min(prevIndex + 1, steps.length - 1));
        } else if (translateX.value < -width / 2) {
          setCurrentStepIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        }
    
        translateX.value = withTiming(0, { duration: 200, easing: Easing.ease });
      };

    return (<View style={styles.container}>
                <View style={styles.directionInformation}>
                    <IconSymbol name="arrow-back" size={50} color="white" style={styles.modeIcon}/>
                    <View style={styles.distanceInformation}>
                        <Text style={styles.nextStep}>{steps[currentStepIndex]?.step || nextStep}</Text>
                        <Text style={styles.distance}>{steps[currentStepIndex]?.distance || distance}</Text>
                    </View>
                </View>
                <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onEnded={onGestureEnd}
                    >
                    <Animated.View
                        style={[
                        styles.swipeableContainer,
                        {
                            transform: [{ translateX: translateX.value }],
                        },
                        ]}
                    >
                        <Text style={styles.nextStep}>{steps[currentStepIndex]?.step}</Text>
                        <Text style={styles.distance}>{steps[currentStepIndex]?.distance}</Text>
                    </Animated.View>
                    </PanGestureHandler>
            </View>
            );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute', 
        top: 0, 
        left: 0,
        right: 0,
        padding: 16,
        marginBottom: 0,
        backgroundColor: 'black',
        alignItems: 'center',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        zIndex: 10, 
    },
    dropdownWrapper: {
        alignItems: "center",
    },
    modeIcon: {
        alignItems: 'center',
        color: 'white',
        padding: 5
    },
    destinationInformation:{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'white',
        width: "90%",
        paddingTop: 10,
    },
    buildingName:{
        fontSize: 20,
        color: 'white',
    },
    address:{
        fontSize:16,
        color: 'white',
    },
    textInformation:{
        paddingLeft: 15,
    },
    directionInformation:{
        flexDirection: 'row',
        width: '90%',
        paddingTop: 25,
    },
    nextStep:{
        fontSize: 20,
        color: 'white',
    },
    distance:{
        fontSize: 20,
        color: 'white',
    },
    distanceInformation:{
        paddingLeft: 15,
    },
    swipeableContainer: {

    }
});