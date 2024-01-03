import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, {useState, useEffect} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PushNotification from 'react-native-push-notification';

import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from 'react-native';


GoogleSignin.configure({
    webClientId: "888189098954-hjuhcb54ovpens07io0jj56jjukkna3r.apps.googleusercontent.com"
})

type AuthProps = {
    auth: any,
    onSignOut: () => void,
    user: FirebaseAuthTypes.User | undefined
}


const Auth: React.FC<AuthProps> = ({auth, onSignOut, user}) => {
    

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

    return (
        <View style={styles.signInSection}>
          {user == null && 
            <View style={{maxWidth: 300, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center"}}>
              {/* <Text style={styles.googleButtonText}>Please sign in if you want your information to be stored online.</Text> */}
              <TouchableOpacity style={styles.googleButton} onPress={onGoogleSigninPressed}>
                {/* <Text style={styles.googleButtonText}>Sign in with Google</Text> */}
                <Icon name='login' style={styles.googleButtonText}></Icon>
              </TouchableOpacity>
            </View>
          }
          {user != undefined && 
            <View style={{display: "flex", flexDirection: "row", alignItems: "center", height: 50}}>
              <TouchableOpacity style={styles.googleButton} onPress={onSignOut}>
                <Icon name="logout" style={styles.googleButtonText}></Icon>
              </TouchableOpacity>
            </View>
          }
        </View>
    )
}

const styles = StyleSheet.create({
    signInSection: {
      position: "absolute",
      right: 16,
      top: 16,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      height: 150
    },
    googleButton: {
      borderRadius: 25,
      backgroundColor: "#FFFFFF",
      elevation: 4,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: 50,
      height: 50
    },
    googleButtonText: {
      // textAlign: "center",
      color: "#333333",
      fontSize: 18
    }
  });

export default Auth;