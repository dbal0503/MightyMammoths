import { Pressable, type PressableProps, StyleSheet, View, Image } from "react-native"


export type RoundButtonProps = PressableProps & {
    imageSrc: any; //path to svg asset
    size?: number; //diameter of the button
    onPress?: () => void;
}

export default function RoundButton({
    imageSrc,
    size = 52,
    onPress
} : RoundButtonProps){
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