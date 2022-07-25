import firestore from '@react-native-firebase/firestore';

export class ReminderRepository {
    
    private collectionName = "reminders";

    getList = async(uid: string) => {
        return await this.getUserDoc(uid).collection(this.collectionName).get();
    }

    addReminder = async(uid: string, index: number, numberOfDays: number) => {
        return await this.getUserDoc(uid).collection(this.collectionName).doc(index.toString()).set({numberOfDays: numberOfDays});
    }

    updateReminderByIndex = async(uid: string, index: number, numberOfDays: number) => {
        return await this.getUserDoc(uid).collection(this.collectionName).doc(index.toString()).update({numberOfDays: numberOfDays});
    }

    removeFromIndex = async (uid: string, index: number) => {
        return await this.getUserDoc(uid).collection(this.collectionName).doc(index.toString()).delete();
    }

    private getUserDoc = (uid: string) => {
        return firestore().collection('users').doc(uid);
    }
}