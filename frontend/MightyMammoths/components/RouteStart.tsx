import React from "react";
import {StyleSheet,Text,View,TouchableOpacity} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
interface StartNavigationProps {
    transportationChoice: string | null;
    setTransportationChoice: React.Dispatch<React.SetStateAction<string | null>>;
    onBack: ()=> void; 
    destinationBuilding: any
    routes: any
    starting: ()=> void;
    defPoly:()=>void;
}

export function StartNavigation({
    onBack,
    defPoly,
    starting,
    routes,
    destinationBuilding
}: StartNavigationProps) {

    const setModeNull = () => {onBack();}
    const startNavigation = () => {starting(); defPoly();}
    const estimates = routes;
    const bestEstimate = estimates && estimates.length > 0 ? estimates[0] : null;

    return ( 
        <View style={styles.container}>
            <TouchableOpacity onPress={setModeNull}>
                <IconSymbol name="arrow-back" size={50} color="black" style={styles.modeIcon}/>
            </TouchableOpacity>
            <View style={styles.destinationInformation}>
                <Text style={styles.routeHeading}>Routes to</Text>
                <Text style={styles.routeHeadingDestination}>{destinationBuilding}</Text>
                <View style={styles.travelInformation}>
                    <Text style={styles.time}>{bestEstimate.duration}</Text>
                    <Text style={styles.distance}>{bestEstimate.distance}</Text>
                </View>
                <TouchableOpacity style={styles.startButton} onPress={startNavigation}>
                    <IconSymbol name='play' size={40} color="black" style={styles.navigationIcon} />
                    <Text style={styles.start}>Start</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '60%',
        width: '100%',
        padding: 16,
        marginBottom:0,
        flexDirection: 'row',
        borderBottomLeftRadius:10,
        borderBottomRightRadius:10,
        backgroundColor: 'black',
      },
    dropdownWrapper: {
        alignItems: "center",
    },
    modeIcon: {
        alignItems: 'center',
        color: 'black',
        padding: 5,
        backgroundColor: 'white',
        borderRadius: 20,
        height:'22%'
    },
    routeHeading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 0,
        color: 'white',
    },
    routeHeadingDestination: {
        fontSize: 20,
        marginBottom: 8,
        color: 'white',
    },
    destinationInformation: {
        width: '80%',
        paddingLeft: 20,
    },
    travelInformation:{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 20,
    },
    time:{
        fontSize:20,
        fontWeight: 'bold',
        color: 'white',
        paddingRight: 40
    },
    distance:{
        fontSize:18,
        color: 'white',
    },
    startButton:{
        marginTop:40,
        backgroundColor: 'blue',
        borderRadius: 20,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
    },
    navigationIcon: {
        paddingLeft: 20
    },
    start:{
        paddingLeft:15,
        fontSize: 23,
        color: 'white',
    },
});
