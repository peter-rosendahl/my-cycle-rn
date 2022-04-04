import firestore from '@react-native-firebase/firestore';
import { ICycle } from '../entities/CycleEntity';


export class CycleRepository {

    startCurrentCycle = async(uid: string, cycleStartDate: Date) => {
        return await this.getUserDoc(uid).collection('currentCycle').doc('cycle').set({
            startDate: cycleStartDate,
            periodEndDate: '',
            endDate: '',
            records: []
        });
    }

    getCurrentCycle = async(uid: string) => {
        return await this.getUserDoc(uid).collection('currentCycle').doc('cycle').get();
    }

    updateCurrentCycle = async(uid: string, currentCycle: ICycle) => {
        return await this.getUserDoc(uid).collection('currentCycle').doc('cycle').update(currentCycle);
    }

    addCycleToHistory = async(uid: string, index: number, cycle: ICycle) => {
        return await this.getUserDoc(uid).collection("cycleHistory").doc(index.toString()).set(cycle);
    }

    getCycleHistory = async(uid: string) => {
        return await this.getUserDoc(uid).collection("cycleHistory").get();
    }

    private getUserDoc = (uid: string) => {
        return firestore().collection('users').doc(uid);
    }
}