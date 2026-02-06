import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from '@react-native-firebase/firestore';

// import firestore from '@react-native-firebase/firestore';

export class ReminderRepository {

    private db = getFirestore(getApp());
    private collectionName = "reminders";
    
    private getUserDoc = (uid: string) => {
        return doc(collection(this.db, 'users'), uid);
    };

    getList = async(uid: string) => {
        const recordsCollection = collection(this.getUserDoc(uid), this.collectionName);
        return await getDocs(recordsCollection);
    }

    addReminder = async(uid: string, index: number, numberOfDays: number) => {
        const recordDoc = 
        doc(
            collection(
                this.getUserDoc(uid), 
                this.collectionName), 
            index.toString());
        return await setDoc(recordDoc, {numberOfDays: numberOfDays});
        // return await this.getUserDoc(uid).collection(this.collectionName).doc(index.toString()).set({numberOfDays: numberOfDays});
    }

    updateReminderByIndex = async(uid: string, index: number, numberOfDays: number) => {
        const recordDoc = 
        doc(
            collection(
                this.getUserDoc(uid), 
                this.collectionName), 
            index.toString());
        return await updateDoc(recordDoc, {numberOfDays: numberOfDays});
        // return await this.getUserDoc(uid).collection(this.collectionName).doc(index.toString()).update({numberOfDays: numberOfDays});
    }

    removeFromIndex = async (uid: string, index: number) => {
        const recordDoc = 
        doc(
            collection(
                this.getUserDoc(uid), 
                this.collectionName), 
            index.toString());
        return await deleteDoc(recordDoc);
        // return await this.getUserDoc(uid).collection(this.collectionName).doc(index.toString()).delete();
    }

  
}