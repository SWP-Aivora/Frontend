import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Clock, FileText, Wallet } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { walletService } from '../services';

const SUCCESS_CODES = new Set(['00', '0', 'success', 'completed', 'paid']);
const PENDING_CODES = new Set(['pending', 'processing']);

const getParam = (params: URLSearchParams, keys: string[]): string | null => {
  for (const key of keys) {
    const value = params.get(key);
    if (value && value.trim() !== '') return value;
  }

  return null;
};

const formatGatewayAmount = (value: string | null): string | null => {
  if (!value) return null;

  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;

  return (numeric / 100).toLocaleString();
};

const getWalletBalance = (wallet: unknown): number | null => {
  if (!wallet || typeof wallet !== 'object') return null;

  const record = wallet as Record<string, unknown>;
  const candidates = [
    record.balance,
    record.availableBalance,
    record.walletBalance,
    record.amount,
    record.coins,
    record.coin,
    record.xu,
  ];

  for (const value of candidates) {
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }

  if (record.wallet && typeof record.wallet === 'object') {
    return getWalletBalance(record.wallet);
  }

  return null;
};

export const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const responseCode = getParam(searchParams, ['vnp_ResponseCode', 'responseCode', 'code', 'status']);
  const transactionStatus = getParam(searchParams, ['vnp_TransactionStatus', 'transactionStatus']);
  const normalizedResult = (transactionStatus || responseCode || '').toLowerCase();
  const isSuccess = SUCCESS_CODES.has(normalizedResult) || responseCode === '00' || transactionStatus === '00';
  const isPending = PENDING_CODES.has(normalizedResult);
  const isFailure = Boolean(responseCode || transactionStatus) && !isSuccess && !isPending;

  const transactionRef = getParam(searchParams, ['vnp_TxnRef', 'txnRef', 'orderId', 'referenceId']);
  const transactionNo = getParam(searchParams, ['vnp_TransactionNo', 'transactionNo']);
  const bankCode = getParam(searchParams, ['vnp_BankCode', 'bankCode']);
  const orderInfo = getParam(searchParams, ['vnp_OrderInfo', 'orderInfo', 'message']);
  const payDate = getParam(searchParams, ['vnp_PayDate', 'payDate']);
  const amount = formatGatewayAmount(getParam(searchParams, ['vnp_Amount', 'amount']));

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ['wallet'] });
    void queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
  }, [queryClient]);

  const { data: walletResponse, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletService.getWallet(),
  });

  const { isFetching: isRefreshingHistory } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletService.getPaymentHistory(),
  });

  const walletBalance = useMemo(() => getWalletBalance(walletResponse?.data), [walletResponse?.data]);
  const statusConfig = isSuccess
    ? {
        icon: CheckCircle2,
        title: 'Payment Completed',
        description: 'VNPay returned a successful payment result. Your wallet data below is loaded from the backend.',
        tone: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
      }
    : isPending
      ? {
          icon: Clock,
          title: 'Payment Processing',
          description: 'The gateway returned a pending result. Refresh your wallet if the balance has not updated yet.',
          tone: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-100',
        }
      : {
          icon: AlertCircle,
          title: isFailure ? 'Payment Not Completed' : 'Payment Result',
          description: isFailure
            ? 'The gateway returned an unsuccessful payment result. No frontend balance was changed.'
            : 'Review the payment details returned by the gateway.',
          tone: 'text-rose-600',
          bg: 'bg-rose-50',
          border: 'border-rose-100',
        };

  const StatusIcon = statusConfig.icon;
  const details = [
    ['Response Code', responseCode],
    ['Transaction Status', transactionStatus],
    ['Transaction Ref', transactionRef],
    ['Transaction No', transactionNo],
    ['Bank Code', bankCode],
    ['Gateway Amount', amount],
    ['Pay Date', payDate],
    ['Order Info', orderInfo],
  ].filter((detail): detail is [string, string] => Boolean(detail[1]));

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className={`rounded-lg border ${statusConfig.border} ${statusConfig.bg} p-6 shadow-sm`}>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <StatusIcon className={`size-7 ${statusConfig.tone}`} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{statusConfig.title}</h1>
              <p className="text-sm font-medium leading-6 text-slate-600">{statusConfig.description}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Wallet className="size-5 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Wallet Snapshot</h2>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {isLoadingWallet
              ? 'Loading...'
              : walletBalance === null
                ? 'Unavailable'
                : `${walletBalance.toLocaleString()} Aivora Coin`}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            {isRefreshingHistory ? 'Refreshing wallet history...' : 'Loaded from backend wallet APIs'}
          </p>
        </div>

        {details.length > 0 && (
          <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <FileText className="size-5 text-primary" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Gateway Details</h2>
            </div>
            <dl className="divide-y divide-slate-100">
              {details.map(([label, value]) => (
                <div key={label} className="grid gap-2 py-3 sm:grid-cols-[160px_1fr]">
                  <dt className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</dt>
                  <dd className="break-words text-sm font-semibold text-slate-700">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="rounded-full font-black shadow-lg shadow-primary/20">
            <Link to="/client/wallet">Back to Wallet</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full font-bold">
            <Link to="/client">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
