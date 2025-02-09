// components/RouteStart.tsx
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { RouteData } from "@/services/directionsService";
import { useRouter } from "expo-router";

interface StartNavigationProps {
  mode: string;
  routes: RouteData[];
  onSelectRoute: (route: RouteData) => void;
  onBack: () => void;
  destinationBuilding: string | null;
}

export function StartNavigation({
  mode,
  routes,
  onSelectRoute,
  onBack,
  destinationBuilding
}: StartNavigationProps) {
  const router = useRouter();

  const handleStartNavigation = () => {
    if (destinationBuilding) {
        router.push({
            pathname: "/directions",
            params: { destination: destinationBuilding }, // Send destination as query param
        });
    } else {
        router.push("/directions");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.information}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <IconSymbol name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
        <View style={styles.text}>
            <Text style={styles.route}>Routes to</Text>
            <Text style={styles.destinationBuilding}>{destinationBuilding}</Text>
        </View>
      </View>
      <Text style={styles.heading}>Select a Route for {mode}</Text>
      <FlatList
        data={routes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.routeItem}
            onPress={() => {
                onSelectRoute(item)
                handleStartNavigation();
            }}
          >
            <Text style={styles.routeText}>
              {item.duration} – {item.distance}
            </Text>
          </TouchableOpacity>
        )}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    padding: 16,
    backgroundColor: "black",
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '15%',
    color: 'black',
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 20,
    height:'80%',
    marginBottom: 10,
    marginRight: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  routeItem: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  routeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "blue",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  startText: {
    fontSize: 18,
    color: "white",
    marginLeft: 10,
  },
  information:{
    flexDirection:'row',
    width:'100%',
    height: '15%',
    
  },
  destinationBuilding:{
    fontSize:20,
    color: 'white'
  },
  text:{},
  route:{
    fontSize: 22,
    color: 'white',
    fontWeight: 'normal'
  }
});