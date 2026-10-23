/** The common type namespace */
declare namespace CommonType {
  /** The strategic pattern */
  interface StrategicPattern {
    /** The condition */
    condition: boolean;
    /** If the condition is true, then call the action function */
    callback: () => void;
  }

  /**
   * The option type
   *
   * @property value: The option value
   * @property label: The option label
   */
  type Option<K = string, M = string> = { value: K; label: M };

  type YesOrNo = 'Y' | 'N';

  /** Add null to all properties */
  type RecordNullable<T> = {
    [K in keyof T]?: T[K] | null;
  };

  /** A single page of data */
  interface PaginationData<T> {
    data: T[];
    pageNum: number;
    pageSize: number;
    total: number;
  }
}
