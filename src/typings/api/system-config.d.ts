declare namespace Api {
  /**
   * namespace SystemManage — configuration endpoints
   */
  namespace SystemManage {
    /** The "is system built-in" flag of a configuration */
    type ConfigType = 'Y' | 'N';

    /** Configuration returned by /system/config endpoints */
    interface Config {
      configId: number;
      configName: string;
      configKey: string;
      configValue: string;
      configType: ConfigType;
      remark?: string | null;
      createBy?: string | null;
      createTime?: string | null;
      updateBy?: string | null;
      updateTime?: string | null;
    }

    type ConfigList = Api.Backend.TableData<Config>;

    /** The search model kept by the configuration search panel */
    type ConfigSearchModel = {
      configName: string | null;
      configKey: string | null;
      configType: ConfigType | null;
      /** The start of the createdAt range, as yyyy-MM-dd */
      beginTime: string | null;
      /** The end of the createdAt range, as yyyy-MM-dd */
      endTime: string | null;
    };

    /** The query params sent to /system/config/list (dates are sent in the backend's params[...] form) */
    type ConfigSearchParams = Pick<ConfigSearchModel, 'configName' | 'configKey' | 'configType'> & {
      pageNum: number;
      pageSize: number;
      'params[beginTime]'?: string;
      'params[endTime]'?: string;
    };

    /** The configuration fields edited by the operate drawer */
    type ConfigForm = {
      configName: string;
      configKey: string;
      configValue: string;
      configType: ConfigType;
      remark: string;
    };

    type CreateConfig = ConfigForm;

    type UpdateConfig = ConfigForm & Pick<Config, 'configId'>;
  }
}
