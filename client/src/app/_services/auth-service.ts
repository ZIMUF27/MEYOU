import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential, signOut, authState, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, docData } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';

export interface Profile {
  uid?: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  role?: string;
  xp?: number;
  level?: number;
  createdAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private router = inject(Router);

  user$ = authState(this.auth);
  currentUser = toSignal(this.user$);
  userProfile = toSignal(
    this.user$.pipe(
      switchMap((user) => (user ? this.getUserProfile(user.uid) : of(null)))
    )
  );

  constructor() { }

  register(email: string, pass: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, pass);
  }

  login(email: string, pass: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  logout() {
    return signOut(this.auth).then(() => {
        this.router.navigate(['/']);
    });
  }

  // Create user profile if it doesn't exist, but don't overwrite existing data
  async createUserProfile(uid: string, email: string, role: string = 'user') {
    const userDocRef = doc(this.firestore, 'users/' + uid);
    const userSnapshot = await getDoc(userDocRef);
    
    if (!userSnapshot.exists()) {
      return setDoc(userDocRef, {
        email,
        role,
        createdAt: new Date(),
        xp: 0,
        level: 1
      });
    }
  }

  getUserProfile(uid: string): Observable<any> {
    const userDocRef = doc(this.firestore, 'users/' + uid);
    return docData(userDocRef, { idField: 'uid' });
  }

  async updateUserProfile(uid: string, data: any) {
    const userDocRef = doc(this.firestore, 'users/' + uid);
    return setDoc(userDocRef, data, { merge: true });
  }

  async uploadUserAvatar(uid: string, file: File): Promise<string> {
    const filePath = 'avatars/' + uid + '/' + file.name;
    const storageRef = ref(this.storage, filePath);
    const result = await uploadBytes(storageRef, file);
    return getDownloadURL(result.ref);
  }

  async addXp(uid: string, xpToAdd: number) {
    const userDocRef = doc(this.firestore, 'users/' + uid);
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const newXp = (userData['xp'] || 0) + xpToAdd;
      // Simple level up logic: e.g. level = 1 + floor(xp / 100)
      const newLevel = 1 + Math.floor(newXp / 100);
      return setDoc(userDocRef, { xp: newXp, level: newLevel }, { merge: true });
    }
  }
}
