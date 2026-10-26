// notice page messages
// Keep the English and Chinese shapes identical; the Chinese object is typed from the English one.
export const noticeEn = {
  notice: {
    listTitle: 'Notice list',
    add: 'Add notice',
    edit: 'Edit notice',
    drawerDesc: 'Fill in the notice information.',
    empty: 'No notices match the current filters.',
    selectedCount: '{count} selected',
    confirmBatchDelete: 'Are you sure you want to delete the {count} selected notices?',
    type: {
      notice: 'Notice',
      announcement: 'Announcement',
    },
    status: {
      normal: 'Normal',
      closed: 'Closed',
    },
    columns: {
      noticeTitle: 'Title',
      noticeType: 'Type',
      status: 'Status',
      createBy: 'Created by',
      createTime: 'Created at',
      actions: 'Actions',
    },
    search: {
      noticeTitle: 'Please enter the title',
      createBy: 'Please enter the creator',
      noticeType: 'All types',
      beginTime: 'Start date',
      endTime: 'End date',
    },
    form: {
      noticeTitle: 'Please enter the title',
      noticeType: 'Notice type',
      noticeContent: 'Please enter the notice content',
    },
  },
};

export type NoticeMessages = typeof noticeEn;

export const noticeZh: NoticeMessages = {
  notice: {
    listTitle: '公告列表',
    add: '新增公告',
    edit: '编辑公告',
    drawerDesc: '请填写公告信息。',
    empty: '没有匹配当前条件的公告。',
    selectedCount: '已选择 {count} 项',
    confirmBatchDelete: '确定要删除选中的 {count} 个公告吗？',
    type: {
      notice: '通知',
      announcement: '公告',
    },
    status: {
      normal: '正常',
      closed: '关闭',
    },
    columns: {
      noticeTitle: '公告标题',
      noticeType: '类型',
      status: '状态',
      createBy: '创建者',
      createTime: '创建时间',
      actions: '操作',
    },
    search: {
      noticeTitle: '请输入公告标题',
      createBy: '请输入创建者',
      noticeType: '全部类型',
      beginTime: '开始日期',
      endTime: '结束日期',
    },
    form: {
      noticeTitle: '请输入公告标题',
      noticeType: '公告类型',
      noticeContent: '请输入公告内容',
    },
  },
};
