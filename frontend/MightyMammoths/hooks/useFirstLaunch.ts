import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useFirstLaunch() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    const checkIfFirstLaunch = async () => {
        const hasLaunchedBefore = await AsyncStorage.getItem('FIRST_LAUNCH_APP');
        if (!hasLaunchedBefore) {
          setIsFirstLaunch(true);
          await AsyncStorage.setItem('FIRST_LAUNCH_APP', 'true');
          //console.log("FIRST LAUNCH")
        } else {
          setIsFirstLaunch(false);
          //console.log("NOT FIRST LAUNCH")
        }
    };
    checkIfFirstLaunch();
  }, []);

  return isFirstLaunch;
};
