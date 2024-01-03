import React, { useEffect, useState } from 'react';
import {
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    StyleSheet,
    View,
    Text,
    TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PushNotification, { PushNotificationScheduledLocalObject } from 'react-native-push-notification';
import { formStyle } from '../core/styles/FormStyle';
import { buttonStyle } from '../core/styles/buttonStyles';
import { ICycle, TimeInMs } from '../core/entities/CycleEntity';
import { IReminderEntity } from '../core/entities/ReminderEntity';
import { ReminderRepository } from '../core/domain/ReminderRepository';
import { PERMISSIONS, request } from 'react-native-permissions';

type ReminderProps = {
    currentCycle: ICycle | undefined,
    storedReminderList: IReminderEntity[] | undefined,
    onReminderConfirmed: (reminderItem: IReminderEntity | null) => void
}

const ReminderControl: React.FC<ReminderProps> = ({currentCycle, storedReminderList, onReminderConfirmed}) => {

    const [notifications, setNotifications] = useState<PushNotificationScheduledLocalObject[]>([]);
    const [modalOpened, setModalOpened] = useState(false);
    const [days, setDays] = useState("20");

    useEffect(() => {
      console.log('ReminderControl effect triggered...');
      configureNotificationSetup();
    }, [storedReminderList]);

    const configureNotificationSetup = () => {
      console.log('CONFIGURING PUSH NOTIFICATIONS...');
      console.log('ReminderControl: storedReminders: ', storedReminderList);
      request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
        .then(isGranted => {
          if (isGranted) {
            PushNotification.configure({
                // (optional) Called when Token is generated (iOS and Android)
                onRegister: function (token) {
                console.log("TOKEN:", token);
                },
            
                // (required) Called when a remote is received or opened, or local notification is opened
                onNotification: function (notification) {
                    console.log("NOTIFICATION:", notification);
                },
            
                // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
                onAction: function (notification) {
                    console.log("ACTION:", notification.action);
                    console.log("NOTIFICATION:", notification);
                    // process the action
                },
            
                // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
                onRegistrationError: function(err) {
                    console.error(err.message, err);
                },
            
                // Should the initial notification be popped automatically
                // default: true
                popInitialNotification: true,
            
                /**
                 * (optional) default: true
                 * - Specified if permissions (ios) and token (android and ios) will requested or not,
                 * - if not, you must call PushNotificationsHandler.requestPermissions() later
                 * - if you are not using remote notification or do not have Firebase installed, use this:
                 *     requestPermissions: Platform.OS === 'ios'
                 */
                requestPermissions: true,
            });
            PushNotification.createChannel({
                channelId: "reminders",
                channelName: "Reminders",
                channelDescription: "Reminders that you schedule in the app in relation to current cycle."
            }, () => {});
            
            PushNotification.getScheduledLocalNotifications(list => {
                console.log('Scheduled notification', list);
                setNotifications(list);
            });
      
            if (storedReminderList != undefined) {
              if (storedReminderList.length > 0) {
                setDays(storedReminderList[0].numberOfDays.toString());
                if (notifications.length == 0) {
                  scheduleNotification(storedReminderList[0].numberOfDays);
                }
              } else {
                clearNotifications();
              }
            }

          }
        });
  }

  const clearNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
    setNotifications([]);
    console.log('notifications cleared');
  }

    const scheduleNotification = (days: number) => {
      console.log('displaying notification...');
      if (currentCycle == undefined) {
        console.log('current cycle undefined, not scheduling reminder.');
        return;
      }
      PushNotification.localNotificationSchedule({
        channelId: "reminders", // (required) channelId, if the channel doesn't exist, notification will not trigger.
        title: `You are ${days} days in your current cycle`,
        message: `You may experience your period starting within the next ${28-days} days.`, // (required)
        date: generateDate(days, currentCycle), // in 60 secs
      });
    }

    const generateDate = (days: number, cycle: ICycle): Date => {
      const timestamp: number = cycle.startDate.getTime();
      const newDate = new Date(timestamp + (TimeInMs.Day * days)).setHours(9, 0, 0);
      const alertDate = new Date(newDate);
      return alertDate;
    }

    const onConfirmed = () => {
      const daysNumber = parseInt(days);
      if(daysNumber == 0) {
        return;
      }

      const reminderItem: IReminderEntity = {
        id: 0,
        numberOfDays: daysNumber
      };
      onReminderConfirmed(reminderItem);
      setModalOpened(false);
    }

    const onDeactivate = () => {
      setModalOpened(false);
      onReminderConfirmed(null);
    }


    return (
        <View style={styles.signInSection}>
            <TouchableOpacity
                onPress={() =>setModalOpened(true)}
                style={[styles.googleButton, storedReminderList != undefined && storedReminderList.length > 0 && styles.toggled]}>
                <Icon name={storedReminderList != undefined && storedReminderList.length > 0 ? "notifications-active" : "notifications"} style={styles.googleButtonText}></Icon>
            </TouchableOpacity>
            <Modal
                animationType='fade'
                transparent={true}
                visible={
                    modalOpened}>
                    <TouchableOpacity style={modalStyle.centeredView} onPress={() => setModalOpened(false)}>
                        {storedReminderList != undefined && storedReminderList.length == 0 && 
                          <TouchableWithoutFeedback>
                            <View style={[modalStyle.modalWrapper]}>
                                {notifications.length == 0 && (
                                  <Text style={{fontSize: 30, color: "#343"}}>No reminder set</Text>
                                )}
                                <Text style={{color: "#333333"}}>Please select a number of days in your cycle where you wish to receive a reminder.</Text>
                                <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                  <TextInput 
                                    defaultValue='20'
                                    style={[formStyle.input, formStyle.inputSmall, formStyle.inputText]} 
                                    placeholder="0" 
                                    placeholderTextColor="#333" 
                                    value={days} 
                                    onChangeText={value => setDays(value)} 
                                    keyboardType='numeric' />
                                  <Text style={{color: "#333"}}>Days</Text>
                                </View>
                                <TouchableOpacity style={buttonStyle.primaryBtn} onPress={(e) => onConfirmed()}>
                                    <Text style={buttonStyle.buttonText}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                          </TouchableWithoutFeedback>
                        }
                        {
                          storedReminderList != undefined && storedReminderList.length > 0 &&
                          <TouchableWithoutFeedback>
                            <View style={[modalStyle.modalWrapper]}>
                              { storedReminderList != undefined && storedReminderList.length > 0 &&
                                <Text style={{fontSize: 24, color: "#343", textAlign: "center", marginBottom: 10}}>Reminder activates {storedReminderList[0].numberOfDays} days in cycle</Text>
                              }
                              <Text style={{color: "#333333"}}>Do you want to update or deactivate your reminder?</Text>
                              <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                <TextInput 
                                  defaultValue='20'
                                  style={[formStyle.input, formStyle.inputSmall, formStyle.inputText]} 
                                  placeholder="0" 
                                  placeholderTextColor="#333" 
                                  value={days} 
                                  onChangeText={value => setDays(value)} 
                                  keyboardType='numeric' />
                                <Text style={{color: "#333"}}>Days</Text>
                              </View>
                              <View style={{display: "flex", flexDirection: "row", justifyContent: "space-around"}}>
                                <TouchableOpacity style={[buttonStyle.primaryBtn, buttonStyle.textWrapped, buttonStyle.disabled]} onPress={(e) => onDeactivate()}>
                                    <Text style={buttonStyle.buttonText}>Deactivate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[buttonStyle.primaryBtn, buttonStyle.textWrapped]} onPress={(e) => onConfirmed()}>
                                    <Text style={buttonStyle.buttonText}>Update</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </TouchableWithoutFeedback>
                        }
                    </TouchableOpacity>
            </Modal>
        </View>
    )
}


const styles = StyleSheet.create({
    signInSection: {
      position: "absolute",
      left: 16,
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
    },
    toggled: {
      backgroundColor: "#ECDDFF"
    }
  });
  

const modalStyle = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 0,
        backgroundColor: "#00000099"
    },
    modalWrapper: {
        width: 300,
        minHeight: 150,
        padding: 35,
        borderRadius: 8,
        backgroundColor: "#ffffff",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    }
})

export default ReminderControl;