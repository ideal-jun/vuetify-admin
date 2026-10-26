declare namespace Api {
  /**
   * namespace SystemDict
   *
   * Dictionary type and dictionary data endpoints of the system module.
   */
  namespace SystemDict {
    /** A dictionary type row */
    interface DictType {
      dictId: number;
      dictName: string;
      dictType: string;
      status: Api.Backend.Status;
      remark?: string | null;
      createBy?: string | null;
      createTime?: string | null;
      updateBy?: string | null;
      updateTime?: string | null;
    }

    type DictTypeList = Api.Backend.TableData<DictType>;

    /** The search model kept by the dictionary type search panel */
    interface DictTypeSearchModel {
      dictName: string | null;
      dictType: string | null;
      status: Api.Backend.Status | null;
    }

    type DictTypeSearchParams = DictTypeSearchModel & {
      pageNum: number;
      pageSize: number;
    };

    /** The dictionary type fields that can be created or updated */
    interface DictTypeForm {
      dictName: string;
      dictType: string;
      status: Api.Backend.Status;
      remark?: string | null;
    }

    type CreateDictType = DictTypeForm;

    type UpdateDictType = DictTypeForm & Pick<DictType, 'dictId'>;

    /** The dictionary type option returned by GET /system/dict/type/optionselect */
    type DictTypeOption = Pick<DictType, 'dictId' | 'dictName' | 'dictType'>;

    /** A dictionary data row */
    interface DictData {
      dictCode: number;
      dictSort: number;
      dictLabel: string;
      dictValue: string;
      dictType: string;
      cssClass?: string | null;
      listClass?: string | null;
      isDefault?: string | null;
      status: Api.Backend.Status;
      remark?: string | null;
      createBy?: string | null;
      createTime?: string | null;
      updateBy?: string | null;
      updateTime?: string | null;
    }

    type DictDataList = Api.Backend.TableData<DictData>;

    /** The search model kept by the dictionary data search panel */
    interface DictDataSearchModel {
      dictType: string | null;
      dictLabel: string | null;
      status: Api.Backend.Status | null;
    }

    type DictDataSearchParams = DictDataSearchModel & {
      pageNum: number;
      pageSize: number;
    };

    /** The dictionary data fields that can be created or updated */
    interface DictDataForm {
      dictType: string;
      dictLabel: string;
      dictValue: string;
      dictSort: number;
      cssClass?: string | null;
      listClass?: string | null;
      isDefault?: string | null;
      status: Api.Backend.Status;
      remark?: string | null;
    }

    type CreateDictData = DictDataForm;

    type UpdateDictData = DictDataForm & Pick<DictData, 'dictCode'>;
  }
}
