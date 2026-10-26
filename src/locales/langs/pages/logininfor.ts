// logininfor page messages
// Keep the English and Chinese shapes identical; the Chinese object is typed from the English one.
export const logininforEn = {
  logininfor: {
    title: 'Login log',
    search: {
      userName: 'Please enter the user name',
      ipaddr: 'Please enter the IP address',
      status: 'All statuses',
      beginTime: 'Begin time',
      endTime: 'End time',
    },
    columns: {
      infoId: 'Log ID',
      userName: 'User name',
      ipaddr: 'IP address',
      loginLocation: 'Location',
      browser: 'Browser',
      os: 'OS',
      status: 'Status',
      msg: 'Message',
      accessTime: 'Access time',
      actions: 'Actions',
    },
    status: {
      success: 'Success',
      fail: 'Fail',
    },
    unlock: 'Unlock',
    confirmUnlock: 'Unlock the user "{userName}"?',
    unlockSuccess: 'User "{userName}" unlocked',
    clean: 'Clear',
    confirmClean: 'Are you sure you want to clear all login logs?',
    cleanSuccess: 'Login logs cleared',
    empty: 'No login logs.',
    selectedCount: '{count} selected',
    confirmBatchDelete: 'Are you sure you want to delete the {count} selected login logs?',
  },
};

export type LogininforMessages = typeof logininforEn;

export const logininforZh: LogininforMessages = {
  logininfor: {
    title: '登录日志',
    search: {
      userName: '请输入用户名称',
      ipaddr: '请输入登录地址',
      status: '全部状态',
      beginTime: '开始时间',
      endTime: '结束时间',
    },
    columns: {
      infoId: '访问编号',
      userName: '用户名称',
      ipaddr: '登录地址',
      loginLocation: '登录地点',
      browser: '浏览器',
      os: '操作系统',
      status: '登录状态',
      msg: '操作信息',
      accessTime: '访问时间',
      actions: '操作',
    },
    status: {
      success: '成功',
      fail: '失败',
    },
    unlock: '解锁',
    confirmUnlock: '确定要解锁用户 "{userName}" 吗？',
    unlockSuccess: '用户 "{userName}" 已解锁',
    clean: '清空',
    confirmClean: '确定要清空所有登录日志吗？',
    cleanSuccess: '登录日志已清空',
    empty: '暂无登录日志。',
    selectedCount: '已选择 {count} 项',
    confirmBatchDelete: '确定要删除选中的 {count} 条登录日志吗？',
  },
};
