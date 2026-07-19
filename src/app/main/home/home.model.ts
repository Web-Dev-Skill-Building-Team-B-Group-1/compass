import { WeeklyGoal } from 'src/app/core/store/weekly-goal/weekly-goal.model';
import { QuarterlyGoal } from 'src/app/core/store/quarterly-goal/quarterly-goal.model';
import { Hashtag } from 'src/app/core/store/hashtag/hashtag.model';

export interface WeeklyGoalData extends WeeklyGoal {
  hashtag?: Partial<Hashtag>;
}

export interface QuarterlyGoalData extends QuarterlyGoal {
  hashtag?: Partial<Hashtag>;
  weeklyGoalsTotal: number;
  weeklyGoalsComplete: number;
}

export interface WeeklyGoalInForm {
  text?: string;
  __quarterlyGoalId?: string;
  originalText?: string;
  originalOrder?: number;
  originalQuarterlyGoalId?: string;
  __weeklyGoalId?: string;
  _deleted?: boolean;
  _new?: boolean;
}