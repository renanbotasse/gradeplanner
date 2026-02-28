export interface AssessmentTemplate {
  id: string;
  label: string;
  components: Array<{
    title: string;
    type: 'assignment' | 'project' | 'exam';
    weight: number;
    isRequired: boolean;
    minGrade: number | null;
  }>;
}

export const assessmentTemplates: AssessmentTemplate[] = [
  {
    id: 'continuous_exam',
    label: 'Continuous + Final Exam',
    components: [
      { title: 'Project', type: 'project', weight: 40, isRequired: true, minGrade: null },
      { title: 'Final Exam', type: 'exam', weight: 60, isRequired: true, minGrade: 8 },
    ],
  },
  {
    id: 'three_folios_exam',
    label: '3 Assignments + Exam',
    components: [
      { title: 'Assignment 1', type: 'assignment', weight: 20, isRequired: true, minGrade: null },
      { title: 'Assignment 2', type: 'assignment', weight: 20, isRequired: true, minGrade: null },
      { title: 'Assignment 3', type: 'assignment', weight: 20, isRequired: true, minGrade: null },
      { title: 'Exam', type: 'exam', weight: 40, isRequired: true, minGrade: 8 },
    ],
  },
  {
    id: 'project_exam',
    label: 'Project + Exam',
    components: [
      { title: 'Project', type: 'project', weight: 50, isRequired: true, minGrade: null },
      { title: 'Exam', type: 'exam', weight: 50, isRequired: true, minGrade: 8 },
    ],
  },
];
