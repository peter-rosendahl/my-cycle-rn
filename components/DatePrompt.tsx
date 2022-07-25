import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { buttonStyle } from '../core/styles/buttonStyles';

const DatePrompt: React.FC<{description: string, buttonText:string, onConfirmed: (date: Date) => void}> = ({description, buttonText, onConfirmed}) => {

    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false);

    return (
        <View style={style.wrapper}>
            <Text style={style.description}>{description}</Text>
            <DatePicker 
                style={style.dateInput}
                date={date}
                mode="date"
                onDateChange={setDate} />
            {/* <TextInput multiline={true} onChangeText={(e) => setDate(e)} style={style.dateInput} /> */}
            <TouchableOpacity style={buttonStyle.primaryBtn} onPress={(e) => onConfirmed(date)}>
                <Text style={buttonStyle.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
        </View>
    )
}

const style = StyleSheet.create({
    wrapper: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    description: {
        color: "#666666",
        marginBottom: 20,
        textAlign: "center"
    },
    dateInput: {
        elevation: 4,
        backgroundColor: "#ffffff",
        width: 220,
        height: 35,
        padding: 10,
        margin: 25
    }
})

export default DatePrompt;