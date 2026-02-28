import { describe, expect, it } from 'vitest';

import { gradePlannerMockData } from '@/domain/grade-planner/mock_data';
import {
  calculateCourseStats,
  calculateSemesterStats,
  calculateUcStats,
  getUpcomingDeadlines,
} from '@/domain/grade-planner/utils';

describe('Grade planner stats integration', () => {
  it('calculates UC and semester stats from mock dataset', () => {
    const now = new Date(gradePlannerMockData.generatedAt);
    const uc = gradePlannerMockData.ucs.find((item) => item.id === 'uc-analise-sistemas');
    const semester = gradePlannerMockData.semesters.find((item) => item.id === 'semester-2026-1');

    expect(uc).toBeDefined();
    expect(semester).toBeDefined();
    if (!uc || !semester) return;

    const ucStats = calculateUcStats(uc, gradePlannerMockData.activities, now);
    expect(ucStats.partialAverage).toBe(15.5);
    expect(ucStats.gradedWeight).toBe(40);
    expect(ucStats.remainingWeight).toBe(60);
    expect(ucStats.completedEvaluations).toBe(2);
    expect(ucStats.totalEvaluations).toBe(4);
    expect(ucStats.completionPercent).toBe(50);
    expect(ucStats.nextDeadlineAt).not.toBeNull();

    const semesterStats = calculateSemesterStats(
      semester,
      gradePlannerMockData.ucs,
      gradePlannerMockData.activities,
      now,
    );
    expect(semesterStats.semesterAverage).toBe(14.5);
    expect(semesterStats.totalEcts).toBe(24);
    expect(semesterStats.completedEcts).toBe(0);
    expect(semesterStats.completedEvaluations).toBe(7);
    expect(semesterStats.totalEvaluations).toBe(16);
    expect(semesterStats.completionPercent).toBe(43.8);
  });

  it('calculates course stats and upcoming deadlines for next 7 days', () => {
    const now = new Date(gradePlannerMockData.generatedAt);
    const course = gradePlannerMockData.courses[0];

    const courseStats = calculateCourseStats(
      course,
      gradePlannerMockData.semesters,
      gradePlannerMockData.ucs,
      gradePlannerMockData.activities,
      now,
    );

    expect(courseStats.courseAverage).toBe(15);
    expect(courseStats.totalEcts).toBe(44);
    expect(courseStats.completedEcts).toBe(20);
    expect(courseStats.completionPercent).toBe(45.5);

    const upcoming = getUpcomingDeadlines(gradePlannerMockData.activities, 7, now);
    expect(upcoming.length).toBeGreaterThanOrEqual(5);
    expect(upcoming).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ activityId: 'ev-es-3', type: 'evaluation' }),
        expect.objectContaining({ activityId: 'task-ads-revisao', type: 'study_task' }),
        expect.objectContaining({ activityId: 'event-job-fair', type: 'event' }),
      ]),
    );

    const upperBound = now.getTime() + 7 * 24 * 60 * 60 * 1000;
    expect(
      upcoming.every((deadline) => {
        const dueAt = new Date(deadline.dueAt).getTime();
        return dueAt >= now.getTime() && dueAt <= upperBound;
      }),
    ).toBe(true);
  });
});
