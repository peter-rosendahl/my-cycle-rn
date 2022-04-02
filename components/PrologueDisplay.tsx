import React, {useState} from 'react';
import {
    View,
    StyleSheet
} from 'react-native';
import DatePrompt from './DatePrompt';

type Props = {
    onStartDateConfirmed: (startDate: Date) => void
}

const intro = StyleSheet.create({
    wrapper: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#ffffff"
    },
    description: {
      color: "#333333"
    }
  })

const Prologue: React.FC<Props> = ({onStartDateConfirmed}) => {
    return (
        <View style={intro.wrapper}>
            <DatePrompt 
            description='Please enter the start date of your period:'
            buttonText='Confirm'
            onConfirmed={onStartDateConfirmed} />
        </View>
    )
}

export default Prologue;