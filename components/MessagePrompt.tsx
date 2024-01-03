import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { buttonStyle } from '../core/styles/buttonStyles';

const MessagePrompt: React.FC<{description: string, buttonText:string, onConfirmed: () => void}> = ({description, buttonText, onConfirmed}) => {

    return (
        <View style={style.wrapper}>
            <Text style={style.description}>{description}</Text>
            <TouchableOpacity style={buttonStyle.primaryBtn} onPress={(e) => onConfirmed()}>
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
        marginBottom: 20
    }
})

export default MessagePrompt;