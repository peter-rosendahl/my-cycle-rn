import { StyleSheet } from "react-native";

export const modalStyle = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 0,
        backgroundColor: "#00000099"
    },
    modalWrapper: {
        width: 300,
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
    },
    modalInner: {
        alignItems: "center"
    }
})