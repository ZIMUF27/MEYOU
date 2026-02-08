import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MissionService } from '../_services/mission.service';
import { PassportService } from '../_services/passport-service';

@Component({
  selector: 'app-mission',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './mission.html',
  styleUrl: './mission.scss',
})
export class Mission {
  missionService = inject(MissionService);
  passportService = inject(PassportService);
  missions = this.missionService.getMissions();

  newMissionTitle = '';
  newMissionDescription = '';
  newMissionDifficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
  newMissionReward = '';
  showAddForm = false;

  get isLoggedIn(): boolean {
    return !!this.passportService.data()?.access_token;
  }

  addMission() {
    if (this.newMissionTitle.trim() && this.newMissionDescription.trim() && this.newMissionReward.trim()) {
      this.missionService.addMission({
        title: this.newMissionTitle,
        description: this.newMissionDescription,
        difficulty: this.newMissionDifficulty,
        reward: this.newMissionReward
      });
      this.resetForm();
    }
  }

  deleteMission(id: number) {
    this.missionService.deleteMission(id);
  }

  completeMission(id: number) {
    if (this.isLoggedIn) {
      const xp = this.missionService.completeMission(id);
      if (xp > 0) {
        this.passportService.addXp(xp);
      }
    }
  }

  joinMission(id: number) {
    if (this.isLoggedIn) {
      this.missionService.joinMission(id);
    }
  }

  leaveMission(id: number) {
    this.missionService.leaveMission(id);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  resetForm() {
    this.newMissionTitle = '';
    this.newMissionDescription = '';
    this.newMissionDifficulty = 'Medium';
    this.newMissionReward = '';
    this.showAddForm = false;
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }
}
