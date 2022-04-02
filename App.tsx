/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './components/Header';
import Prologue from './components/PrologueDisplay';
import MainDateDisplay from './components/MainDateDisplay';

// const Section: React.FC<{
//   title: string;
// }> = ({children, title}) => {
//   const isDarkMode = useColorScheme() === 'dark';
//   return (
//     <View style={styles.sectionContainer}>
//       <Text
//         style={[
//           styles.sectionTitle,
//           {
//             color: isDarkMode ? Colors.white : Colors.black,
//           },
//         ]}>
//         {title}
//       </Text>
//       <Text
//         style={[
//           styles.sectionDescription,
//           {
//             color: isDarkMode ? Colors.light : Colors.dark,
//           },
//         ]}>
//         {children}
//       </Text>
//     </View>
//   );
// };

const App = () => {

  const [isStartDateCreated, setIsStartDateCreated] = useState(false);
  const [startDate, setStartDate] = useState<Date>();

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.lighter : Colors.lighter,
    flex: 1
  };

  const onStartDateConfirmed = (value: Date) => {
    storeStartDate(value).then(result => {
      setStartDate(value);
      setIsStartDateCreated(true);
    });  
  }

  const onReset = () => {
    readStartDate().then(result => {
      console.log('onReset.', result);
    })
    setStartDate(new Date());
    setIsStartDateCreated(false);
  }

  const storeStartDate = async(value: Date) => {
    try {
      const jsonValue = JSON.stringify(value)
      console.log('storeStartDate: value to storage: ', jsonValue);
      return await AsyncStorage.setItem('@start_date', jsonValue);
    } catch (e) {
      // saving error
      console.log('storeStartDate: error', e);
    }
  }

  const readStartDate = async() => {
    try {
      return await AsyncStorage.getItem('@storage_Key');
    } catch(e) {
      // error reading value
      console.log('readStartDate: error', e);
    }
  }

  useEffect(() => {
    readStartDate().then(result => {
      console.log('result', result);
      if (result != undefined) {
        const date = new Date(result);
        setStartDate(date);
      }
    });
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
        <Header title="My Cycle" />
        {!isStartDateCreated && 
          <Prologue onStartDateConfirmed={onStartDateConfirmed}></Prologue>
        }
        {isStartDateCreated && startDate != undefined &&
          <MainDateDisplay startDate={startDate} onNewStartDate={onReset}></MainDateDisplay>
        }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
