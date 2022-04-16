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
  TouchableOpacity
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './components/Header';
import Prologue from './components/PrologueDisplay';
import MainDateDisplay from './components/MainDateDisplay';
import { CycleRepository } from './core/domain/CycleRepository';
import { ICycle, IDateRecord } from './core/entities/CycleEntity';



GoogleSignin.configure({
  webClientId: "888189098954-hjuhcb54ovpens07io0jj56jjukkna3r.apps.googleusercontent.com"
})

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

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [currentCycle, setCurrentCycle] = useState<ICycle>();
  const [isStartDateCreated, setIsStartDateCreated] = useState(false);
  const [startDate, setStartDate] = useState<Date>();

  const isDarkMode = useColorScheme() === 'dark';

  const cycleRepo = new CycleRepository();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.lighter : Colors.lighter,
    flex: 1
  };

  const onStartDateConfirmed = (value: Date) => {
    storeStartDate(value).then(result => {
      const cycle: ICycle = {startDate: value, endDate: null, periodEndDate: null};
      setCurrentCycle(cycle);
      setStartDate(value);
      setIsStartDateCreated(true);
    });  
  }

  const onPeriodStopped = (date: Date) => {
    console.log('onPeriodStopped', date, user, currentCycle);
    if (currentCycle != undefined) {
      const updatedCycle: ICycle = {...currentCycle};
      updatedCycle.periodEndDate = date;
      console.log('onPeriodStopped: Updating cycle: ', updatedCycle);
      setCurrentCycle(updatedCycle);
      if (user != undefined) {
        cycleRepo.updateCurrentCycle(user.uid, updatedCycle)
          .then(result => {
            console.log('onPeriodStopped: success', result);
          })
          .catch(error => {
            console.log('onPeriodStopped: error occured', error);
          })
      }
    }
  }

  const onReset = (newStartDate: Date) => {
    console.log(`onReset: In function, value: ${newStartDate}`);
    if (user != undefined && currentCycle != undefined) {
      // setStartDate(new Date());
      // setIsStartDateCreated(false);
      const cycleRecord: ICycle = {
        startDate: currentCycle.startDate,
        periodEndDate: currentCycle.periodEndDate,
        endDate: newStartDate
      };
      console.log(`onReset: cycle to be stored in history: ${cycleRecord}`);
      cycleRepo.getCycleHistory(user.uid)
        .then(history => {
          console.log(`onReset.getCycleHistory: history snapshot: ${history}`);
          let cycleIndex = 0;
          if (history != undefined && history.docs.length > 0) {
            cycleIndex = history.docs.length;
          }
          cycleRepo.addCycleToHistory(user.uid, cycleIndex, cycleRecord)
            .then(result => {
              console.log(`onReset.addCycleToHistory: getting cycle records...`);
              cycleRepo.getCycleRecords(user.uid).then(records => {
                console.log(`onReset.getCycleRecords: result: ${records}`);
                if (records != undefined && records.docs.length > 0) {
                  records.docs.forEach((doc, recordIndex) => {
                    const record = doc.data() as IDateRecord;
                    cycleRepo.addDateRecordsToHistory(user.uid, cycleIndex, recordIndex, record);
                  })
                }
              })
              .finally(() => {
                console.log('onReset.getCycleRecords.finally: clearing history...');
                cycleRepo.clearRecords(user.uid, () => {
                  console.log(`onReset.clearHistory: In callback function after clearing history...`);
                  onStartDateConfirmed(newStartDate);
                })
              })
            })
        })
    } else if (currentCycle != undefined) {
      onStartDateConfirmed(newStartDate);
    } else {
      setIsStartDateCreated(false);
    }
  }

  const storeStartDate = async(value: Date) => {
    if (user != undefined) {
      return cycleRepo.startCurrentCycle(user.uid, value);
    } else {
      return Promise.resolve();
    }
  }

  const readStartDate = async(user: FirebaseAuthTypes.User) => {
    if (user != undefined) {
      return cycleRepo.getCurrentCycle(user.uid);
    } else {
      return Promise.reject();
    }
  }

  const listenToAuthentication = () => {
    console.log('listenToAuthentication: In function...');
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }

  function onAuthStateChanged(user: any) {
    console.log('onAuthStateChanged: In function', user);
    if (user != undefined) {
      if (isAuthenticated) return;
      setIsAuthenticated(true);
      setUser(user);
      readStartDate(user)
      .then(result => {
        console.log('onAuthStateChanged.readStartDate: result from collection', result);
        if (result != undefined && result.exists) {
          const currentCycle = result.data();
          if (currentCycle != undefined) {
            const cycle: any = {...currentCycle};
            cycle.startDate = currentCycle.startDate.toDate();
            if (cycle.periodEndDate != undefined) {
              cycle.periodEndDate = currentCycle?.periodEndDate?.toDate();
            }
  
            console.log('onAuthStateChanged.readStartDate: Setting cycle', cycle);
            setStartDate(currentCycle.startDate.toDate());
            setCurrentCycle(cycle);
            setIsStartDateCreated(true);
          }
        }
      })
    } else {
      setIsAuthenticated(false);
    }
    if (initializing) setInitializing(false);
  }

  const onGoogleSigninPressed = () => {
    signInWithGoogle()
    .then(userCredential => {
      console.log('onGoogleSigninPressed: signed in success.', userCredential);
    })
    .catch(error => {
      console.log('onGoogleSigninPressed: error occured', error);
    })
  }

  const signInWithGoogle = async() => {
    // Get the users ID token
    console.log('signInWithGoogle: Attempting to signin...');
    const { idToken } = await GoogleSignin.signIn();

    console.log('signInWithGoogle: Got idToken', idToken);
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    console.log('signInWithGoogle: signing in with credential', googleCredential);
    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }

  const signOut = () => {
    auth().signOut().then(() => {
      setUser(undefined);
    });
  }

  useEffect(() => {
    console.log('starting', user);
    listenToAuthentication();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
        <Header title="My Cycle" />
        <View style={styles.signInSection}>
          {user == null && 
            <View style={{maxWidth: 300, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center"}}>
              <Text style={styles.googleButtonText}>Please sign in if you want your information to be stored online.</Text>
              <TouchableOpacity style={styles.googleButton} onPress={onGoogleSigninPressed}>
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </TouchableOpacity>
            </View>
          }
          {user != undefined && 
            <View>
              <Text style={styles.googleButtonText}>Signed in as: {user.displayName}</Text>
              <TouchableOpacity style={styles.googleButton} onPress={signOut}>
                <Text style={styles.googleButtonText}>Sign out</Text>
              </TouchableOpacity>
            </View>
          }
        </View>
        {!isStartDateCreated && 
          <Prologue onStartDateConfirmed={onStartDateConfirmed}></Prologue>
        }
        {isStartDateCreated && currentCycle != undefined &&
          <MainDateDisplay 
            uid={user?.uid}
            currentCycle={currentCycle} 
            onNewStartDate={onReset} 
            onPeriodStopped={onPeriodStopped}></MainDateDisplay>
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
  signInSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#ffffff",
    height: 150
  },
  googleButton: {
    borderRadius: 25,
    marginTop: 25,
    backgroundColor: "#FFFFFF",
    elevation: 4,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 220,
    height: 48
  },
  googleButtonText: {
    textAlign: "center",
    color: "#333333"
  }
});

export default App;
