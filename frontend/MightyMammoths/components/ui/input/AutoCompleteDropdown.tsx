import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  FlatList,
  Animated,
  TextInput,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
  const [options, setOptions] = useState(["Your Location", ...searchSuggestions.map((item) => item.placePrediction.structuredFormat.mainText.text), ...buildingData.map((item)=>item.buildingName)])
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(buildingData.map((item) => item.buildingName));
  const searchInputRef = useRef<TextInput>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<View>(null);

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

  useEffect(()=>{
    setOptions(["Your Location", ...searchSuggestions.map((item) => item.placePrediction.structuredFormat.mainText.text), ...buildingData.map((item) => item.buildingName)])
  }, [searchSuggestions])

  const getSuggestions = async (searchQuery: string) => {
    const results = await autoCompleteSearch(searchQuery);
    setSearchSuggestions(results);
  }

  useEffect(() => {
    if (currentVal) {
      setSelected(currentVal)
    }
  }, [currentVal])

  //Calulate where modal position needs to be
  const measureDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          top: pageY + height - 20,
          left: pageX,
          width: width
        });
      });
    }
  };

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
      <Pressable ref={dropdownRef}style={styles.dropdownContainer} onPress={() => {
          if (!locked) {
            measureDropdown();
            setIsOpen(!isOpen);
          }
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

      <Modal visible={isOpen} transparent={true} animationType="none" onRequestClose={() => setIsOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View 
                style={[
                  styles.dropdownList, 
                  { 
                    top: dropdownPosition.top, 
                    left: dropdownPosition.left,
                    width: dropdownPosition.width 
                  }
                ]}
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
                  autoFocus={true}
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
                  style={{ maxHeight: 200 }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dropdownList: {
    position: 'absolute',
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d1d1",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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

export default AutoCompleteDropdown;