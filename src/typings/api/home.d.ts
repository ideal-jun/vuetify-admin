declare namespace Api {
  /**
   * namespace Home
   *
   * backend api module: "home"
   */
  namespace Home {
    /** The stat keys rendered on the home page */
    type StatKey = 'users' | 'orders' | 'revenue' | 'conversion';

    /** A single statistic card */
    interface Stat {
      key: StatKey;
      value: number;
      trend: string;
      positive: boolean;
      /** SVG polyline points */
      sparkline: string;
    }

    /** The weekly revenue trend */
    interface Trend {
      thisWeek: number[];
      lastWeek: number[];
    }

    /** The traffic source keys */
    type SourceKey = 'direct' | 'search' | 'social' | 'referral';

    /** The traffic source percentages */
    type Sources = Record<SourceKey, number>;

    /** The numbers used by the creativity banner */
    interface Creativity {
      quickActions: number;
      presets: number;
      columns: number;
    }

    /** The home page overview data */
    interface Overview {
      stats: Stat[];
      trend: Trend;
      sources: Sources;
      creativity: Creativity;
      totalUsers: number;
    }
  }
}
