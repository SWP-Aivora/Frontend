import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Sparkles, Copy, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/Button';
import { aiServiceGeneratorService, type ServiceDescriptionResult } from '../aiServiceGeneratorService';
import { profileService } from '../services';

const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard`);
};

export const ServiceGeneratorPage = () => {
  const [rawInput, setRawInput] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [priceFrom, setPriceFrom] = useState('100');
  const [deliveryDays, setDeliveryDays] = useState('7');
  const [tone, setTone] = useState('professional');
  const [targetClient, setTargetClient] = useState('startup');
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState<ServiceDescriptionResult | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalBio, setModalBio] = useState('');

  const { data: profileResponse, refetch: refetchProfile } = useQuery({
    queryKey: ['expertProfile'],
    queryFn: profileService.getExpertProfile,
    enabled: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { title: string; bio: string; hourlyRate: number; experienceYears: number; availabilityStatus: number }) => 
      profileService.updateExpertProfile({
        title: data.title,
        bio: data.bio,
        hourlyRate: data.hourlyRate,
        experienceYears: data.experienceYears,
        availabilityStatus: data.availabilityStatus
      }),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      setIsModalOpen(false);
    },
    onError: (err: unknown) => {
      const error = err as Record<string, unknown> & { response?: { data?: { message?: string } } };
      toast.error('Failed to update profile');
      console.error(error);
    }
  });

  const handleOpenModal = async () => {
    if (!result) return;
    
    let fullBio = result.suggestedDescription + '\n\n';
    
    if (result.packages.length > 0) {
      fullBio += '--- PACKAGES ---\n';
      result.packages.forEach(pkg => {
        fullBio += `${pkg.name} (${pkg.price} Aivora Coin): ${pkg.description}\n`;
      });
      fullBio += '\n';
    }
    
    if (result.faqs.length > 0) {
      fullBio += '--- FAQs ---\n';
      result.faqs.forEach(faq => {
        fullBio += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
      });
    }

    setModalTitle(result.suggestedTitle);
    setModalBio(fullBio.trim());
    
    await refetchProfile();
    setIsModalOpen(true);
  };

  const handleSaveToProfile = () => {
    const currentProfile = profileResponse?.data;
    if (!currentProfile) {
      toast.error('Could not fetch current profile data');
      return;
    }
    updateProfileMutation.mutate({
      title: modalTitle,
      bio: modalBio,
      hourlyRate: currentProfile.hourlyRate || 0,
      experienceYears: currentProfile.experienceYears || 0,
      availabilityStatus: currentProfile.availabilityStatus || 1,
    });
  };

  const generateMutation = useMutation({
    mutationFn: () => aiServiceGeneratorService.generateServiceDescription({
      rawInput: rawInput.trim(),
      skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
      priceFrom: Number(priceFrom) || 0,
      deliveryDays: Number(deliveryDays) || 0,
      tone,
      targetClient,
      language,
    }),
    onSuccess: (response) => {
      if (!response.data) {
        toast.error(response.message || 'Failed to generate service description');
        return;
      }
      setResult(response.data);
    },
    onError: (err: unknown) => {
      const error = err as Record<string, unknown> & { response?: { data?: { message?: string; title?: string; errors?: Record<string, string[]> } }; message?: string; name?: string; code?: string };
      const serverData = error?.response?.data;
      const serverMessage = serverData?.message || serverData?.title || (serverData?.errors ? Object.values(serverData.errors)[0] : null);
      
      if (!error.response && (error?.message === 'Network Error' || error?.name === 'AxiosError' || error?.code === 'ERR_NETWORK')) {
        toast.error('Network error: Please check your internet connection.');
      } else {
        toast.error(serverMessage ? `Lỗi: ${serverMessage}` : 'Failed to generate service description');
        console.error("API 400 Error Details:", serverData);
      }
    },
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-lg border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900">AI Service Generator</h1>
        <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
          Describe the service you offer and let AI draft a title, description, pricing packages, and FAQs you can copy into your listings.
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-lg p-8 shadow-sm space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">What service do you offer?</label>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={4}
            placeholder="e.g. I build custom React dashboards with data visualizations for SaaS startups (min 20 characters)"
            className="w-full p-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
          />
          {rawInput.trim().length > 0 && rawInput.trim().length < 20 && (
            <p className="text-xs text-red-500 ml-1">Description must be at least 20 characters.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Skills (comma separated)</label>
            <input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="React, TypeScript, D3.js"
              className="w-full h-11 px-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Starting Price</label>
              <input
                type="number"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Delivery Days</label>
              <input
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full h-11 px-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none font-medium"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="premium">Premium</option>
              <option value="technical">Technical</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Target Client</label>
            <select
              value={targetClient}
              onChange={(e) => setTargetClient(e.target.value)}
              className="w-full h-11 px-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none font-medium"
            >
              <option value="startup">Startups</option>
              <option value="sme">SME (Small/Medium Enterprise)</option>
              <option value="enterprise">Enterprise</option>
              <option value="individual">Individual</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full h-11 px-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none font-medium"
            >
              <option value="en">English</option>
              <option value="vi">Vietnamese</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-50">
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || rawInput.trim().length < 20 || !skillsInput.trim() || Number(priceFrom) <= 0 || Number(deliveryDays) <= 0}
            className="rounded-lg px-8 h-11 font-bold shadow-lg shadow-primary/20 uppercase tracking-wider text-xs flex items-center gap-2"
          >
            <Sparkles className="size-4" />
            {generateMutation.isPending ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </div>

      {result && (
        <div className="bg-white border border-slate-100 rounded-lg p-8 shadow-sm space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggested Title</label>
              <button onClick={() => copyToClipboard(result.suggestedTitle, 'Title')} className="text-slate-400 hover:text-primary transition-colors">
                <Copy className="size-4" />
              </button>
            </div>
            <p className="text-lg font-black text-slate-900">{result.suggestedTitle}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggested Description</label>
              <button onClick={() => copyToClipboard(result.suggestedDescription, 'Description')} className="text-slate-400 hover:text-primary transition-colors">
                <Copy className="size-4" />
              </button>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.suggestedDescription}</p>
          </div>

          {result.packages.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Packages</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.packages.map((pkg, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-primary uppercase tracking-wider">{pkg.name}</p>
                      <button onClick={() => copyToClipboard(pkg.description, `${pkg.name} package`)} className="text-slate-400 hover:text-primary transition-colors">
                        <Copy className="size-3" />
                      </button>
                    </div>
                    {pkg.title && <p className="text-sm font-bold text-slate-900">{pkg.title}</p>}
                    <p className="text-sm font-black text-slate-900">{pkg.price.toLocaleString()} Aivora Coin</p>
                    <p className="text-xs text-slate-500 font-medium">{pkg.deliveryDays} days delivery</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{pkg.description}</p>
                    {pkg.features.length > 0 && (
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                        {pkg.features.map((feature, featureIdx) => (
                          <li key={featureIdx}>{feature}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.faqs.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FAQs</label>
              <div className="space-y-3">
                {result.faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-sm font-bold text-slate-900 mb-1">{faq.question}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-6 border-t border-slate-100">
            <Button onClick={handleOpenModal} className="rounded-lg px-8 h-11 font-bold shadow-lg shadow-primary/20 uppercase tracking-wider text-xs">
              Apply to Profile
            </Button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Review & Apply to Profile</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Title</label>
                <input
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Bio (including Packages & FAQs)</label>
                <textarea
                  value={modalBio}
                  onChange={(e) => setModalBio(e.target.value)}
                  rows={12}
                  className="w-full p-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveToProfile} disabled={updateProfileMutation.isPending} className="flex items-center gap-2">
                <Check className="size-4" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Confirm & Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
