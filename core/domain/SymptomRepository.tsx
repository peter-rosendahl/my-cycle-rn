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

export class SymptomRepository {

    private db = getFirestore(getApp());

    private collectionName = "symptoms";
        
    private getUserDoc = (uid: string) => {
        return doc(collection(this.db, 'users'), uid);
    };
    
    getList = async(uid: string) => {
        const recordsCollection = collection(this.getUserDoc(uid), this.collectionName);
        return await getDocs(recordsCollection);
    }

    addSymptom = async(uid: string, index: number, symptomName: string) => {
        const recordDoc = 
        doc(
            collection(
                this.getUserDoc(uid), 
                this.collectionName), 
            index.toString());
        return await setDoc(recordDoc, {name: symptomName});
        // return await this.getUserDoc(uid).collection(this.collectionName).doc(index.toString()).set({name: symptomName});
    }

    updateSymptomInIndex = async(uid: string, index: number, symptomName: string) => {
        const recordDoc = 
        doc(
            collection(
                this.getUserDoc(uid), 
                this.collectionName), 
            index.toString());
        return await updateDoc(recordDoc, {name: symptomName});
        // return await this.getUserDoc(uid).collection(this.collectionName).doc(index.toString()).update({name: symptomName});
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