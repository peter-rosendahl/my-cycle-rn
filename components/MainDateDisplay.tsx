import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TouchableWithoutFeedback,
    TouchableHighlight
} from 'react-native';
import moment from 'moment';
import GestureRecognizer from 'react-native-swipe-gestures';
import { firebase} from '@react-native-firebase/firestore';
import { CycleRepository } from '../core/domain/CycleRepository';
import { SymptomRepository } from '../core/domain/SymptomRepository';
import { ICycle, IDateRecord, DefaultSymptoms, RecordType, IDateRecordRead, EMainDateType } from '../core/entities/CycleEntity';
import { buttonStyle } from "../core/styles/buttonStyles";
import { modalStyle } from '../core/styles/ModalStyle';
import InputPrompt from './InputPrompt';
import FactBox from './FactBox';
import EventForm from './EventForm';
import DatePrompt from './DatePrompt';
import Icon from 'react-native-vector-icons/MaterialIcons';

export enum EModalType {
    Event,
    PeriodStopped,
    NewCycle,
    undefined
}

type MainDateProps = {
    uid?: string,
    currentCycle: ICycle,
    onNewStartDate: (newStartDate: Date, cycleDuration: number) => void,
    onPeriodStopped: (date: Date, daysInCycle: number) => void,
    onHistorySwipe: (direction: string) => void
}

