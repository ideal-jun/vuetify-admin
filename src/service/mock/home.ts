import { jsonClone } from '@/utils/common';

const overview: Api.Home.Overview = {
  stats: [
    {
      key: 'users',
      value: 12_840,
      trend: '+12.5%',
      positive: true,
      sparkline: '0,22 12,18 24,20 36,12 48,14 60,6 72,8',
    },
    {
      key: 'orders',
      value: 3280,
      trend: '+8.2%',
      positive: true,
      sparkline: '0,18 12,20 24,14 36,16 48,10 60,12 72,5',
    },
    {
      key: 'revenue',
      value: 86_420,
      trend: '+18.9%',
      positive: true,
      sparkline: '0,20 12,14 24,16 36,8 48,12 60,4 72,7',
    },
    {
      key: 'conversion',
      value: 12.8,
      trend: '-1.4%',
      positive: false,
      sparkline: '0,8 12,6 24,10 36,14 48,12 60,18 72,20',
    },
  ],
  trend: {
    thisWeek: [32, 45, 38, 64, 52, 78, 88],
    lastWeek: [22, 30, 42, 36, 48, 55, 62],
  },
  sources: {
    direct: 38,
    search: 28,
    social: 20,
    referral: 14,
  },
  creativity: {
    quickActions: 24,
    presets: 4,
    columns: 16,
  },
  totalUsers: 12_840,
};

/** The mock home overview endpoint */
export function handleHomeMockRequest(
  config: App.Service.RequestConfig,
): App.Service.FlatResponseData<Api.Home.Overview> | null {
  const method = config.method || 'GET';

  if (method === 'GET' && config.url === '/home/overview') {
    return {
      data: jsonClone(overview),
      error: null,
    };
  }

  return null;
}
