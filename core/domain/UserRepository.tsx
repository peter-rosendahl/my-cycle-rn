import firestore from '@react-native-firebase/firestore';

export class UserRepository {
    
    getUserById = async(uid: string) => {
        return await firestore().collection('users').doc(uid).get();
    }
}