// post page messages
// Keep the English and Chinese shapes identical; the Chinese object is typed from the English one.
export const postEn = {
  post: {
    listTitle: 'Post list',
    add: 'Add post',
    edit: 'Edit post',
    drawerDesc: 'Fill in the post information.',
    empty: 'No posts match the current filters.',
    selectedCount: '{count} selected',
    confirmBatchDelete: 'Are you sure you want to delete the {count} selected posts?',
    remark: 'Remark',
    columns: {
      postCode: 'Post code',
      postName: 'Post name',
      postSort: 'Order',
      status: 'Status',
      createTime: 'Created at',
      actions: 'Actions',
    },
    form: {
      postCode: 'Please enter the post code',
      postName: 'Please enter the post name',
      postSort: 'Please enter the order number',
      status: 'All statuses',
      remark: 'Please enter the remark',
    },
  },
};

export type PostMessages = typeof postEn;

export const postZh: PostMessages = {
  post: {
    listTitle: '岗位列表',
    add: '新增岗位',
    edit: '编辑岗位',
    drawerDesc: '请填写岗位信息。',
    empty: '没有匹配当前条件的岗位。',
    selectedCount: '已选择 {count} 项',
    confirmBatchDelete: '确定要删除选中的 {count} 个岗位吗？',
    remark: '备注',
    columns: {
      postCode: '岗位编码',
      postName: '岗位名称',
      postSort: '排序',
      status: '状态',
      createTime: '创建时间',
      actions: '操作',
    },
    form: {
      postCode: '请输入岗位编码',
      postName: '请输入岗位名称',
      postSort: '请输入排序',
      status: '全部状态',
      remark: '请输入备注',
    },
  },
};
