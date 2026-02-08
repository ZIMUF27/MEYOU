import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface Mission {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reward: string;
  createdAt: Date;
  joined: boolean;
  joinedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private missions = signal<Mission[]>([
    {
      id: 1,
      title: 'The First Mission',
      description: 'Begin your journey and prove your worth in the arena.',
      difficulty: 'Easy',
      reward: '100 XP',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      joined: false
    },
    {
      id: 2,
      title: 'Shadow Protocol',
      description: 'Navigate through darkness and uncover hidden secrets.',
      difficulty: 'Medium',
      reward: '250 XP',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      joined: false
    },
    {
      id: 3,
      title: 'The Convergence',
      description: 'Face the ultimate challenge and unite with allies.',
      difficulty: 'Hard',
      reward: '500 XP',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      joined: false
    }
  ]);

  getMissions() {
    return this.missions.asReadonly();
  }

  addMission(mission: Omit<Mission, 'id' | 'createdAt' | 'joined' | 'joinedAt'>) {
    const newMission: Mission = {
      ...mission,
      id: Math.max(...this.missions().map(m => m.id), 0) + 1,
      createdAt: new Date(),
      joined: false
    };
    this.missions.update(missions => [...missions, newMission]);
  }

  joinMission(id: number) {
    this.missions.update(missions =>
      missions.map(m =>
        m.id === id ? { ...m, joined: true, joinedAt: new Date() } : m
      )
    );
  }

  leaveMission(id: number) {
    this.missions.update(missions =>
      missions.map(m =>
        m.id === id ? { ...m, joined: false, joinedAt: undefined } : m
      )
    );
  }

  deleteMission(id: number) {
    this.missions.update(missions => missions.filter(m => m.id !== id));
  }

  completeMission(id: number): number {
    const missions = this.missions();
    const found = missions.find(m => m.id === id);
    if (!found) return 0;

    // Try to parse numeric XP from the reward like '250 XP'
    const match = (found.reward || '').match(/(\d+)/);
    let xp = match ? parseInt(match[1], 10) : 0;

    // Fallback xp by difficulty if not parseable
    if (!xp) {
      if (found.difficulty === 'Easy') xp = 50;
      else if (found.difficulty === 'Medium') xp = 150;
      else xp = 300;
    }

    // Remove mission on completion
    this.deleteMission(id);
    return xp;
  }
}
