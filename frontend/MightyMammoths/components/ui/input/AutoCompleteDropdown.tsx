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

import { autoCompleteSearch, suggestionResult } from "@/services/searchService";

export interface BuildingData {
  buildingName: string;
  placeID: string;
}

export interface AutoCompleteDropdownRef {
  reset: () => void; // Define the reset function for the ref
}

interface AutoCompleteDropdownProps {
  currentVal?: string;
  buildingData: BuildingData[];
  searchSuggestions: suggestionResult[];
  setSearchSuggestions: React.Dispatch<React.SetStateAction<suggestionResult[]>>;
  onSelect: (selected: string) => void;
  locked: boolean;
}

export const AutoCompleteDropdown = forwardRef<AutoCompleteDropdownRef, AutoCompleteDropdownProps>(({
  currentVal, 
  buildingData, 
  onSelect,
  searchSuggestions,
  setSearchSuggestions,
  locked,
}, ref) => {

  //functions exposed through ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      setSelected("Select a building");
      setIsOpen(false);
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

  const getSuggestions = async (searchQuery: string) => {
    const results = await autoCompleteSearch(searchQuery);
    setSearchSuggestions(results);
  }

  useEffect(() => {
    if (currentVal) {
      setSelected(currentVal)
    }
  }, [currentVal])

  const handleSelect = (placeName: string) => {
    setSelected(placeName);

    if(placeName == "Your Location") {
      onSelect(placeName);    
      setIsOpen(false);
      setSearchQuery("");
      return;
    }

    let selectedLocation = searchSuggestions.find((place) => place.placePrediction.structuredFormat.mainText.text === placeName)
    if(!selectedLocation){
      let building = buildingData.find((item) => item.buildingName == placeName);
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

  return (
    <View style={styles.container}>
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
          renderItem={({ item }) => (
            <Pressable style={styles.option} onPress={() => handleSelect(item)}>
              <Text style={styles.optionText}>{item}</Text>
            </Pressable>
          )}
          contentContainerStyle={{ paddingVertical: 5 }}
        />
      </Animated.View>
    </View>
  );
});

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
});
AutoCompleteDropdown.displayName = "AutoCompleteDropdown";


export default AutoCompleteDropdown;