import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  FlatList,
  Animated,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { autoCompleteSearch, SuggestionResult, nearbyPlacesSearch } from "@/services/searchService";
import { BoundingBox } from "react-native-maps";


export interface BuildingData {
  buildingName: string;
  placeID: string;
}

export interface AutoCompleteDropdownRef {
  reset: () => void;
  setValue: (value: string) => void; 
}

interface AutoCompleteDropdownProps {
  currentVal?: string;
  buildingData: BuildingData[];
  searchSuggestions: SuggestionResult[];
  setSearchSuggestions: React.Dispatch<React.SetStateAction<SuggestionResult[]>>;
  onSelect: (selected: string) => void;
  locked: boolean;
  testID?: string;
  onNearbyResults: (results: SuggestionResult[]) => void;
  boundaries: BoundingBox | undefined
  showNearbyButtons?: boolean;
  showCafes: boolean;
  showRestaurants: boolean;
  setShowCafes : React.Dispatch<React.SetStateAction<boolean>>;
  setShowRestaurants : React.Dispatch<React.SetStateAction<boolean>>
}

export const AutoCompleteDropdown = forwardRef<AutoCompleteDropdownRef, AutoCompleteDropdownProps>(({
  currentVal, 
  buildingData, 
  onSelect,
  searchSuggestions,
  setSearchSuggestions,
  locked,
  testID,
  onNearbyResults,
  boundaries,
  showNearbyButtons=false,
  showCafes,
  showRestaurants,
  setShowCafes ,
  setShowRestaurants,
}, ref) => {

  //functions exposed through ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      setSelected("Select a building");
      setIsOpen(false);
    },
    setValue: (value: string) => {
      setSelected(value);
    },
  }));

  const [selected, setSelected] = useState("Select a building");
  const [options, setOptions] = useState([
    "Your Location",
    ...searchSuggestions.map((item) => item.placePrediction.structuredFormat.mainText.text)
  ]);  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(buildingData.map((item) => item.buildingName));
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);
  //const [showCafes, setShowCafes] = useState(false);

  //const [showRestaurants, setShowRestaurants] = useState(false);

  useEffect(() => {
    Animated.timing(dropdownHeight, {
      toValue: isOpen ? Math.min(buildingData.length * 45 + 50, 250) : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();

    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOptions(options);
    } else {
      setFilteredOptions(
        options.filter((option) =>
          option.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, options]);


  useEffect(() => {
    setOptions([
      "Your Location",
      ...searchSuggestions.map((item) => item.placePrediction.structuredFormat.mainText.text)
    ]);
  }, [searchSuggestions]);

  useEffect(() => {
    if (currentVal) {
      setSelected(currentVal)
    }
  }, [currentVal])

  function toRadians(degrees: number) {
    return degrees * Math.PI / 180;
  }
  
  function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371e3; // Earth's radius in meters
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function getRadiusFromBoundingBox(boundingBox: BoundingBox) {
    const { northEast, southWest } = boundingBox;
    // Calculate center of bounding box
    const centerLat = (northEast.latitude + southWest.latitude) / 2;
    const centerLng = (northEast.longitude + southWest.longitude) / 2;
  
    // Calculate radius from center to northEast
    const radius = haversineDistance(centerLat, centerLng, northEast.latitude, northEast.longitude);
    return radius;
  }

  const getNearbySuggestions = async (searchQuery: string, boundaries: BoundingBox | undefined) => {
    if (boundaries){
      const radius = getRadiusFromBoundingBox(boundaries)

    try{
    const results = await nearbyPlacesSearch(searchQuery, radius);
    onNearbyResults(results);}
    catch (err) {
      console.log(err)
    }}
  };

  const getSuggestions = async (searchQuery: string) => {
    const results = await autoCompleteSearch(searchQuery);
    if(results){
      setSearchSuggestions(prevSuggestions => {
        // Optionally filter out duplicates based on a unique property, e.g., placeId
        const newResults = results.filter(newResult => 
          mergeUniqueResults(prevSuggestions, newResult)
        );
        return [...prevSuggestions, ...newResults];
      });
    } else {
      console.log("Failed to get search suggestions.")
    }
  };

  const mergeUniqueResults = (prevSuggestions: SuggestionResult[], newResult: SuggestionResult) => {
    return !prevSuggestions.some(oldResult => 
      oldResult.placePrediction.placeId === newResult.placePrediction.placeId
    )
  };

  const handleSelect = (placeName: string) => {
    setSelected(placeName);

    if(placeName === "Your Location") {
        onSelect(placeName);    
        setIsOpen(false);
        setSearchQuery("");
        return;
    }

    let selectedLocation = searchSuggestions.find((place) => place.placePrediction.structuredFormat.mainText.text === placeName)
    if(!selectedLocation){
      let building = buildingData.find((item) => item.buildingName === placeName);
      if(!building){
        console.log('AutoCompleteDropdown: failed to fetch data for selected location');
        return;
      }else{
        onSelect(building.buildingName);
      }
    }else{
      onSelect(selectedLocation.placePrediction.structuredFormat.mainText.text);
    }
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleFindNearbyCoffee = () => {
    //setShowCafes(prevState => !prevState);
    if (!showCafes) {
      //console.log("Showing Cafes 47377");
      setShowRestaurants(false);
      getNearbySuggestions("cafe", boundaries);
    } else {
      //console.log("Hiding Cafes");
    }
    setShowCafes(prevState => !prevState);
  };

  const handleFindNearbyRestaurants = () => {
    //setShowRestaurants(prevState => !prevState);
    if (!showRestaurants) {
      //console.log("Showing Restaurants");
      setShowCafes(false);
      getNearbySuggestions("restaurant", boundaries);
    } else {
      //console.log("Hiding Restaurants");
    }
    setShowRestaurants(prevState => !prevState);
    };

  return (
    <View style={styles.container} testID={testID}>
      <Pressable style={styles.dropdownContainer} onPress={() => {
          if(!locked){setIsOpen(!isOpen)}
        }}>
        <Image
          source={{
            uri: "https://www.concordia.ca/content/concordia/en/social/guidelines-conduct.img.png/1650398601839.png",
          }}
          style={styles.logo}
        />
        <Text style={styles.selectedText}>{selected}</Text>
        <MaterialIcons
          name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color="#555"
          style={styles.arrow}
        />
      </Pressable>

      <Animated.View
        style={[styles.dropdownList, { width:350, height: dropdownHeight, display: isOpen ? "flex" : "none" }]}
      >
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search for a building..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={(event) => {
            getSuggestions(event.nativeEvent.text)
          }}
        />
        
      <FlatList
        data={filteredOptions}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => {
          // Remove 'building' regardless of case and trim any extra whitespace
          const cleanedItem = item.replace(/Building/g, '').trim();
          return (
            <Pressable style={styles.option} onPress={() => handleSelect(item)}>
              <Text style={styles.optionText}>{cleanedItem}</Text>
            </Pressable>
          );
        }}
        contentContainerStyle={{ paddingVertical: 5 }}
      />
      {showNearbyButtons && (
        <View style={styles.buttonContainer}>
          <Pressable style={[styles.actionButton, showCafes && styles.activeButton]} 
        onPress={handleFindNearbyCoffee}>
            <Text style={styles.buttonText}>{showCafes ? "Hide Cafes" : "Show Cafes"}</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, showRestaurants && styles.activeButton]} 
        onPress={handleFindNearbyRestaurants}>
            <Text style={styles.buttonText}>{showRestaurants ? "Hide Restaurants" : "Show Restaurants"}</Text>
          </Pressable>
        </View>
      )}
      </Animated.View>
    </View>
  );
});
AutoCompleteDropdown.displayName = "AutoCompleteDropdown";

const styles = StyleSheet.create({
  container: {
    width: 280,
    position: "relative",
    alignSelf: "center",
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#d1d1d1",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: 350
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  selectedText: {
    fontSize: 16,
    color: "#555",
    flex: 1,
  },
  arrow: {
    marginLeft: 10,
  },
  dropdownList: {
    backgroundColor: "white",
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#d1d1d1",
    overflow: "hidden",
    position: 'absolute',
    zIndex: 1000,
    width: 280,
    top: '100%'
  },
  searchInput: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd"
  },
  actionButton: {
    width: "45%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "darkblue",
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeButton: {
    backgroundColor: "darkgreen"
  ,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  }
});
AutoCompleteDropdown.displayName = "AutoCompleteDropdown";


export default AutoCompleteDropdown;