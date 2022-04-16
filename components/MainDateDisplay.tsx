import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal
} from 'react-native';
import { CycleRepository } from '../core/domain/CycleRepository';
import { ICycle, IDateRecord, RecordType } from '../core/entities/CycleEntity';
import { buttonStyle } from "./../styles";
import DatePrompt from './DatePrompt';
import MessagePrompt from './MessagePrompt';

type MainDateProps = {
    uid?: string,
    currentCycle: ICycle,
    onNewStartDate: (newStartDate: Date) => void,
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
        color: "#666666"
    },
    smaller: {
        fontSize: 16
    },
    pTop: {
        paddingTop: 30
    },
    pBottom: {
        paddingBottom: 30
    },
    days: {
        fontSize: 40,
        color: "#000000"
    }
})

const modalStyle = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
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
    }
})

const MainDateDisplay: React.FC<MainDateProps> = ({uid, currentCycle, onNewStartDate, onPeriodStopped}) => {

    const cycleRepo = new CycleRepository();
    const dayCount = 86400000;
    const [daysFromStart, setDaysFromStart] = useState(0);
    const [daysFromPeriodStopped, setDaysFromPeriodStopped] = useState(0);
    const [modalDisplayed, setModalDisplayed] = useState<RecordType | "periodStopped" | "newCycle" | undefined>(undefined);

    useEffect(() => {
        calculateDays();
    }, [currentCycle]);

    const calculateDays = () => {
        console.log('calculateDays: Triggered', currentCycle);
        const today = new Date().getTime();
        const start = currentCycle.startDate?.getTime(),
            difference = Math.floor((today-start)/dayCount);
        setDaysFromStart(difference);
        if (currentCycle.periodEndDate != undefined) {
            console.log('calculateDays: period has stopped on date: ', currentCycle.periodEndDate);
            const stopped = currentCycle.periodEndDate.getTime(),
                difference = Math.floor((today-stopped)/dayCount);
            console.log(`calculateDays, stopped: ${stopped}, today: ${today}, difference: ${today-stopped}, in days: ${difference}`);
            setDaysFromPeriodStopped(difference);
        }
    }

    const notifyOvulation = () => {
        console.log('notifyOvulation');
        setModalDisplayed("Ovulation");
        const record: IDateRecord = {
            recordDate: new Date(),
            recordType: "Ovulation"
        }
        addRecordToCycle(record);
    }

    const notifySpotBleed = () => {
        console.log('notifySpotBleed');
        setModalDisplayed("Spot bleed");
        const record: IDateRecord = {
            recordDate: new Date(),
            recordType: "Spot bleed"
        }
        addRecordToCycle(record);
    }

    const addRecordToCycle = (record: IDateRecord) => {
        if (uid != undefined) {
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
    }

    const openModal = (type: RecordType | "newCycle" | "periodStopped") => {
        setModalDisplayed(type);
    }

    const onMessageModalConfirmed = () => {
        console.log('onMessageModalConfirmed');
        setModalDisplayed(undefined);
    }

    const onDateModalConfirmed = (value: Date) => {
        console.log(`onDateModalConfirmed: dateValue ${value}, type: ${modalDisplayed}`);
        switch (modalDisplayed) {
            case "periodStopped": {
                onPeriodStopped(value);
                break;
            }
            case "newCycle": {
                onNewStartDate(value);
            }
        }
        setModalDisplayed(undefined);
    }

    return (
        <View style={styles.wrapper}>
            <ScrollView contentContainerStyle={styles.mainContent}>
                <Text style={[styles.descriptionText, styles.pBottom]}>You are currently</Text>
                <Text style={styles.days}>{daysFromStart}</Text>
                <Text style={[styles.descriptionText, styles.pTop]}>days in your current cycle</Text>
                {currentCycle.periodEndDate != undefined &&
                    <Text style={[styles.descriptionText, styles.smaller]}>(<Text style={{fontWeight: "900"}}>{daysFromPeriodStopped}</Text> days since your period stopped)</Text>
                }
                <Text style={[styles.descriptionText, styles.pBottom, styles.smaller]}>Current cycle started {currentCycle.startDate.toDateString()}</Text>
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
                    <TouchableOpacity style={buttonStyle.primaryBtn} onPress={() => openModal('periodStopped')}>
                        <Text style={buttonStyle.buttonText}>My period stopped</Text>
                    </TouchableOpacity>
                }
                {currentCycle.periodEndDate != undefined &&
                    <TouchableOpacity style={buttonStyle.primaryBtn} onPress={() => openModal('newCycle')}>
                        <Text style={buttonStyle.buttonText}>Start new cycle</Text>
                    </TouchableOpacity>
                }
            </View>
            <Modal 
                animationType='slide'
                transparent={true}
                visible={modalDisplayed == "Ovulation" || modalDisplayed == "Spot bleed"}>
                    <View style={modalStyle.centeredView}>
                        <View style={modalStyle.modalWrapper}>
                            <MessagePrompt
                                buttonText='Show cycle'
                                description='Your cycle has been updated'
                                onConfirmed={onMessageModalConfirmed} />
                        </View>
                    </View>
            </Modal>
            <Modal
                animationType='slide'
                transparent={true}
                visible={modalDisplayed == "periodStopped" || modalDisplayed == "newCycle"}>
                    <View style={modalStyle.centeredView}>
                        <View style={modalStyle.modalWrapper}>
                            <DatePrompt 
                                buttonText='Confirm'
                                description={
                                    modalDisplayed == "Temperature" 
                                    ? 'Please enter your temperature' 
                                    : modalDisplayed == "periodStopped"
                                        ? 'Please confirm the date where your period stopped'
                                        : 'Please confirm the date where your new cycle started'}
                                onConfirmed={onDateModalConfirmed}/>
                        </View>
                    </View>
            </Modal>
        </View>
    )
}

export default MainDateDisplay;