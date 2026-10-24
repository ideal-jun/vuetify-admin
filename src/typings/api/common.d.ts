/**
 * Namespace Api
 *
 * All backend api types
 */
declare namespace Api {
  namespace Common {
    /** backend enable status: "0" enabled, "1" disabled */
    type EnableStatus = Api.Backend.Status;

    /** Common record shape returned by backend tables */
    type CommonRecord<T = unknown> = {
      createBy?: string | null;
      createTime?: string | null;
      updateBy?: string | null;
      updateTime?: string | null;
      status?: EnableStatus | null;
    } & T;
  }
}
