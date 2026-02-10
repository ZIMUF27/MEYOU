import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Passport } from '../_models/passport';
import { environment } from '../../environments/environment';

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
                if (parsed.xp === undefined || parsed.xp === null) parsed.xp = 0;
                if (parsed.level === undefined || parsed.level === null) parsed.level = this.computeLevel(parsed.xp || 0);
                this.data.set(parsed);
            } catch (e) {
                localStorage.removeItem('passport');
            }
        }
    }

    async login(credentials: any): Promise<string | null> {
        try {
            const raw = await firstValueFrom(this.http.post<any>(`${environment.baseUrl}/api/authentication/login`, credentials));
            const normalized: Passport = {
                access_token: raw.access_token ?? raw.token,
                display_name: raw.display_name,
                avatar_url: raw.avatar_url,
                xp: raw.xp ?? 0,
                level: raw.level ?? this.computeLevel((raw.xp ?? 0))
            };
            this.data.set(normalized);
            localStorage.setItem('passport', JSON.stringify(normalized));
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
            const raw = await firstValueFrom(this.http.post<any>(`${environment.baseUrl}/api/brawler/register`, data));
            const normalized: Passport = {
                access_token: raw.access_token ?? raw.token,
                display_name: raw.display_name,
                avatar_url: raw.avatar_url,
                xp: raw.xp ?? 0,
                level: raw.level ?? this.computeLevel((raw.xp ?? 0))
            };
            this.data.set(normalized);
            localStorage.setItem('passport', JSON.stringify(normalized));
            return null;
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                return error.error?.message || error.message;
            }
            return 'An unknown error occurred';
        }
    }

    async get(credentials: any): Promise<string | null> {
        return this.login(credentials);
    }

    logout() {
        this.data.set(undefined);
        localStorage.removeItem('passport');
    }

    async updateProfile(displayName: string): Promise<string | null> {
        try {
            await firstValueFrom(this.http.post(`${environment.baseUrl}/api/brawler/profile`, { display_name: displayName }));
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
        return Math.floor((xp || 0) / 100) + 1;
    }

    async uploadAvatar(file: File): Promise<string | null> {
        try {
            if (!file || !file.type.startsWith('image/')) return 'Please select a valid image file';
            if (file.size > 5 * 1024 * 1024) return 'Image size must be less than 5MB';

            const formData = new FormData();
            formData.append('avatar', file);

            const stored = localStorage.getItem('passport');
            let token: string | undefined;
            if (stored) {
                try {
                    const parsed = JSON.parse(stored) as Passport;
                    token = parsed.access_token ?? (parsed as any)?.token;
                } catch {}
            }
            const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

            const result = await firstValueFrom(
                this.http.post<{ url: string; public_id: string }>(`${environment.baseUrl}/api/brawler/avatar`, formData, { headers })
            );

            const current = this.data();
            if (current && result.url) {
                const updated = { ...current, avatar_url: result.url };
                this.data.set(updated);
                localStorage.setItem('passport', JSON.stringify(updated));
            }
            return null;
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                const msg = error.error?.message || error.message || 'Failed to upload avatar';
                return msg;
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
