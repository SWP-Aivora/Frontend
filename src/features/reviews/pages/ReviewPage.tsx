import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReviewModal } from '../components/ReviewModal';
import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/features/auth/store';
import { Role } from '@/shared/types/enums';
import { CheckCircle, ArrowRight, Star } from 'lucide-react';

const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Mock project info for testing the modal
  const mockProject = {
    id: 'f5e6d7c8-b9a0-4123-8901-23456789abcd',
    title: 'Vietnamese Customer Support Chatbot',
    milestone: 'Final Delivery and Handover',
    completedDate: 'June 12, 2026',
    clientName: 'Linh Tran',
    expertName: 'An Nguyen',
    amount: '$635',
    revieweeId: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  };

  const handleSkip = () => {
    const role = user?.role || Role.CLIENT;
    if (role === Role.ADMIN) navigate('/admin');
    else if (role === Role.EXPERT) navigate('/expert');
    else navigate('/client');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-slate-200/50 max-w-2xl w-full text-center space-y-10 border border-slate-100 relative overflow-hidden">
        {/* Success Background Element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-50 rounded-full blur-3xl" />
        
        <div className="space-y-6 relative z-10">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 animate-in zoom-in duration-500">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Project Successfully Completed!</h1>
            <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
              This project has been marked as finished. You can leave a review now to help the community, or skip this step for later.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left relative z-10">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-primary rounded-full" />
              Project Details
            </h2>
            <ul className="space-y-3">
              <li className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Project Name</span>
                <span className="text-sm font-bold text-slate-800">{mockProject.title}</span>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Milestone</span>
                <span className="text-sm font-bold text-slate-800">{mockProject.milestone}</span>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Amount Released</span>
                <span className="text-sm font-bold text-emerald-600">{mockProject.amount}</span>
              </li>
            </ul>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-emerald-500 rounded-full" />
              Status Info
            </h2>
            <ul className="space-y-3">
              <li className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Project Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-emerald-600">Completed</span>
                </div>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Completion Status</span>
                <span className="text-xs font-medium text-slate-600 mt-1">All milestones delivered and approved.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 relative z-10">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-[#1f6eeb] hover:bg-[#1656c0] text-white px-10 py-7 text-lg rounded-2xl shadow-xl shadow-[#1f6eeb]/20 transition-all hover:scale-105 active:scale-95 font-black group"
          >
            <Star className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            Write Review
          </Button>
          
          <Button 
            variant="ghost"
            onClick={handleSkip}
            className="w-full sm:w-auto text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-10 py-7 text-lg rounded-2xl font-bold transition-all group"
          >
            Skip for Now
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="pt-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-50">
          AIVORA Review System v1.0
        </div>
      </div>

      <ReviewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        projectInfo={mockProject}
      />
    </div>
  );
};

export default ReviewPage;
