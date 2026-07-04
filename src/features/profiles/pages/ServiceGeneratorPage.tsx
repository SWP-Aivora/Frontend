import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/Button';
import { aiServiceGeneratorService, type ServiceDescriptionResult } from '../aiServiceGeneratorService';

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
  const [result, setResult] = useState<ServiceDescriptionResult | null>(null);

  const generateMutation = useMutation({
    mutationFn: () => aiServiceGeneratorService.generateServiceDescription({
      rawInput: rawInput.trim(),
      skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
      priceFrom: Number(priceFrom) || 0,
      deliveryDays: Number(deliveryDays) || 0,
      tone,
      targetClient,
    }),
    onSuccess: (response) => {
      if (!response.data) {
        toast.error(response.message || 'Failed to generate service description');
        return;
      }
      setResult(response.data);
    },
    onError: () => {
      toast.error('Failed to generate service description');
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
            placeholder="e.g. I build custom React dashboards with data visualizations for SaaS startups"
            className="w-full p-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
          />
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
              <option value="confident">Confident</option>
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
              <option value="enterprise">Enterprise</option>
              <option value="smb">Small Business</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-50">
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !rawInput.trim()}
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
        </div>
      )}
    </div>
  );
};
