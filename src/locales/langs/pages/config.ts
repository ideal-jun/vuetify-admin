// config page messages
// Keep the English and Chinese shapes identical; the Chinese object is typed from the English one.
export const configEn = {
  config: {
    listTitle: 'Parameter list',
    add: 'Add parameter',
    edit: 'Edit parameter',
    drawerDesc: 'Fill in the parameter information.',
    empty: 'No parameters match the current filters.',
    selectedCount: '{count} selected',
    confirmBatchDelete: 'Are you sure you want to delete the {count} selected parameters?',
    refreshCache: 'Refresh cache',
    refreshCacheConfirm: 'Are you sure you want to refresh the parameter cache?',
    refreshCacheSuccess: 'Cache refreshed successfully',
    remark: 'Remark',
    type: {
      yes: 'Built-in',
      no: 'Custom',
    },
    columns: {
      configName: 'Parameter name',
      configKey: 'Parameter key',
      configValue: 'Parameter value',
      configType: 'Built-in',
      remark: 'Remark',
      createTime: 'Created at',
      actions: 'Actions',
    },
    search: {
      configName: 'Please enter the parameter name',
      configKey: 'Please enter the parameter key',
      configType: 'All types',
      beginTime: 'Start date',
      endTime: 'End date',
    },
    form: {
      configName: 'Please enter the parameter name',
      configKey: 'Please enter the parameter key',
      configValue: 'Please enter the parameter value',
      configType: 'Built-in type',
    },
  },
};

export type ConfigMessages = typeof configEn;

export const configZh: ConfigMessages = {
  config: {
    listTitle: '参数列表',
    add: '新增参数',
    edit: '编辑参数',
    drawerDesc: '请填写参数信息。',
    empty: '没有匹配当前条件的参数。',
    selectedCount: '已选择 {count} 项',
    confirmBatchDelete: '确定要删除选中的 {count} 个参数吗？',
    refreshCache: '刷新缓存',
    refreshCacheConfirm: '确定要刷新参数缓存吗？',
    refreshCacheSuccess: '缓存刷新成功',
    remark: '备注',
    type: {
      yes: '系统内置',
      no: '自定义',
    },
    columns: {
      configName: '参数名称',
      configKey: '参数键名',
      configValue: '参数键值',
      configType: '系统内置',
      remark: '备注',
      createTime: '创建时间',
      actions: '操作',
    },
    search: {
      configName: '请输入参数名称',
      configKey: '请输入参数键名',
      configType: '全部类型',
      beginTime: '开始日期',
      endTime: '结束日期',
    },
    form: {
      configName: '请输入参数名称',
      configKey: '请输入参数键名',
      configValue: '请输入参数键值',
      configType: '内置类型',
    },
  },
};
