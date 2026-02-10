import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential, signOut, authState, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  user$ = authState(this.auth);

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

  createUserProfile(uid: string, email: string, role: string = 'user') {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return setDoc(userDocRef, {
      email,
      role,
      createdAt: new Date()
    }, { merge: true });
  }
}
