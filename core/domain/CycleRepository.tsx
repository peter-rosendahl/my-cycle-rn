import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from '@react-native-firebase/firestore';
import { ICycle, IDateRecord } from '../entities/CycleEntity';

export class CycleRepository {
  private db = getFirestore(getApp());

  private getUserDoc = (uid: string) => {
    return doc(collection(this.db, 'users'), uid);
  };

  startCurrentCycle = async (uid: string, cycleStartDate: Date) => {
    const cycleDoc = doc(collection(this.getUserDoc(uid), 'currentCycle'), 'cycle');
    await setDoc(cycleDoc, { startDate: cycleStartDate });
  };

  getCurrentCycle = async (uid: string) => {
    const cycleDoc = doc(collection(this.getUserDoc(uid), 'currentCycle'), 'cycle');
    return await getDoc(cycleDoc);
  };

  updateCurrentCycle = async (uid: string, currentCycle: ICycle) => {
    const cycleDoc = doc(collection(this.getUserDoc(uid), 'currentCycle'), 'cycle');
    await updateDoc(cycleDoc, currentCycle as any);
  };

  getCycleRecords = async (uid: string, cycleId?: number) => {
    let recordsCollection;

    if (cycleId !== undefined) {
      recordsCollection = collection(
        doc(collection(this.getUserDoc(uid), 'cycleHistory'), `${cycleId}`),
        'dateRecords'
      );
    } else {
      recordsCollection = collection(
        doc(collection(this.getUserDoc(uid), 'currentCycle'), 'cycle'),
        'dateRecords'
      );
    }

    return await getDocs(recordsCollection);
  };

  addRecordToCycle = async (uid: string, index: number, record: IDateRecord) => {
    const recordDoc = doc(
      collection(doc(collection(this.getUserDoc(uid), 'currentCycle'), 'cycle'), 'dateRecords'),
      index.toString()
    );
    await setDoc(recordDoc, record);
  };

  addCycleToHistory = async (uid: string, index: number, cycle: ICycle) => {
    const historyDoc = doc(collection(this.getUserDoc(uid), 'cycleHistory'), index.toString());
    await setDoc(historyDoc, cycle);
  };

  addDateRecordsToHistory = async (
    uid: string,
    cycleIndex: number,
    recordIndex: number,
    record: IDateRecord
  ) => {
    const recordDoc = doc(
      collection(doc(collection(this.getUserDoc(uid), 'cycleHistory'), cycleIndex.toString()), 'dateRecords'),
      recordIndex.toString()
    );
    await setDoc(recordDoc, record);
  };

  clearRecords = async (uid: string, callback: () => void) => {
    const recordsCollection = collection(
      doc(collection(this.getUserDoc(uid), 'currentCycle'), 'cycle'),
      'dateRecords'
    );
    const snapshot = await getDocs(recordsCollection);

    if (snapshot.docs && snapshot.docs.length > 0) {
      for (let i = 0; i < snapshot.docs.length; i++) {
        const docSnap = snapshot.docs[i];
        await deleteDoc(docSnap.ref);
        if (i === snapshot.docs.length - 1) callback();
      }
    } else {
      callback();
    }
  };

  getCycleHistory = async (uid: string) => {
    console.log("step1");
    const userDoc = doc(collection(this.db, 'users'), uid);
    console.log("step2", userDoc);
    const historyCollection = collection(userDoc, 'cycleHistory');
    console.log("step3", historyCollection);
    const snapshot = await getDocs(historyCollection);
    console.log("step4", snapshot);
    return snapshot;
  };
}
