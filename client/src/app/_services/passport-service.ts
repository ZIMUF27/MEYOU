import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Passport } from '../_models/passport';

@Injectable({
    providedIn: 'root'
})
export class PassportService {
    private http = inject(HttpClient);
    data = signal<Passport | undefined>(undefined);

    constructor() {
        const stored = localStorage.getItem('passport');
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as Passport;
                // ensure xp and level defaults
                if (parsed.xp === undefined || parsed.xp === null) parsed.xp = 0;
                if (parsed.level === undefined || parsed.level === null) parsed.level = this.computeLevel(parsed.xp || 0);
                this.data.set(parsed);
            } catch (e) {
                localStorage.removeItem('passport');
            }
        }
    }

    async login(credentials: any): Promise<string | null> {
        // Hardcoded backdoor for specific user as requested
        if (credentials.username === 'Akkhaphak' && credentials.password === 'poo2461p') {
            const passport: Passport = {
                access_token: 'hardcoded-token-Akkhaphak',
                display_name: 'Akkhaphak',
                xp: 0,
                level: 1
            };
            this.data.set(passport);
            localStorage.setItem('passport', JSON.stringify(passport));
            return null;
        }

        try {
            const result = await firstValueFrom(this.http.post<Passport>('/api/authentication/login', credentials));
            // ensure xp and level exist
            if (result.xp === undefined || result.xp === null) result.xp = 0;
            if (result.level === undefined || result.level === null) result.level = this.computeLevel(result.xp || 0);
            this.data.set(result);
            localStorage.setItem('passport', JSON.stringify(result));
            return null;
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                return error.error?.message || error.message;
            }
            return 'An unknown error occurred';
        }
    }

    async register(data: any): Promise<string | null> {
        try {
            const result = await firstValueFrom(this.http.post<Passport>('/api/authentication/register', data));
            if (result.xp === undefined || result.xp === null) result.xp = 0;
            if (result.level === undefined || result.level === null) result.level = this.computeLevel(result.xp || 0);
            this.data.set(result);
            localStorage.setItem('passport', JSON.stringify(result));
            return null;
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                return error.error?.message || error.message;
            }
            return 'An unknown error occurred';
        }
    }

    // Keeping 'get' for backward compatibility if needed, but implementation suggests it was used for login
    async get(credentials: any): Promise<string | null> {
        return this.login(credentials);
    }

    logout() {
        this.data.set(undefined);
        localStorage.removeItem('passport');
    }
    async updateProfile(displayName: string): Promise<string | null> {
        try {
            await firstValueFrom(this.http.post('/api/brawler/profile', { display_name: displayName }));
            
            const current = this.data();
            if (current) {
                const updated = { ...current, display_name: displayName };
                this.data.set(updated);
                localStorage.setItem('passport', JSON.stringify(updated));
            }
            return null;
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                return error.error?.message || error.message;
            }
            return 'An unknown error occurred';
        }
    }

    addXp(amount: number) {
        const current = this.data();
        if (!current) return;
        const newXp = (current.xp || 0) + amount;
        const newLevel = this.computeLevel(newXp);
        const updated: Passport = { ...current, xp: newXp, level: newLevel };
        this.data.set(updated);
        localStorage.setItem('passport', JSON.stringify(updated));
    }

    private computeLevel(xp: number) {
        // Simple leveling: 100 XP per level starting at level 1
        return Math.floor((xp || 0) / 100) + 1;
    }

    async uploadAvatar(file: File): Promise<string | null> {
        try {
            // Validate file
            if (!file || !file.type.startsWith('image/')) {
                return 'Please select a valid image file';
            }

            if (file.size > 5 * 1024 * 1024) {
                return 'Image size must be less than 5MB';
            }

            // Convert file to base64
            const base64 = await this.fileToBase64(file);
            console.log('Uploading avatar...');
            
            const result = await firstValueFrom(
                this.http.post<{ url: string; public_id: string }>('/api/brawler/avatar', { base64_string: base64 })
            );
            
            console.log('Avatar upload successful:', result);
            const current = this.data();
            if (current && result.url) {
                const updated = { ...current, avatar_url: result.url };
                this.data.set(updated);
                localStorage.setItem('passport', JSON.stringify(updated));
            }
            return null;
        } catch (error) {
            console.error('Avatar upload error:', error);
            if (error instanceof HttpErrorResponse) {
                const errorMsg = error.error?.message || error.message || 'Failed to upload avatar';
                console.error('HTTP Error:', errorMsg);
                return errorMsg;
            }
            return 'Failed to upload avatar. Please try again.';
        }
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result as string;
                resolve(base64String);
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }

}