const MainDateDisplay: React.FC<MainDateProps> = ({uid, currentCycle, onNewStartDate, onPeriodStopped, onHistorySwipe}) => {

    const swipeConfig = {
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80
    };

    const cycleRepo = new CycleRepository();
    const symptomRepo = new SymptomRepository();
    const dayCount = 86400000;
    const [daysFromStart, setDaysFromStart] = useState(0);
    const [daysFromPeriodStopped, setDaysFromPeriodStopped] = useState(0);
    const [modalDisplayed, setModalDisplayed] = useState<RecordType | EModalType | undefined>(undefined);
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [events, setEvents] = useState<IDateRecord[]>([]);
    const [currentSymptom, setCurrentSymptom] = useState<string>('');
    const [isCurrentCycle, setIsCurrentCycle] = useState<boolean>(true);

    useEffect(() => {
        console.log('displayed cycle changed', currentCycle);
        setModalDisplayed(undefined);
        calculateDays();
        perpareSymptoms();
        getEvents();
    }, [currentCycle]);

    const calculateDays = () => {
        console.log('calculateDays: Triggered', currentCycle);
        const now = new Date();
        let difference = calculateDifference(currentCycle.startDate, now);
        // const today = new Date().getTime();
        // const start = currentCycle.startDate?.getTime(),
        //     difference = Math.floor((today-start)/dayCount);
        setDaysFromStart(difference);
        if (currentCycle.periodEndDate != undefined) {
            console.log('calculateDays: period has stopped on date: ', currentCycle.periodEndDate);
            difference = calculateDifference(currentCycle.periodEndDate, now);
            // const stopped = currentCycle.periodEndDate.getTime(),
            //     difference = Math.floor((today-stopped)/dayCount);
            setDaysFromPeriodStopped(difference);
        }
        setIsCurrentCycle(currentCycle.endDate == undefined);
    }

    const getEvents = () => {
        console.log('MainDateDisplay.getEvents triggered', uid, currentCycle.cycleIndex);
        if (uid != null && currentCycle.cycleIndex != null) {
            cycleRepo.getCycleRecords(uid, (currentCycle.endDate == undefined ? undefined : currentCycle.cycleIndex))
                .then(collection => {
                    let eventRecords: IDateRecord[] = [];
                    if (collection.docs.length > 0) {
                        console.log('event docs are more than 0');
                        collection.docs.forEach(doc => {
                            let event = doc.data() as IDateRecordRead;
                            eventRecords.push({
                                recordDate: event.recordDate.toDate(),
                                recordType: event.recordType,
                                daysInCycle: event.daysInCycle,
                                recordValue: event.recordValue
                            });
                        })
                    }
                    if (eventRecords.length > 0) {
                        console.log(`MainDateDisplay.getEvents records: ${JSON.stringify(eventRecords)}`, collection);
                        setSortedEventListByDate(eventRecords);
                    } else {
                        setEvents([]);
                    }
                })
        }
    }

    const renderEndDate = (cycle: ICycle) => {
        if (cycle.endDate != null){
            return moment(currentCycle.endDate).format("D. MMM yyyy");
        } else {
            return `now`;
        }
    }

    const calculateDifference = (lowerDate: Date, higherDate: Date): number => {
        const lower =  lowerDate.getTime();
        const higher = higherDate.getTime(),
            difference = Math.floor((higher-lower)/dayCount);
        return difference;
    }

    const perpareSymptoms = () => {
        console.log('prepareSymptoms: Triggered');
        const list: string[] = [...DefaultSymptoms];
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

    const addRecordToCycle = async(record: IDateRecord): Promise<boolean> => {
        if (uid != undefined) {
            try {
                const collection = await cycleRepo.getCycleRecords(uid)
                if (collection != null) {
                    let index = 0;
                    if (collection != undefined && collection.docs.length > 0) {
                        index = collection.docs.length;
                    }
                    await cycleRepo.addRecordToCycle(uid, index, record);
                }
                return true;
            } catch (error) {
                return false;
            }
        }
        return true;
    }

    const openModal = (type: RecordType | EModalType, symptomName?: string) => {
        setModalDisplayed(type);
    }

    const onNewSymptomNameConfirmed = (value: string) => {
        if (uid != undefined) {
            symptomRepo.addSymptom(uid, (symptoms.length-DefaultSymptoms.length), value)
                .then(result => {
                    setModalDisplayed(undefined);
                    perpareSymptoms();
                })
                .catch(error => {
                    console.log('error', error);
                });

        }
    }

    const onEventFormSumbitted = (record: IDateRecord) => {
        console.log('onEventFormSubmitted data', record);
        addRecordToCycle(record)
            .then(isSuccess => {
                console.log('onEventFormSubmitted.addRecordToCycle.then: isSuccess = ', isSuccess);
                if (isSuccess) {
                    setModalDisplayed(undefined);
                    addEventRecordToLocalList(record);
                }
            });
    }

    const addEventRecordToLocalList = (record: IDateRecord) => {
        const list = [...events];
        list.push(record);
        setSortedEventListByDate(list);
    }
    
    const setSortedEventListByDate = (list: IDateRecord[]) => {
        const sortedList = list.sort((a, b) => {
            console.log('setSorted TEST', a.recordDate, b.recordDate);
            const dateA = a.recordDate.valueOf();
            const dateB = b.recordDate.valueOf();
            console.log('setSortedEventListByDate', typeof(dateA), dateA);
            if(dateA > dateB){
                return 1; // return -1 here for DESC order
            }
            return -1 // return 1 here for DESC Order
        })
        setEvents(sortedList);
    }

    const confirmMainDateUpdate = (date: Date, type: EMainDateType) => {
        const daysInCycle = calculateDifference(currentCycle.startDate, date);
        if (type == EMainDateType.PeriodStopped) {
            onPeriodStopped(date, daysInCycle);
        } else if (type == EMainDateType.NewCycle) {
            onNewStartDate(date, daysInCycle);
        }
    }

    const onSwipe = (direction: string) => {
        if (direction == "forward" && isCurrentCycle) return;
        if (direction == "backward" && currentCycle.cycleIndex == 0) return;
        onHistorySwipe(direction);
    }

    return (
        <View style={styles.wrapper}>
            <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", flex: 1, width: "100%"}}>
                {uid != undefined &&
                    <View style={{flex: 1, maxWidth: 28, display: "flex", justifyContent: "center"}}>
                        <TouchableOpacity onPress={() => onSwipe("backward")} style={{ height: 64, display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Icon style={{color: "#666", fontSize: 28, height: 64, opacity: currentCycle.cycleIndex == 0 ? 0 : 1}} name="chevron-left"></Icon>
                        </TouchableOpacity>
                    </View>
                }
                <GestureRecognizer config={swipeConfig} onSwipeLeft={() => onSwipe("forward")} onSwipeRight={() => onSwipe("backward")} style={{display: "flex", flex: 1, flexDirection: "column", alignItems: "center" }}>
                        <Text style={[styles.descriptionText, styles.smaller]}>
                            {moment(currentCycle.startDate).format("D. MMM yyyy")} - {renderEndDate(currentCycle)}
                        </Text>
                        <FactBox 
                            title={isCurrentCycle ? 'Your current cycle' : 'Cycle lasted for'} 
                            value={currentCycle.endDate == null ? daysFromStart : calculateDifference(currentCycle.startDate, currentCycle.endDate)} 
                            subtitle={isCurrentCycle ? 'days in' : 'days'}
                            isBigger={true} 
                            customStyles={styles.mainFactBox} />
                        <View style={{display: "flex", flexDirection: "row", justifyContent: "space-around", width:300, marginBottom: 30}}>
                            {currentCycle.periodEndDate != undefined &&
                                <TouchableHighlight underlayColor={"#ECDDFF00"} onPress={() => openModal(EModalType.PeriodStopped)}>
                                    <FactBox
                                        title={isCurrentCycle ? 'Period stopped' : 'Period lasted for'}
                                        value={isCurrentCycle ? daysFromPeriodStopped : calculateDifference(currentCycle.startDate, currentCycle.periodEndDate)} 
                                        subtitle={isCurrentCycle ? "days ago" : "days"}
                                        isBigger={false} />
                                </TouchableHighlight>
                            }
                        </View>
                        <ScrollView showsVerticalScrollIndicator={true} style={{maxHeight: 150, height: "auto", backgroundColor: "#FFF", width: 300}}>
                            <Text style={styles.descriptionText}>Events logged in cycle</Text>
                            {events.length == 0 &&
                                <Text style={[styles.descriptionText, styles.smaller]}>No events registered</Text>
                            }
                            {events.length > 0 && events.map((event: IDateRecord, index: number) => (
                                <View key={index} style={{width: 300, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingBottom: 12}}>
                                    <Text style={{color: "#666666"}}>{moment(event.recordDate).format("D. MMM YYYY")}</Text>
                                    <Text style={{color: "#000000"}}>{event.recordType}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    {isCurrentCycle &&
                        <View style={[styles.alignToBottom]}>
                            <TouchableHighlight underlayColor={"#ECDDFF00"} style={buttonStyle.primaryBtn} onPress={() => openModal(EModalType.Event)}>
                                <Text style={[buttonStyle.buttonText, {fontWeight: "600"}]}>Register event...</Text>
                            </TouchableHighlight>
                            <View style={styles.bottom}>
                                {currentCycle.periodEndDate == undefined && 
                                    <TouchableHighlight underlayColor={"#ECDDFF00"} style={buttonStyle.primaryBtn} onPress={() => openModal(EModalType.PeriodStopped)}>
                                        <Text style={[buttonStyle.buttonText, {fontWeight: "600"}]}>My period stopped</Text>
                                    </TouchableHighlight>
                                }
                                {currentCycle.periodEndDate != undefined &&
                                    <TouchableHighlight underlayColor={"#ECDDFF00"} style={buttonStyle.primaryBtn} onPress={() => openModal(EModalType.NewCycle)}>
                                        <Text style={[buttonStyle.buttonText, {fontWeight: "600"}]}>Start new cycle</Text>
                                    </TouchableHighlight>
                                }
                            </View>
                        </View>
                    }
                </GestureRecognizer>
                {uid != undefined &&
                    <View style={{flex: 1, maxWidth: 28, display: "flex", justifyContent: "center"}}>
                        <TouchableOpacity onPress={() => onSwipe("forward")} style={{ height: 64, display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Icon style={{color: "#666", fontSize: 28, opacity: isCurrentCycle ? 0 : 1}} name="chevron-right"></Icon>
                        </TouchableOpacity>
                    </View>
                }
            </View>
                <Modal 
                    animationType='fade'
                    transparent={true}
                    visible={modalDisplayed == EModalType.PeriodStopped || modalDisplayed == EModalType.NewCycle}>
                        <TouchableHighlight underlayColor={"#ECDDFF00"} style={modalStyle.centeredView} onPress={() => setModalDisplayed(undefined)}>
                            <TouchableWithoutFeedback>
                                <View style={modalStyle.modalWrapper}>
                                    {modalDisplayed == EModalType.PeriodStopped &&
                                        <DatePrompt
                                            buttonText='Confirm'
                                            description='Please confirm when your period stopped.'
                                            onConfirmed={(date) => confirmMainDateUpdate(date, EMainDateType.PeriodStopped)}></DatePrompt>
                                    }
                                    {modalDisplayed == EModalType.NewCycle &&
                                        <DatePrompt
                                            buttonText='Confirm'
                                            description='Please confirm the date where your new cycle started'
                                            onConfirmed={(date) => confirmMainDateUpdate(date, EMainDateType.NewCycle)}></DatePrompt>
                                    }
                                </View>
                            </TouchableWithoutFeedback>
                        </TouchableHighlight>
                </Modal>
                <Modal
                    animationType='fade'
                    transparent={true}
                    visible={
                        modalDisplayed == EModalType.Event}>
                        <TouchableHighlight underlayColor={"#ECDDFF00"} style={modalStyle.centeredView} onPress={() => setModalDisplayed(undefined)}>
                            <TouchableWithoutFeedback>
                                <View style={modalStyle.modalWrapper}>
                                    <EventForm 
                                        symptomList={symptoms} 
                                        onSubmit={onEventFormSumbitted}
                                        onNewSymptomSubmitted={onNewSymptomNameConfirmed}/>
                                </View>
                            </TouchableWithoutFeedback>
                        </TouchableHighlight>
                </Modal>
            </View>
    )
}

export default MainDateDisplay;



const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        display: "flex",
        width: "100%",
        paddingTop: 18,
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#ffefff"
    },
    mainFactBox: {
        // flex: 1,
        borderWidth: 5,
        width: 300,
        marginBottom: 10
    },
    mainContent: {
        flexGrow: 1,
        alignItems: "center",
        paddingHorizontal: 80
    },
    alignToBottom: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
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