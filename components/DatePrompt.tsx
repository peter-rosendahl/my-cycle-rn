import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
// import DatePicker from 'react-native-datepicker';

const DatePrompt: React.FC<{description: string, buttonText:string, onConfirmed: (date: string) => void}> = ({description, buttonText, onConfirmed}) => {

    const [date, setDate] = useState('');

    return (
        <View style={style.wrapper}>
            <Text style={style.description}>{description}</Text>
            {/* <DatePicker style={style.dateInput}></DatePicker> */}
            <TextInput multiline={true} onChangeText={(e) => setDate(e)} style={style.dateInput} />
            <TouchableOpacity style={style.button} onPress={(e) => onConfirmed(date)}>
                <Text style={style.buttonText}>{buttonText}</Text>
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
        color: "#666666"
    },
    dateInput: {
        elevation: 4,
        backgroundColor: "#ffffff",
        width: 220,
        height: 35,
        padding: 10,
        margin: 25,
        color: "#333333"
    },
    button: {
        backgroundColor: "#DEC4FF",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 120,
        height: 35,
        borderRadius: 50,
        elevation: 4
    },
    buttonText: {
        color: "#333333"
    }
})

export default DatePrompt;