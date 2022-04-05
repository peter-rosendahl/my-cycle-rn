import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { CycleRepository } from '../core/domain/CycleRepository';
import { ICycle, IDateRecord } from '../core/entities/CycleEntity';
import { buttonStyle } from "./../styles";

type MainDateProps = {
    uid: string,
    currentCycle: ICycle,
    onNewStartDate: () => void,
    onPeriodStopped: (date: Date) => void,
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
        flexGrow: 1,
        alignItems: "center"
    },
    bottom: {
        height: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        marginBottom: 50
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

const MainDateDisplay: React.FC<MainDateProps> = ({uid, currentCycle, onNewStartDate, onPeriodStopped}) => {

    const cycleRepo = new CycleRepository();
    const dayCount = 86400000;
    const [daysFromStart, setDaysFromStart] = useState(0);
    const [daysFromPeriodStopped, setDaysFromPeriodStopped] = useState(0);

    useEffect(() => {
        calculateDays();
    }, []);

    const calculateDays = () => {
        const today = new Date().getTime();
        if (daysFromStart == 0) {
            const start = currentCycle.startDate?.getTime(),
                difference = Math.floor((today-start)/dayCount);
            setDaysFromStart(difference);
        }
        if (daysFromPeriodStopped == 0 && currentCycle.periodEndDate != undefined) {
            const stopped = currentCycle.periodEndDate.getTime(),
                difference = Math.floor((today-stopped)/dayCount);
            setDaysFromPeriodStopped(difference);
        }
    }

    const requestPeriodStopped = () => {
        const date = new Date();
        console.log('requestPeriodStopped');
        onPeriodStopped(date);
    }

    const notifyOvulation = () => {
        console.log('notifyOvulation');
        const record: IDateRecord = {
            recordDate: new Date(),
            recordType: "Ovulation"
        }
        addRecordToCycle(record);
    }

    const notifySpotBleed = () => {
        console.log('notifySpotBleed');
        const record: IDateRecord = {
            recordDate: new Date(),
            recordType: "Spot bleed"
        }
        addRecordToCycle(record);
    }

    const addRecordToCycle = (record: IDateRecord) => {
        cycleRepo.getCycleRecords(uid)
            .then(collection => {
                let index = 0;
                if (collection != undefined && collection.docs.length > 0) {
                    index = collection.docs.length;
                }
                cycleRepo.addRecordToCycle(uid, index, record)
                    .then(result => {
                        console.log('addRecordToCycle', 'success', result);
                    })
            })
    }

    return (
        <View style={styles.wrapper}>
            <ScrollView contentContainerStyle={styles.mainContent}>
                <Text style={styles.descriptionText}>You are currently</Text>
                <Text style={styles.days}>{daysFromStart}</Text>
                <Text style={styles.descriptionText}>days in your current cycle</Text>
                {currentCycle.periodEndDate != undefined &&
                    <Text style={styles.descriptionText}><Text style={{fontWeight: "900"}}>{daysFromPeriodStopped}</Text> days since your period stopped</Text>
                }
                <Text style={styles.descriptionText}>Current cycle started {currentCycle.startDate.toDateString()}</Text>
                {currentCycle.periodEndDate != undefined &&
                    <View>
                        <TouchableOpacity style={[buttonStyle.primaryBtn, {marginBottom: 10}]} onPress={notifyOvulation}>
                            <Text style={buttonStyle.buttonText}>Ovulating</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[buttonStyle.primaryBtn, {marginBottom: 10}]} onPress={notifySpotBleed}>
                            <Text style={buttonStyle.buttonText}>Spot bleeding</Text>
                        </TouchableOpacity>
                    </View>
                }
            </ScrollView>
            <View style={styles.bottom}>
                {currentCycle.periodEndDate == undefined && 
                    <TouchableOpacity style={buttonStyle.primaryBtn} onPress={requestPeriodStopped}>
                        <Text style={buttonStyle.buttonText}>My period stopped</Text>
                    </TouchableOpacity>
                }
                {currentCycle.periodEndDate != undefined &&
                    <TouchableOpacity style={buttonStyle.primaryBtn} onPress={onNewStartDate}>
                        <Text style={buttonStyle.buttonText}>Start new cycle</Text>
                    </TouchableOpacity>
                }
            </View>
        </View>
    )
}

export default MainDateDisplay;