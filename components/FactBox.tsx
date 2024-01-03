import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextStyle
} from 'react-native';

type FactBoxProps = {
    title: string;
    value: string | number | undefined;
    subtitle: string;
    isBigger: boolean;
    customStyles?: TextStyle
}

const FactBox: React.FC<FactBoxProps> = ({title, value, subtitle, isBigger, customStyles}) => {
    return (
        <View style={[style.box, customStyles]}>
            <Text style={[style.titleText, style.darkText]}>{title}</Text>
            <Text style={[style.valueText, style.darkText, isBigger ? style.biggerText : null]}>{value}</Text>
            <Text style={[style.subtitleText, style.darkText]}>{subtitle}</Text>
        </View>
    )
};

export default FactBox;

const style = StyleSheet.create({
    box: {
        display: "flex",
        padding: 10,
        width: 135,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 0,
        backgroundColor: "#FFFFFFFF",
        borderColor: "#DEC4FFFF",
        borderWidth: 1,
        borderRadius: 8,
        elevation: 20
    },
    darkBg: {
        backgroundColor: "#7D00D1FF"
    },
    titleText: {
        fontSize: 15,
        textAlign: "center"
    },
    biggerText: {
        fontSize: 24,
        fontWeight: "600"
    },
    darkText: {
        color: "#000000FF"
    },
    valueText: {
        fontSize: 21
    },
    subtitleText: {
        fontSize: 15
    }
})

