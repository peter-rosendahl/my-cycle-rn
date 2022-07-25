import {StyleSheet} from 'react-native';

export const buttonStyle = StyleSheet.create({
    primaryBtn: {
        backgroundColor: "#ECDDFF",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: 220,
        // height: 35,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 20,
        elevation: 4
    },
    textWrapped: {
        flex: 1,
        marginHorizontal: 5
    },
    disabled: {
        backgroundColor: "#EEEEEE"
    },
    buttonText: {
        color: "#333333",
        textAlign: "center"
    }
})