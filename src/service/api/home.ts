import { fetchGetMenuList, fetchGetRoleList, fetchGetUserList } from './system-manage';

/** Compose the home overview from the real backend counts, keeping the dashboard deterministic */
function composeHomeOverview(counts: {
  userTotal: number;
  roleTotal: number;
  menuTotal: number;
}): Api.Home.Overview {
  const { userTotal, roleTotal, menuTotal } = counts;
  const orders = userTotal * 3 + menuTotal;
  const revenue = (orders + roleTotal) * 42;
  const seed = userTotal * 3 + roleTotal * 5 + menuTotal * 7;

  const createTrend = (base: number) =>
    [0, 1, 2, 3, 4, 5, 6].map((day) => 20 + ((base + day * 11) % 60));
  const createSparkline = (offset: number) =>
    [0, 1, 2, 3, 4, 5, 6]
      .map((point) => `${point * 12},${8 + ((seed + offset + point * 7) % 20)}`)
      .join(' ');

  return {
    stats: [
      {
        key: 'users',
        value: userTotal,
        trend: `+${(userTotal % 20) + 3}.${userTotal % 10}%`,
        positive: true,
        sparkline: createSparkline(0),
      },
      {
        key: 'orders',
        value: orders,
        trend: `+${(orders % 20) + 2}.${orders % 10}%`,
        positive: true,
        sparkline: createSparkline(3),
      },
      {
        key: 'revenue',
        value: revenue,
        trend: `+${(revenue % 25) + 2}.${revenue % 10}%`,
        positive: true,
        sparkline: createSparkline(6),
      },
      {
        key: 'conversion',
        value: Number((((seed % 90) + 10) / 10).toFixed(1)),
        trend: `-${1 + (seed % 4)}.${seed % 10}%`,
        positive: false,
        sparkline: createSparkline(9),
      },
    ],
    trend: {
      thisWeek: createTrend(seed),
      lastWeek: createTrend(seed + 5),
    },
    sources: {
      direct: 38,
      search: 28,
      social: 20,
      referral: 14,
    },
    creativity: {
      quickActions: 12 + (userTotal % 12),
      presets: 2 + (roleTotal % 4),
      columns: 8 + (menuTotal % 9),
    },
    totalUsers: userTotal,
  };
}

/** Get the data rendered by the home page, composed from the RuoYi lists */
export async function fetchGetHomeOverview(): Promise<
  App.Service.FlatResponseData<Api.Home.Overview>
> {
  const [usersResult, rolesResult, menusResult] = await Promise.all([
    fetchGetUserList({ userName: null, phonenumber: null, status: null, pageNum: 1, pageSize: 1 }),
    fetchGetRoleList({ roleName: null, roleKey: null, status: null, pageNum: 1, pageSize: 1 }),
    fetchGetMenuList(),
  ]);

  if (usersResult.data === null || rolesResult.data === null || menusResult.data === null) {
    return {
      data: null,
      error: usersResult.error ??
        rolesResult.error ??
        menusResult.error ?? {
          code: 'HOME_OVERVIEW_ERROR',
          message: 'The home overview could not be loaded.',
        },
    };
  }

  return {
    data: composeHomeOverview({
      userTotal: usersResult.data.total,
      roleTotal: rolesResult.data.total,
      menuTotal: menusResult.data.length,
    }),
    error: null,
  };
}
