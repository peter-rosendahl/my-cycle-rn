import React, {useState} from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    TextStyle,
    TextInput
} from 'react-native';
import DatePrompt from './DatePrompt';
import { modalStyle } from '../core/styles/ModalStyle';
import { IDateRecord } from '../core/entities/CycleEntity';
import { buttonStyle } from "../core/styles/buttonStyles";
import Icon from 'react-native-vector-icons/MaterialIcons';

type EventFormProps = {
    symptomList: string[],
    minDate: Date,
    onSubmit: (symptomRecord: IDateRecord) => void,
    onNewSymptomSubmitted: (symptom: string) => void
}

const EventForm: React.FC<EventFormProps> = ({symptomList, minDate, onSubmit, onNewSymptomSubmitted}) => {

    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [customSymptom, setCustomSymptom] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [eventDate, setEventDate] = useState(new Date());

    const onSymptomToggle = (symptom: string) => {
        let list = [...selectedSymptoms];
        console.log(selectedSymptoms);
        if (!selectedSymptoms.includes(symptom)) {
            list.push(symptom);
        } else {
            const index = list.indexOf(symptom);
            list.splice(index, 1);
        }
        setSelectedSymptoms(list);
    },

    onCustomTextChanged = (value: string) => {
        setCustomSymptom(value);
    }

    const onDateConfirmed = (date: Date) => {
        console.log('EventForm.onDateConfirmed', selectedSymptoms, customSymptom, date);
        const totalSelectedSymptomList: string[] = [...selectedSymptoms];
        if (customSymptom.length > 0) {
            totalSelectedSymptomList.push(customSymptom);
        }
        const record: IDateRecord = {
            recordDate: date,
            recordType: totalSelectedSymptomList.join(", ")
        };
        onSubmit(record);
        
        if (customSymptom.length > 0) {
            onNewSymptomSubmitted(customSymptom);
        }
    }

    const goToPage = (pageNumber: number) => {
        setPage(pageNumber);
    }

    return (
        <View style={modalStyle.modalInner}>
            {page == 1 &&
                <View>
                    <Text style={{color: "#DEC4FFFF", fontSize: 24, fontWeight: "600", textAlign: "center"}}>Register Event</Text>
                    <Text style={[style.titleText, style.darkText]}>(page 1 of 2)</Text>
                    <Text style={[style.titleText, style.darkText]}>Please choose an option below that describes what you're experiencing most accurately.</Text>
                    <View style={{display: "flex", flexDirection: "column", flexWrap: "wrap", justifyContent: "center"}}>
                        {symptomList &&
                            <ScrollView persistentScrollbar={true} contentContainerStyle={{ paddingVertical: 20}} style={{maxHeight: 200, height: 50, width: "100%", backgroundColor: "#ffffff"}}>
                                <View style={{display: "flex", width: "100%", flexDirection: "row", flexWrap: "wrap", justifyContent: "center"}}>
                                    {symptomList && symptomList.map((symptom, index) => 
                                        <View key={index}>
                                            <TouchableOpacity 
                                                style={[style.option, selectedSymptoms.includes(symptom) ? style.selected : style.unselected]} 
                                                onPress={() => onSymptomToggle(symptom)}>
                                                <Text style={{color: "#333", fontSize: 10}}>{symptom}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        }
                        <View style={{display: 'flex', flexDirection: 'column', marginVertical: 32}}>
                            <Text style={[style.titleText, style.darkText]}>or describe new sympton here:</Text>
                            <TextInput multiline={true} placeholder='New symptom' placeholderTextColor="#999999" onChangeText={onCustomTextChanged} style={[style.textInput]}></TextInput>
                        </View>
                    </View>
                    <TouchableHighlight underlayColor={"#ECDDFF00"} style={buttonStyle.primaryBtn} onPress={() => goToPage(2)}>
                        <Text style={[buttonStyle.buttonText, {fontWeight: "600"}]}>Proceed</Text>
                    </TouchableHighlight>
                </View>
            }
            {page == 2 &&
                <View>
                    <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                        <TouchableHighlight underlayColor={"#ECDDFF00"} style={{width: 25}} onPress={() => goToPage(1)}>
                            <Icon style={{color: "#333333", fontSize: 24}} name="arrow-back"></Icon>
                        </TouchableHighlight>
                        <Text style={{color: "#DEC4FFFF", fontSize: 24, fontWeight: "600", textAlign: "center"}}>Register Event</Text>
                    </View>
                    <Text style={[style.titleText, style.darkText]}>(page 2 of 2)</Text>
                    <Text style={[style.titleText, style.darkText]}>Please select at which date the even occurred.</Text>
                    <DatePrompt
                        buttonText="Confirm Date"
                        description='Please confirm the date where the event occurred.'
                        minDate={minDate}
                        onConfirmed={onDateConfirmed}></DatePrompt>
                        
                </View>
                
            }
            {/* <View style={{borderBottomColor: "#999999FF", marginVertical:10, borderBottomWidth: 1, width: 180}}></View> */}
        </View>
    )
};

export default EventForm;

const style = StyleSheet.create({
    option: {
        display: "flex",
        padding: 10,
        marginHorizontal: 5,
        width: 128,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 5,
        borderColor: "#DEC4FFFF",
        borderWidth: 1,
        borderRadius: 8,
        elevation: 20
    },
    box: {
        display: "flex",
        padding: 10,
        width: 135,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 5,
        borderColor: "#DEC4FFFF",
        borderWidth: 1,
        borderRadius: 8,
        elevation: 20
    },
    selected: {
        backgroundColor: "#DEC4FFFF",
    },
    unselected: {
        backgroundColor: "#FFFFFFFF"
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
        color: "#333333FF"
    },
    valueText: {
        fontSize: 21
    },
    textInput: {
        elevation: 4,
        backgroundColor: "#ffffff",
        color: "#333333",
        width: 220,
        height: 35,
        padding: 10,
    },
    subtitleText: {
        fontSize: 15
    }
})

