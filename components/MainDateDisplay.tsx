import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { buttonStyle } from "./../styles";

type MainDateProps = {
    startDate: Date,
    onNewStartDate: () => void
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#FFFFFF"
    },
    mainContent: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center"
    },
    bottom: {
        height: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    descriptionText: {
        fontSize: 20,
        color: "#666666",
        marginVertical: 30
    },
    days: {
        fontSize: 40,
        color: "#000000"
    }
})

const MainDateDisplay: React.FC<MainDateProps> = ({startDate, onNewStartDate}) => {

    const dayCount = 86400000;
    const [days, setDays] = useState(0);

    useEffect(() => {
        calculateDays();
    }, []);

    const calculateDays = () => {
        if (days == 0) {
            const today = new Date().getTime(),
                start = startDate.getTime(),
                difference = Math.floor((today-start)/dayCount);
            setDays(difference);
        }
    }

    return (
        <View style={styles.wrapper}>
            <View style={styles.mainContent}>
                <Text style={styles.descriptionText}>You are currently</Text>
                <Text style={styles.days}>{days}</Text>
                <Text style={styles.descriptionText}>days in your current cycle</Text>
            </View>
            <View style={styles.bottom}>
                <TouchableOpacity style={buttonStyle.primaryBtn} onPress={onNewStartDate}>
                    <Text style={buttonStyle.buttonText}>Start new cycle</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default MainDateDisplay;