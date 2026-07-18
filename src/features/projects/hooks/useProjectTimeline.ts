import { useCallback, useMemo, useState } from 'react';
import { formatDate } from '@/shared/utils/date';
import type { Milestone } from '../types';

export type ProjectWorkspaceView = 'overview' | 'timeline';

export interface TimelineInfoCard {
  label: string;
  value: string;
}

interface UseProjectTimelineParams {
  milestones: Milestone[];
  selectedMilestone: Milestone | null;
}

export const useProjectTimeline = ({
  milestones,
  selectedMilestone,
}: UseProjectTimelineParams) => {
  const [workspaceView, setWorkspaceView] = useState<ProjectWorkspaceView>('overview');
  const [timelineMilestoneId, setTimelineMilestoneId] = useState('');
  const [viewedTimelineMilestoneId, setViewedTimelineMilestoneId] = useState('');
  const [stepEditorMilestoneId, setStepEditorMilestoneId] = useState('');

  const sortedMilestones = useMemo(
    () => milestones.slice().sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
    [milestones]
  );

  const viewedTimelineMilestone = useMemo(
    () => sortedMilestones.find((milestone) => milestone.id === viewedTimelineMilestoneId) ?? null,
    [sortedMilestones, viewedTimelineMilestoneId]
  );

  const stepEditorMilestone = useMemo(
    () => sortedMilestones.find((milestone) => milestone.id === stepEditorMilestoneId) ?? selectedMilestone,
    [selectedMilestone, sortedMilestones, stepEditorMilestoneId]
  );

  const timelineInfoCards = useMemo(() => {
    if (!viewedTimelineMilestone) return [];

    const cards: TimelineInfoCard[] = [];
    if (viewedTimelineMilestone.amount !== null && viewedTimelineMilestone.amount !== undefined) {
      cards.push({ label: 'Budget', value: `${viewedTimelineMilestone.amount.toLocaleString()} Aivora Coin` });
    }
    if (viewedTimelineMilestone.createdAt) {
      cards.push({ label: 'Created At', value: formatDate(viewedTimelineMilestone.createdAt) });
    }
    if (viewedTimelineMilestone.dueDate) {
      cards.push({ label: 'Due Date', value: formatDate(viewedTimelineMilestone.dueDate) });
    }
    if (viewedTimelineMilestone.dueDays !== null && viewedTimelineMilestone.dueDays !== undefined) {
      cards.push({ label: 'Due Days', value: `${viewedTimelineMilestone.dueDays} Days` });
    }
    if (viewedTimelineMilestone.fundedAt) {
      cards.push({ label: 'Funded At', value: formatDate(viewedTimelineMilestone.fundedAt) });
    }
    if (viewedTimelineMilestone.submittedAt) {
      cards.push({ label: 'Submitted At', value: formatDate(viewedTimelineMilestone.submittedAt) });
    }
    if (viewedTimelineMilestone.approvedAt) {
      cards.push({ label: 'Approved At', value: formatDate(viewedTimelineMilestone.approvedAt) });
    }
    if (viewedTimelineMilestone.paidAt) {
      cards.push({ label: 'Paid At', value: formatDate(viewedTimelineMilestone.paidAt) });
    }
    if (viewedTimelineMilestone.releasedAt) {
      cards.push({ label: 'Released At', value: formatDate(viewedTimelineMilestone.releasedAt) });
    }

    return cards;
  }, [viewedTimelineMilestone]);

  const resetTimeline = useCallback(() => {
    setWorkspaceView('overview');
    setTimelineMilestoneId('');
    setViewedTimelineMilestoneId('');
    setStepEditorMilestoneId('');
  }, []);

  return {
    workspaceView,
    setWorkspaceView,
    timelineMilestoneId,
    setTimelineMilestoneId,
    viewedTimelineMilestoneId,
    setViewedTimelineMilestoneId,
    stepEditorMilestoneId,
    setStepEditorMilestoneId,
    sortedMilestones,
    viewedTimelineMilestone,
    stepEditorMilestone,
    timelineInfoCards,
    resetTimeline,
  };
};
