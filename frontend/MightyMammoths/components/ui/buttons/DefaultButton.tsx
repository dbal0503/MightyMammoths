import { Pressable, type PressableProps, StyleSheet, View, Image } from "react-native"
import { SvgUri } from "react-native-svg";

export type DefaultButtonProps = PressableProps & {
    imageSrc: any; //path to svg asset
    size?: number; //diameter of the button
    onPress?: () => void;
}

export default function DefaultButton({
    imageSrc,
    size = 50,
    onPress
} : DefaultButtonProps){
    const imageSize = size * 0.7;
    return (
        <Pressable onPress={onPress} 
        style={({ pressed }) => [
            styles.button,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: pressed ? 0.5 : 1,
            },
          ]}>
            <View style={[
            styles.button,
            {
                width: size,
                height: size,
                borderRadius: size / 2
            }
        ]}>
                <Image source={imageSrc} style={{width: imageSize, height: imageSize}}/>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: "#d1d1d1",
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      backgroundColor: 'white',
    },
  });