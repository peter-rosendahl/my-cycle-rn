import firestore from '@react-native-firebase/firestore';
import { ICycle, IDateRecord } from '../entities/CycleEntity';


export class CycleRepository {

    startCurrentCycle = async(uid: string, cycleStartDate: Date) => {
        return await this.getUserDoc(uid).collection('currentCycle').doc('cycle').set({
            startDate: cycleStartDate
        });
    }

    getCurrentCycle = async(uid: string) => {
        return await this.getUserDoc(uid).collection('currentCycle').doc('cycle').get();
    }

    updateCurrentCycle = async(uid: string, currentCycle: ICycle) => {
        return await this.getUserDoc(uid).collection('currentCycle').doc('cycle').update(currentCycle);
    }

    getCycleRecords = async(uid: string) => {
        return await this.getUserDoc(uid).collection('currentCycle').doc('cycle').collection('dateRecords').get();
    }

    addRecordToCycle = async(uid: string, index: number, record: IDateRecord) => {
        return await this.getUserDoc(uid).collection('currentCycle').doc('cycle').collection('dateRecords').doc(index.toString()).set(record);
    }

    addCycleToHistory = async(uid: string, index: number, cycle: ICycle) => {
        return await this.getUserDoc(uid).collection("cycleHistory").doc(index.toString()).set(cycle);
    }

    addDateRecordsToHistory = async(uid: string, cycleIndex: number, recordIndex: number, record: IDateRecord) => {
        return await this.getUserDoc(uid).collection("cycleHistory").doc(cycleIndex.toString()).collection('dateRecords').doc(recordIndex.toString()).set(record);
    }

    clearRecords = async(uid: string, callback: () => void) => {
        this.getUserDoc(uid).collection("currentCycle").doc('cycle').collection('dateRecords').get()
            .then(snapshot=> {
                console.log('cycleRepo.clearHistory: got collection of dateRecords', snapshot.docs);
                if (snapshot.docs != undefined && snapshot.docs.length > 0) {
                    snapshot.docs.forEach((doc, index) => { 
                        console.log(`document at scope: `, doc);
                        doc.ref.delete().then(
                            onSuccess=> {
                                console.log(`dateRecord ${index} deleted`);
                                console.log(`docs length: ${snapshot.docs.length}`);
                                if (index == snapshot.docs.length-1) {
                                    callback();
                                }
                            })})
                } else {
                    console.log('could not find any docs in cycleHistory');
                    callback();
                }
            });
    }

    getCycleHistory = async(uid: string) => {
        return await this.getUserDoc(uid).collection("cycleHistory").get();
    }

    private getUserDoc = (uid: string) => {
        return firestore().collection('users').doc(uid);
    }
}