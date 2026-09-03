import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import { AILearningSetup } from './AILearningSetup';
import { AILessonPlayer } from './AILessonPlayer';
import { Spinner } from '../../../components/common/Spinner';

export const AILearningTutor = () => {
  const { showSuccess, showError } = useToast();
  const [activeView, setActiveView] = useState('setup'); // 'setup' | 'player'
  const [currentPath, setCurrentPath] = useState(null);
  const [pastPaths, setPastPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadUserPaths();
  }, []);

  const loadUserPaths = async () => {
    try {
      setInitialLoading(true);
      const paths = await apiService.getLearningPaths();
      setPastPaths(paths || []);
    } catch (err) {
      console.warn('Could not load existing paths:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleGeneratePath = async (payload) => {
    try {
      setIsLoading(true);
      const newPath = await apiService.generateLearningPath(payload);
      setCurrentPath(newPath);
      setActiveView('player');
      showSuccess(`Generated ${newPath.lessons?.length || 6} micro-lessons for ${newPath.topic}!`);
      // Refresh past paths list in background
      loadUserPaths();
    } catch (err) {
      showError('Failed to generate learning path. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPastPath = async (pathId) => {
    try {
      setIsLoading(true);
      const pathData = await apiService.getLearningPathById(pathId);
      setCurrentPath(pathData);
      setActiveView('player');
    } catch (err) {
      showError('Could not load the selected learning path.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgressUpdated = (pathId, lessonNumber, isCompleted) => {
    // Update local pastPaths summary
    setPastPaths((prev) =>
      prev.map((p) => {
        if (p.id === pathId) {
          const newCompleted = isCompleted
            ? Math.min(p.total_lessons, p.completed_lessons + 1)
            : Math.max(0, p.completed_lessons - 1);
          return {
            ...p,
            completed_lessons: newCompleted,
            completion_percentage: Math.round((newCompleted / Math.max(p.total_lessons, 1)) * 100),
          };
        }
        return p;
      })
    );
  };

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (activeView === 'player' && currentPath) {
    return (
      <AILessonPlayer
        path={currentPath}
        initialLessonIndex={0}
        onExit={() => {
          setActiveView('setup');
          loadUserPaths();
        }}
        onProgressUpdated={handleProgressUpdated}
      />
    );
  }

  return (
    <AILearningSetup
      onGeneratePath={handleGeneratePath}
      pastPaths={pastPaths}
      onSelectPastPath={handleSelectPastPath}
      isLoading={isLoading}
    />
  );
};
