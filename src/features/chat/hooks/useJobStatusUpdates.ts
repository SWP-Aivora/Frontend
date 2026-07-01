import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chatService } from '../services';

export interface JobStatusPayload {
  jobId: string;
  status: string;
  title?: string;
}

export const useJobStatusUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleJobStatusUpdate = (data: JobStatusPayload) => {
      console.log('Job status updated:', data);

      // Invalidate jobs query to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ['clientJobs']
      });

      // Update specific job in cache if needed
      queryClient.setQueryData(['clientJobs'], (oldData: any) => {
        if (!oldData?.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((job: any) =>
            job.id === data.jobId
              ? {
                  ...job,
                  status: data.status,
                  title: data.title || job.title
                }
              : job
          )
        };
      });

      // Show toast notification
      const statusMap: Record<string, string> = {
        'draft': 'Draft',
        'open': 'Open',
        'in-progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
      };

      const statusText = statusMap[data.status] || data.status;
      toast.success(`Job "${data.title}" status updated to: ${statusText}`);
      console.log(`Job ${data.jobId} status updated to: ${data.status}`);
    };

    // Subscribe to job status updates
    chatService.onJobStatusUpdate(handleJobStatusUpdate);

    return () => {
      chatService.setCallbacks({}); // Cleanup listeners
    };
  }, [queryClient]);
};