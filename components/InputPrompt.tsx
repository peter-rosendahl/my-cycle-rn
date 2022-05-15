import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { buttonStyle } from '../styles';

const InputPrompt: React.FC<{description: string, placeholderText: string, buttonText:string, onConfirmed: (value: string) => void}> = ({description, placeholderText, buttonText, onConfirmed}) => {

    const [value, setValue] = useState("");

    return (
        <View style={style.wrapper}>
            <Text style={style.description}>{description}</Text>
            <TextInput multiline={true} autoFocus={true} placeholder={placeholderText} placeholderTextColor="#999999" onChangeText={(e) => setValue(e)} style={style.textInput} />
            <TouchableOpacity style={buttonStyle.primaryBtn} onPress={(e) => onConfirmed(value)}>
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
    textInput: {
        elevation: 4,
        backgroundColor: "#ffffff",
        color: "#333333",
        width: 220,
        height: 35,
        padding: 10,
        margin: 25
    }
})

export default InputPrompt;