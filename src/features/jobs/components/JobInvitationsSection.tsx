import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { getErrorMessage } from '@/lib/api-utils';
import { JobInviteStatus, type JobInvite } from '../types';
import { jobService } from '../services';

export const JobInvitationsSection = () => {
  const queryClient = useQueryClient();

  const { data: invitesResponse } = useQuery({
    queryKey: ['jobs', 'invites', 'me'],
    queryFn: () => jobService.getMyInvites(),
  });

  const activeInvites = useMemo(() => {
    const invites = Array.isArray(invitesResponse?.data) ? invitesResponse.data : [];
    return invites.filter((invite) =>
      invite.status === JobInviteStatus.PENDING || invite.status === JobInviteStatus.ACCEPTED
    );
  }, [invitesResponse?.data]);

  const acceptInviteMutation = useMutation({
    mutationFn: (invite: JobInvite) => jobService.acceptInvite(invite.id),
    onSuccess: (response, invite) => {
      const acceptedInvite = response.data ?? invite;
      queryClient.setQueryData<Awaited<ReturnType<typeof jobService.getMyInvites>>>(
        ['jobs', 'invites', 'me'],
        (current) => current
          ? {
              ...current,
              data: (current.data ?? []).map((cachedInvite) =>
                cachedInvite.id === acceptedInvite.id ? acceptedInvite : cachedInvite
              ),
            }
          : current
      );
      queryClient.invalidateQueries({ queryKey: ['jobs', 'invites', 'me'] });
      toast.success('Invite accepted.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to accept invite.'));
    },
  });

  const declineInviteMutation = useMutation({
    mutationFn: (invite: JobInvite) => jobService.declineInvite(invite.id),
    onSuccess: (_response, invite) => {
      queryClient.setQueryData<Awaited<ReturnType<typeof jobService.getMyInvites>>>(
        ['jobs', 'invites', 'me'],
        (current) => current
          ? {
              ...current,
              data: (current.data ?? []).filter((cachedInvite) => cachedInvite.id !== invite.id),
            }
          : current
      );
      queryClient.invalidateQueries({ queryKey: ['jobs', 'invites', 'me'] });
      toast.success('Invite declined.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to decline invite.'));
    },
  });

  if (activeInvites.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Job Invitations</h2>
          <p className="text-sm font-medium text-slate-500">Jobs where a client invited you directly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeInvites.map((invite) => {
          const isPendingInvite = invite.status === JobInviteStatus.PENDING;
          const isInviteActionPending =
            (acceptInviteMutation.variables?.id === invite.id && acceptInviteMutation.isPending) ||
            (declineInviteMutation.variables?.id === invite.id && declineInviteMutation.isPending);

          return (
            <article key={invite.id} className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                      {invite.status === JobInviteStatus.ACCEPTED ? 'Invite Accepted' : 'Invited'}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-slate-900">{invite.jobTitle}</h3>
                </div>
                <Button asChild variant="outline" className="shrink-0 rounded-full">
                  <Link to={`/expert/jobs/${invite.jobId}`}>
                    View Job
                    <ChevronRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </div>

              {isPendingInvite && (
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isInviteActionPending}
                    onClick={() => declineInviteMutation.mutate(invite)}
                    className="rounded-full"
                  >
                    {declineInviteMutation.variables?.id === invite.id && declineInviteMutation.isPending ? 'Declining...' : 'Decline'}
                  </Button>
                  <Button
                    type="button"
                    disabled={isInviteActionPending}
                    onClick={() => acceptInviteMutation.mutate(invite)}
                    className="rounded-full"
                  >
                    {acceptInviteMutation.variables?.id === invite.id && acceptInviteMutation.isPending ? 'Accepting...' : 'Accept'}
                  </Button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};
