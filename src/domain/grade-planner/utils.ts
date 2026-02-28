import type {
  Activity,
  Course,
  CourseProgressStats,
  EvaluationActivity,
  ScoreValueObject,
  Semester,
  SemesterProgressStats,
  UC,
  UcProgressStats,
  UpcomingDeadline,
} from '@/domain/grade-planner/schema';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const toTimestamp = (value: string): number => new Date(value).getTime();

const round1 = (value: number): number => Math.round(value * 10) / 10;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const normalizeScoreTo20 = (score: ScoreValueObject): number => {
  if (score.scale === '0-10') return score.value * 2;
  if (score.scale === '0-100') return score.value / 5;
  return score.value;
};

const isEvaluation = (activity: Activity): activity is EvaluationActivity => activity.type === 'evaluation';

export const calculateUcStats = (
  uc: UC,
  activities: Activity[],
  now: Date = new Date(),
): UcProgressStats => {
  const evaluations = activities.filter((activity) => isEvaluation(activity) && activity.ucId === uc.id);
  const gradedEvaluations = evaluations.filter((evaluation) => evaluation.grade?.score !== null);

  const gradedWeight = gradedEvaluations.reduce(
    (sum, evaluation) => sum + (evaluation.grade?.weight.percentage ?? 0),
    0,
  );

  const weightedGradeSum = gradedEvaluations.reduce((sum, evaluation) => {
    if (!evaluation.grade?.score) return sum;
    const normalized = normalizeScoreTo20(evaluation.grade.score);
    return sum + normalized * evaluation.grade.weight.percentage;
  }, 0);

  const partialAverage = gradedWeight > 0 ? round1(weightedGradeSum / gradedWeight) : null;

  const nextDeadline = activities
    .filter(
      (activity) =>
        activity.ucId === uc.id &&
        activity.status !== 'completed' &&
        activity.status !== 'cancelled' &&
        toTimestamp(activity.dueAt) >= now.getTime(),
    )
    .sort((a, b) => toTimestamp(a.dueAt) - toTimestamp(b.dueAt))[0];

  return {
    ucId: uc.id,
    partialAverage,
    gradedWeight: round1(clamp(gradedWeight, 0, 100)),
    remainingWeight: round1(clamp(100 - gradedWeight, 0, 100)),
    completedEvaluations: gradedEvaluations.length,
    totalEvaluations: evaluations.length,
    completionPercent: evaluations.length ? round1((gradedEvaluations.length / evaluations.length) * 100) : 0,
    nextDeadlineAt: nextDeadline?.dueAt ?? null,
  };
};

export const calculateSemesterStats = (
  semester: Semester,
  ucs: UC[],
  activities: Activity[],
  now: Date = new Date(),
): SemesterProgressStats => {
  const semesterUcs = ucs.filter((uc) => uc.semesterId === semester.id);
  const semesterEvaluations = activities.filter(
    (activity) => activity.semesterId === semester.id && activity.type === 'evaluation',
  );

  const ucStats = semesterUcs.map((uc) => ({ uc, stats: calculateUcStats(uc, activities, now) }));

  const weightedAverageBase = ucStats
    .filter((item) => item.stats.partialAverage !== null)
    .reduce(
      (acc, item) => {
        const ects = item.uc.ects;
        return {
          gradeByEcts: acc.gradeByEcts + (item.stats.partialAverage ?? 0) * ects,
          ects: acc.ects + ects,
        };
      },
      { gradeByEcts: 0, ects: 0 },
    );

  const semesterAverage =
    weightedAverageBase.ects > 0 ? round1(weightedAverageBase.gradeByEcts / weightedAverageBase.ects) : null;

  const completedEvaluations = semesterEvaluations.filter(
    (evaluation) => evaluation.grade?.score !== null,
  ).length;

  const totalEcts = semesterUcs.reduce((sum, uc) => sum + uc.ects, 0);
  const completedEcts = ucStats.reduce((sum, item) => {
    const hasAnyEvaluation = item.stats.totalEvaluations > 0;
    const isFullyWeighted = item.stats.remainingWeight === 0;
    return sum + (hasAnyEvaluation && isFullyWeighted ? item.uc.ects : 0);
  }, 0);

  return {
    semesterId: semester.id,
    semesterAverage,
    totalEcts,
    completedEcts,
    completionPercent:
      semesterEvaluations.length > 0
        ? round1((completedEvaluations / semesterEvaluations.length) * 100)
        : 0,
    completedEvaluations,
    totalEvaluations: semesterEvaluations.length,
  };
};

export const calculateCourseStats = (
  course: Course,
  semesters: Semester[],
  ucs: UC[],
  activities: Activity[],
  now: Date = new Date(),
): CourseProgressStats => {
  const courseSemesters = semesters.filter((semester) => semester.courseId === course.id);
  const semesterStats = courseSemesters.map((semester) =>
    calculateSemesterStats(semester, ucs, activities, now),
  );

  const weightedCourseAverage = semesterStats
    .filter((stats) => stats.semesterAverage !== null)
    .reduce(
      (acc, stats) => ({
        gradeByEcts: acc.gradeByEcts + (stats.semesterAverage ?? 0) * stats.totalEcts,
        ects: acc.ects + stats.totalEcts,
      }),
      { gradeByEcts: 0, ects: 0 },
    );

  const totalEcts = semesterStats.reduce((sum, stats) => sum + stats.totalEcts, 0);
  const completedEcts = semesterStats.reduce((sum, stats) => sum + stats.completedEcts, 0);

  return {
    courseId: course.id,
    courseAverage:
      weightedCourseAverage.ects > 0
        ? round1(weightedCourseAverage.gradeByEcts / weightedCourseAverage.ects)
        : null,
    totalEcts,
    completedEcts,
    completionPercent: totalEcts > 0 ? round1((completedEcts / totalEcts) * 100) : 0,
  };
};

export const getUpcomingDeadlines = (
  activities: Activity[],
  rangeDays: number,
  now: Date = new Date(),
): UpcomingDeadline[] => {
  const from = now.getTime();
  const to = from + Math.max(1, rangeDays) * DAY_IN_MS;

  return activities
    .filter((activity) => {
      const dueAt = toTimestamp(activity.dueAt);
      if (activity.status === 'completed' || activity.status === 'cancelled') return false;
      return dueAt >= from && dueAt <= to;
    })
    .sort((a, b) => toTimestamp(a.dueAt) - toTimestamp(b.dueAt))
    .map((activity) => ({
      activityId: activity.id,
      type: activity.type,
      title: activity.title,
      dueAt: activity.dueAt,
      semesterId: activity.semesterId,
      ucId: activity.ucId,
    }));
};
