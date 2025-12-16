import React, { useState } from 'react';
import styles from './styles.module.css';

interface QuestionnaireProps {
  onComplete: () => void;
}

interface QuestionStep {
  id: string;
  question: string;
  description?: string;
  type: 'single' | 'multiple' | 'slider' | 'text';
  options?: { value: string; label: string; description?: string }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
}

const questions: QuestionStep[] = [
  {
    id: 'experienceLevel',
    question: 'What is your current experience level with robotics?',
    description: 'This helps us tailor content to your level.',
    type: 'single',
    options: [
      {
        value: 'beginner',
        label: 'Beginner',
        description: 'New to robotics, some programming experience',
      },
      {
        value: 'intermediate',
        label: 'Intermediate',
        description: 'Built some projects, familiar with concepts',
      },
      {
        value: 'advanced',
        label: 'Advanced',
        description: 'Significant experience, looking to expand skills',
      },
    ],
  },
  {
    id: 'programmingLanguages',
    question: 'Which programming languages are you comfortable with?',
    description: 'Select all that apply.',
    type: 'multiple',
    options: [
      { value: 'python', label: 'Python' },
      { value: 'cpp', label: 'C/C++' },
      { value: 'javascript', label: 'JavaScript' },
      { value: 'arduino', label: 'Arduino' },
      { value: 'other', label: 'Other' },
      { value: 'none', label: 'None yet' },
    ],
  },
  {
    id: 'hasRoboticsExperience',
    question: 'Have you built any robotics projects before?',
    type: 'single',
    options: [
      { value: 'yes', label: 'Yes', description: 'I have hands-on project experience' },
      { value: 'no', label: 'No', description: 'This will be my first robotics project' },
    ],
  },
  {
    id: 'primaryGoals',
    question: 'What are your main goals for taking this course?',
    description: 'Select up to 3.',
    type: 'multiple',
    options: [
      { value: 'career', label: 'Career in robotics' },
      { value: 'hobby', label: 'Hobby projects' },
      { value: 'research', label: 'Academic research' },
      { value: 'startup', label: 'Building a startup' },
      { value: 'education', label: 'Teaching others' },
      { value: 'curiosity', label: 'General curiosity' },
    ],
  },
  {
    id: 'availableHardware',
    question: 'What hardware do you have access to?',
    description: 'Select all that you currently own or can easily access.',
    type: 'multiple',
    options: [
      { value: 'arduino', label: 'Arduino' },
      { value: 'raspberrypi', label: 'Raspberry Pi' },
      { value: 'esp32', label: 'ESP32' },
      { value: 'sensors', label: 'Basic sensors' },
      { value: 'motors', label: 'Motors/Servos' },
      { value: '3dprinter', label: '3D Printer' },
      { value: 'none', label: 'None yet' },
    ],
  },
  {
    id: 'weeklyHours',
    question: 'How many hours per week can you dedicate to learning?',
    description: 'Drag the slider to select.',
    type: 'slider',
    min: 1,
    max: 20,
    step: 1,
    defaultValue: 5,
  },
  {
    id: 'preferredLanguage',
    question: 'What is your preferred language for course content?',
    type: 'single',
    options: [
      { value: 'en', label: 'English' },
      { value: 'ur', label: 'Urdu (اردو)' },
    ],
  },
];

export default function BackgroundQuestionnaire({
  onComplete,
}: QuestionnaireProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleSingleSelect = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleMultipleSelect = (value: string) => {
    const current = (answers[currentQuestion.id] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setAnswers({ ...answers, [currentQuestion.id]: updated });
  };

  const handleSliderChange = (value: number) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const canProceed = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === 'slider') return true;
    if (currentQuestion.type === 'multiple') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  };

  const handleNext = async () => {
    if (isLastStep) {
      setLoading(true);
      try {
        // Get the auth token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

        // Submit questionnaire answers to API
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        await fetch('/api/profile/background', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            experienceLevel: answers.experienceLevel,
            programmingLanguages: answers.programmingLanguages || [],
            hasRoboticsExperience: answers.hasRoboticsExperience === 'yes',
            primaryGoals: answers.primaryGoals || [],
            availableHardware: answers.availableHardware || [],
            weeklyHoursAvailable: answers.weeklyHours || 5,
            preferredLanguage: answers.preferredLanguage || 'en',
          }),
        });
        onComplete();
      } catch (error) {
        console.error('Failed to save profile:', error);
        onComplete(); // Still continue even if save fails
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderQuestion = () => {
    const { type, options, min, max, step, defaultValue, id } = currentQuestion;

    switch (type) {
      case 'single':
        return (
          <div className={styles.options}>
            {options?.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.optionButton} ${
                  answers[id] === option.value ? styles.selected : ''
                }`}
                onClick={() => handleSingleSelect(option.value)}
              >
                <span className={styles.optionLabel}>{option.label}</span>
                {option.description && (
                  <span className={styles.optionDescription}>{option.description}</span>
                )}
              </button>
            ))}
          </div>
        );

      case 'multiple':
        const selectedMultiple = (answers[id] as string[]) || [];
        return (
          <div className={styles.optionsGrid}>
            {options?.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.chipButton} ${
                  selectedMultiple.includes(option.value) ? styles.selected : ''
                }`}
                onClick={() => handleMultipleSelect(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        );

      case 'slider':
        const sliderValue = (answers[id] as number) ?? defaultValue ?? min ?? 1;
        return (
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={sliderValue}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderValue}>
              <span className={styles.sliderNumber}>{sliderValue}</span>
              <span className={styles.sliderLabel}>hours per week</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.stepIndicator}>
        Step {currentStep + 1} of {questions.length}
      </div>

      <h2 className={styles.question}>{currentQuestion.question}</h2>
      {currentQuestion.description && (
        <p className={styles.description}>{currentQuestion.description}</p>
      )}

      {renderQuestion()}

      <div className={styles.actions}>
        {currentStep > 0 && (
          <button type="button" onClick={handleBack} className={styles.backButton}>
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed() || loading}
          className={styles.nextButton}
        >
          {loading ? 'Saving...' : isLastStep ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}
