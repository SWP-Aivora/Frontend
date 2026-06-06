import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KanbanBoard } from '../components/KanbanBoard';
import type { Milestone, Project } from '../types';
import { 
  ChevronLeft, 
  Settings, 
  Share2, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  X, 
  Upload, 
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/features/auth/store';
import { Role } from '@/shared/types/enums';
import { cn } from '@/lib/utils';

export const ProjectWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mocking project and milestones data
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProject({
        id: id!,
        title: 'Computer Vision Model for Medical Imaging',
        description: 'Advanced classification model for retina fundus images.',
        status: 2, // In Progress
        clientId: 'c1',
        expertId: 'e1',
        client: { id: 'c1', fullName: 'HealthTech Inc.', avatarUrl: null, role: Role.CLIENT },
        expert: { id: 'e1', fullName: 'Dr. Alex Rivera', avatarUrl: null, role: Role.EXPERT },
        totalBudget: 5000,
        remainingBudget: 3500,
        startDate: new Date().toISOString(),
        endDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        milestones: []
      });

      setMilestones([
        { id: 'm1', title: 'Data Preprocessing', amount: 1500, status: 3, orderIndex: 0, dueDate: null, dueDays: 2, acceptanceCriteria: null, description: 'Cleaning and normalizing the dataset.', projectId: id!, createdAt: '', updatedAt: '' },
        { id: 'm2', title: 'Model Architecture Design', amount: 1000, status: 2, orderIndex: 1, dueDate: null, dueDays: 3, acceptanceCriteria: null, description: 'Defining the CNN layers.', projectId: id!, createdAt: '', updatedAt: '' },
        { id: 'm3', title: 'Initial Training Run', amount: 1500, status: 1, orderIndex: 2, dueDate: null, dueDays: 7, acceptanceCriteria: null, description: 'First epoch training.', projectId: id!, createdAt: '', updatedAt: '' },
        { id: 'm4', title: 'Final Validation & Report', amount: 1000, status: 0, orderIndex: 3, dueDate: null, dueDays: 5, acceptanceCriteria: null, description: '95% accuracy verification.', projectId: id!, createdAt: '', updatedAt: '' },
      ]);
      
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  const handleMilestoneClick = (milestone: Milestone) => setSelectedMilestone(milestone);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Entering Workspace...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20 animate-in fade-in duration-700">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="space-y-1">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors group mb-3"
          >
            <ChevronLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">{project?.title}</h1>
             <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-100">
                In Progress
             </div>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-2xl">{project?.description}</p>
        </div>

        <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" className="rounded-2xl border-slate-200 text-slate-400 hover:text-slate-900">
              <Share2 className="size-4" />
           </Button>
           <Button variant="outline" size="icon" className="rounded-2xl border-slate-200 text-slate-400 hover:text-slate-900">
              <Settings className="size-4" />
           </Button>
           <Button className="rounded-full px-6 shadow-lg shadow-primary/20 flex items-center gap-2">
              <MessageSquare className="size-4" />
              Open Chat
           </Button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-[40px] p-6 md:p-8 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-brand-accent to-blue-400" />
         
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                     <DollarSign className="size-5 text-emerald-600" />
                  </div>
                  <div>
                     <p className="text-lg font-black text-slate-900 leading-none">${project?.totalBudget}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Contract</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                     <Calendar className="size-5 text-blue-600" />
                  </div>
                  <div>
                     <p className="text-lg font-black text-slate-900 leading-none">June 30</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Target Deadline</p>
                  </div>
               </div>
            </div>

            <div className="flex -space-x-3">
               {[project?.client, project?.expert].map((u, i) => (
                 <div key={i} className="size-10 rounded-full border-4 border-slate-50 bg-slate-200 flex items-center justify-center overflow-hidden shadow-sm" title={u?.fullName}>
                    {u?.avatarUrl ? <img src={u.avatarUrl} className="size-full object-cover" /> : <span className="text-xs font-black">{u?.fullName.charAt(0)}</span>}
                 </div>
               ))}
            </div>
         </div>

         <KanbanBoard 
           milestones={milestones} 
           role={user?.role === Role.CLIENT ? 'CLIENT' : 'EXPERT'}
           onMilestoneClick={handleMilestoneClick}
         />
      </div>

      {/* Side Detail Panel (Overlay) */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-out border-l border-slate-100 p-8",
        selectedMilestone ? "translate-x-0" : "translate-x-full"
      )}>
         {selectedMilestone && (
           <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-10">
                 <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                    Milestone Details
                 </div>
                 <button onClick={() => setSelectedMilestone(null)} className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                    <X className="size-5" />
                 </button>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto pr-2 scrollbar-hide">
                 <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedMilestone.title}</h2>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{selectedMilestone.description}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                       <DollarSign className="size-5 text-emerald-600 mb-2" />
                       <p className="text-lg font-black text-slate-900">${selectedMilestone.amount}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget Locked</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                       <Clock className="size-5 text-blue-600 mb-2" />
                       <p className="text-lg font-black text-slate-900">5 Days</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Duration</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle2 className="size-4 text-primary" />
                       Acceptance Criteria
                    </h3>
                    <ul className="space-y-3">
                       {['Code hosted on GitHub', 'Unit tests passing (>80%)', 'Documentation provided'].map((item, idx) => (
                         <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                            <span className="size-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                            {item}
                         </li>
                       ))}
                    </ul>
                 </div>
              </div>

              {/* Action Buttons based on status and role */}
              <div className="pt-8 border-t border-slate-100 space-y-3">
                 {selectedMilestone.status === 0 && user?.role === Role.CLIENT && (
                   <Button className="w-full h-14 rounded-full font-black text-base shadow-xl shadow-primary/20">
                      Fund Milestone
                   </Button>
                 )}
                 {selectedMilestone.status === 1 && user?.role === Role.EXPERT && (
                   <Button className="w-full h-14 rounded-full font-black text-base bg-brand-accent hover:bg-brand-accent/90 shadow-xl shadow-brand-accent/20 flex items-center justify-center gap-2">
                      <Upload className="size-5" />
                      Submit Deliverables
                   </Button>
                 )}
                 {selectedMilestone.status === 2 && user?.role === Role.CLIENT && (
                   <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 h-14 rounded-full font-black border-slate-200">Revision</Button>
                      <Button className="flex-[2] h-14 rounded-full font-black shadow-xl shadow-primary/20">Approve & Pay</Button>
                   </div>
                 )}
                 {selectedMilestone.status === 3 && (
                   <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3">
                      <CheckCircle2 className="size-6 shrink-0" />
                      <div>
                         <p className="font-black text-sm uppercase">Milestone Completed</p>
                         <p className="text-xs font-bold opacity-80">Payment of ${selectedMilestone.amount} has been released.</p>
                      </div>
                   </div>
                 )}
              </div>
           </div>
         )}
      </div>

      {/* Overlay backdrop */}
      {selectedMilestone && (
        <div 
          onClick={() => setSelectedMilestone(null)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-500 animate-in fade-in" 
        />
      )}
    </div>
  );
};
