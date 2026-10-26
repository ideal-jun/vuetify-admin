// online page messages
// Keep the English and Chinese shapes identical; the Chinese object is typed from the English one.
export const onlineEn = {
  online: {
    listTitle: 'Online users',
    empty: 'No online users.',
    search: {
      userName: 'User name',
      userNamePlaceholder: 'Please enter the user name',
      ipaddr: 'Login address',
      ipaddrPlaceholder: 'Please enter the login address',
    },
    columns: {
      tokenId: 'Session ID',
      userName: 'User name',
      deptName: 'Department',
      ipaddr: 'Host',
      loginLocation: 'Login location',
      browser: 'Browser',
      os: 'Operating system',
      loginTime: 'Login time',
      actions: 'Actions',
    },
    selectedCount: '{count} selected',
    forceLogout: 'Force logout',
    batchForceLogout: 'Batch force logout',
    forceLogoutConfirm: 'Force the user "{userName}" to log out?',
    batchForceLogoutConfirm: 'Force {count} selected users to log out?',
    forceLogoutSuccess: 'The user has been forced to log out.',
  },
};

export type OnlineMessages = typeof onlineEn;

export const onlineZh: OnlineMessages = {
  online: {
    listTitle: '在线用户',
    empty: '暂无在线用户。',
    search: {
      userName: '用户名称',
      userNamePlaceholder: '请输入用户名称',
      ipaddr: '登录地址',
      ipaddrPlaceholder: '请输入登录地址',
    },
    columns: {
      tokenId: '会话编号',
      userName: '登录名称',
      deptName: '部门',
      ipaddr: '主机',
      loginLocation: '登录地点',
      browser: '浏览器',
      os: '操作系统',
      loginTime: '登录时间',
      actions: '操作',
    },
    selectedCount: '已选择 {count} 项',
    forceLogout: '强退',
    batchForceLogout: '批量强退',
    forceLogoutConfirm: '是否确认强退名称为"{userName}"的用户？',
    batchForceLogoutConfirm: '是否确认强退选中的 {count} 个用户？',
    forceLogoutSuccess: '强退成功。',
  },
};
