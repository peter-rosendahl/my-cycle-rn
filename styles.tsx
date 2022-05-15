import {StyleSheet} from 'react-native';

export const buttonStyle = StyleSheet.create({
    primaryBtn: {
        backgroundColor: "#ECDDFF",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 220,
        // height: 35,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 20,
        elevation: 4
    },
    disabled: {
        backgroundColor: "#EEEEEE"
    },
    buttonText: {
        color: "#333333",
        textAlign: "center"
    }
})