import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import { CycleRepository } from '../core/domain/CycleRepository';
import { SymptomRepository } from '../core/domain/SymptomRepository';
import { ICycle, IDateRecord, RecordType } from '../core/entities/CycleEntity';
import { buttonStyle } from "../core/styles/buttonStyles";
import DatePrompt from './DatePrompt';
import InputPrompt from './InputPrompt';
import MessagePrompt from './MessagePrompt';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Ionicon from 'react-native-vector-icons/Ionicons';

type MainDateProps = {
    uid?: string,
    currentCycle: ICycle,
    onNewStartDate: (newStartDate: Date, cycleDuration: number) => void,
    onPeriodStopped: (date: Date, daysInCycle: number) => void,
}

const MainDateDisplay: React.FC<MainDateProps> = ({uid, currentCycle, onNewStartDate, onPeriodStopped}) => {

    const cycleRepo = new CycleRepository();
    const symptomRepo = new SymptomRepository();
    const dayCount = 86400000;
    const [daysFromStart, setDaysFromStart] = useState(0);
    const [daysFromPeriodStopped, setDaysFromPeriodStopped] = useState(0);
    const [modalDisplayed, setModalDisplayed] = useState<RecordType | "periodStopped" | "newCycle" | "userSymptom" | "newSymptom" | undefined>(undefined);
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [currentSymptom, setCurrentSymptom] = useState<string>('');

    useEffect(() => {
        calculateDays();
        perpareSymptoms();
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

    const perpareSymptoms = () => {
        console.log('prepareSymptoms: Triggered');
        const list: string[] = [];
        if (uid != undefined) {
            console.log('getting symptomList...');
            symptomRepo.getList(uid)
                .then(result => {
                    console.log('result: ', result);
                    if (result.docs.length > 0) {
                        const userSymptoms: string[] = result.docs.map(doc => doc.data().name);
                        console.log('prepareSymptoms: userSymptoms = ', userSymptoms);
                        list.push(...userSymptoms);
                        setSymptoms(list);
                    }
                })
                .catch(error => {

                })
        }
    }

    const notifyOvulation = (dateValue: Date) => {
        console.log('notifyOvulation');
        // setModalDisplayed("Ovulation");
        const record: IDateRecord = {
            recordDate: dateValue,
            recordType: "Ovulation",
            daysInCycle: daysFromStart
        }
        addRecordToCycle(record);
    }

    const notifySpotBleed = (dateValue: Date) => {
        console.log('notifySpotBleed');
        // setModalDisplayed("Spot bleed");
        const record: IDateRecord = {
            recordDate: dateValue,
            recordType: "Spot bleed",
            daysInCycle: daysFromStart
        }
        addRecordToCycle(record);
    }

    const notifySymptom = (dateValue: Date) => {
        console.log('notifySymptom');
        // setModalDisplayed("Spot bleed");
        const record: IDateRecord = {
            recordDate: dateValue,
            recordType: currentSymptom,
            daysInCycle: daysFromStart
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

    const openModal = (type: RecordType | "newCycle" | "periodStopped" | "userSymptom"| "newSymptom", symptomName?: string) => {
        if (type == "userSymptom" && symptomName != undefined) {
            setCurrentSymptom(symptomName);
        }
        setModalDisplayed(type);
    }

    const onMessageModalConfirmed = () => {
        console.log('onMessageModalConfirmed');
        setModalDisplayed(undefined);
    }

    const onNewSymptomNameConfirmed = (value: string) => {
        if (uid != undefined) {
            symptomRepo.addSymptom(uid, symptoms.length, value)
                .then(result => {
                    setModalDisplayed(undefined);
                    perpareSymptoms();
                })
                .catch(error => {
                    console.log('error', error);
                });

        }
    }

    const onDateModalConfirmed = (value: Date) => {
        console.log(`onDateModalConfirmed: dateValue ${value}, type: ${modalDisplayed}`);
        switch (modalDisplayed) {
            case "periodStopped": {
                onPeriodStopped(value, daysFromStart);
                break;
            }
            case "newCycle": {
                onNewStartDate(value, daysFromStart);
                break;
            }
            case "Ovulation": {
                notifyOvulation(value);
                break;
            }
            case "Spot bleed": {
                notifySpotBleed(value);
                break;
            }
            case "userSymptom": {
                if (currentSymptom != undefined) {
                    notifySymptom(value);
                }
            }
        }
        setModalDisplayed(undefined);
    }

    return (
        <View style={styles.wrapper}>
            <Text style={[styles.descriptionText, styles.pBottom]}>You are currently</Text>
            <Text style={styles.days}>{daysFromStart}</Text>
            <Text style={[styles.descriptionText, styles.pTop]}>days in your current cycle</Text>
            {currentCycle.periodEndDate != undefined &&
                <View>
                    <TouchableOpacity disabled={uid == undefined} onPress={() => openModal('periodStopped')} style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                        <Text style={[styles.descriptionText, styles.smaller, {textDecorationLine: "underline"}]}>(<Text style={{fontWeight: "900"}}>{daysFromPeriodStopped}</Text> days since your period stopped)</Text>
                        { uid != undefined &&
                            <Icon name="edit" style={{color: "#333333"}}></Icon>
                        }
                    </TouchableOpacity>
                </View>
            }
            <Text style={[styles.descriptionText, styles.pBottom, styles.smaller]}>Current cycle started {currentCycle.startDate.toDateString()}</Text>
            <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={styles.mainContent}>
                {/* {uid != undefined &&
                    <Text style={[styles.descriptionText, styles.pBottom, styles.smaller, {fontWeight: "600"}]}>Experiencing any of these symptoms(?):</Text>
                } */}
                {currentCycle.periodEndDate == undefined && uid != undefined &&
                    <View>
                        <TouchableOpacity style={[buttonStyle.primaryBtn, buttonStyle.disabled, {marginBottom: 10}]} disabled={true} onPress={() => console.log('disabled button pressed.')}>
                            <Text style={buttonStyle.buttonText}>Ovulating</Text>
                            <Icon name="child-care" style={{color: "#333333", position: "absolute", right: 12, fontSize: 16}}></Icon>
                        </TouchableOpacity>
                        <TouchableOpacity style={[buttonStyle.primaryBtn, buttonStyle.disabled, {marginBottom: 10}]} disabled={true} onPress={() => console.log('disabled button pressed.')}>
                            <Text style={buttonStyle.buttonText}>Spot bleeding</Text>
                            <Ionicon.default name="water" style={{color: "#333333", position: "absolute", right: 12, fontSize: 16}}></Ionicon.default>
                        </TouchableOpacity>
                    </View>
                }
                {currentCycle.periodEndDate != undefined && uid != undefined &&
                    <View>
                        <TouchableOpacity style={[buttonStyle.primaryBtn, {marginBottom: 10}]} onPress={() => openModal('Ovulation')}>
                            <Text style={buttonStyle.buttonText}>Ovulating</Text>
                            <Icon name="child-care" style={{color: "#333333", position: "absolute", right: 12, fontSize: 16}}></Icon>
                        </TouchableOpacity>
                        <TouchableOpacity style={[buttonStyle.primaryBtn, {marginBottom: 10}]} onPress={() => openModal('Spot bleed')}>
                            <Text style={buttonStyle.buttonText}>Spot bleeding</Text>
                            <Ionicon.default name="water" style={{color: "#333333", position: "absolute", right: 12, fontSize: 16}}></Ionicon.default>
                        </TouchableOpacity>
                    </View>
                }
                {uid != undefined &&
                    <View>
                        {symptoms.length > 0 && symptoms.map((symptom, index) => 
                            <TouchableOpacity key={index} style={[buttonStyle.primaryBtn, {marginBottom: 10}]} onPress={() => openModal('userSymptom', symptom)}>
                                <Text style={buttonStyle.buttonText}>{symptom}</Text>
                                <Icon name="sentiment-very-dissatisfied" style={{color: "#333333", position: "absolute", right: 12, fontSize: 16, bottom: 12}}></Icon>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[buttonStyle.primaryBtn, {marginBottom: 10}]} onPress={() => openModal('newSymptom')}>
                            <Text style={[buttonStyle.buttonText, {fontStyle: "italic", fontWeight: "600"}]}>+ new symptom</Text>
                            <Icon name="sentiment-very-dissatisfied" style={{color: "#333333", position: "absolute", right: 12, fontSize: 16, bottom: 12}}></Icon>
                        </TouchableOpacity>
                    </View>
                }
            </ScrollView>
            <View style={styles.bottom}>
                {currentCycle.periodEndDate == undefined && 
                    <TouchableOpacity style={buttonStyle.primaryBtn} onPress={() => openModal('periodStopped')}>
                        <Text style={[buttonStyle.buttonText, {fontWeight: "600"}]}>My period stopped</Text>
                    </TouchableOpacity>
                }
                {currentCycle.periodEndDate != undefined &&
                    <TouchableOpacity style={buttonStyle.primaryBtn} onPress={() => openModal('newCycle')}>
                        <Text style={[buttonStyle.buttonText, {fontWeight: "600"}]}>Start new cycle</Text>
                    </TouchableOpacity>
                }
            </View>
            <Modal 
                animationType='fade'
                transparent={true}
                visible={modalDisplayed == "newSymptom"}>
                    <TouchableOpacity style={modalStyle.centeredView} onPress={() => setModalDisplayed(undefined)}>
                        <TouchableWithoutFeedback>
                            <View style={modalStyle.modalWrapper}>
                                <InputPrompt 
                                    buttonText='Save'
                                    placeholderText='My symptom'
                                    description='Please give your symptom a name.'
                                    onConfirmed={onNewSymptomNameConfirmed}/>
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableOpacity>
            </Modal>
            <Modal
                animationType='fade'
                transparent={true}
                visible={
                    modalDisplayed == "periodStopped" || 
                    modalDisplayed == "newCycle" ||
                    modalDisplayed == "Ovulation" ||
                    modalDisplayed == "Spot bleed" ||
                    modalDisplayed == "userSymptom"}>
                    <TouchableOpacity style={modalStyle.centeredView} onPress={() => setModalDisplayed(undefined)}>
                        <TouchableWithoutFeedback>
                            <View style={modalStyle.modalWrapper}>
                                <DatePrompt 
                                    buttonText='Confirm'
                                    description={
                                        modalDisplayed == "periodStopped"
                                        ? 'Please confirm the date where your period stopped'
                                        : modalDisplayed == "newCycle"
                                            ? 'Please confirm the date where your new cycle started'
                                            : modalDisplayed == "Ovulation"
                                                ? 'Please confirm the date where you have been ovulating'
                                                : modalDisplayed == "Spot bleed"
                                                    ? 'Please confirm the date where you have experienced spot bleeding'
                                                    : `Please confirm the date where you have experienced the symptom: ${currentSymptom}`}
                                    onConfirmed={onDateModalConfirmed}/>
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default MainDateDisplay;



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
        alignItems: "center",
        paddingHorizontal: 80
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
        paddingTop: 16
    },
    pBottom: {
        paddingBottom: 16
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
    }
})