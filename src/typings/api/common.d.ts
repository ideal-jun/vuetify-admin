/**
 * Namespace Api
 *
 * All backend api types
 */
declare namespace Api {
  namespace Common {
    /** Common params of paginating */
    interface PaginatingCommonParams {
      /** Current page number */
      current: number;
      /** Page size */
      size: number;
      /** Total count */
      total: number;
    }

    /** Common params of a paginating query list */
    interface PaginatingQueryRecord<T = unknown> extends PaginatingCommonParams {
      records: T[];
    }

    /** Common search params of a table */
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /**
     * Enable status
     *
     * - "1": enabled
     * - "2": disabled
     */
    type EnableStatus = '1' | '2';

    /** Common record */
    type CommonRecord<T = unknown> = {
      /** Record id */
      id: number;
      /** Record creator */
      createBy: string;
      /** Record create time */
      createTime: string;
      /** Record updater */
      updateBy: string;
      /** Record update time */
      updateTime: string;
      /** Record status */
      status: EnableStatus | null;
    } & T;
  }
}
