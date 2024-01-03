import firestore from '@react-native-firebase/firestore';

export class SymptomRepository {

    private collectionName = "symptoms";
    
    getList = async(uid: string) => {
        return await this.getUserDoc(uid).collection(this.collectionName).get();
    }

    addSymptom = async(uid: string, index: number, symptomName: string) => {
        return await this.getUserDoc(uid).collection(this.collectionName).doc(index.toString()).set({name: symptomName});
    }

    updateSymptomInIndex = async(uid: string, index: number, symptomName: string) => {
        return await this.getUserDoc(uid).collection(this.collectionName).doc(index.toString()).update({name: symptomName});
    }

    removeFromIndex = async (uid: string, index: number) => {
        return await this.getUserDoc(uid).collection(this.collectionName).doc(index.toString()).delete();
    }

    private getUserDoc = (uid: string) => {
        return firestore().collection('users').doc(uid);
    }
}