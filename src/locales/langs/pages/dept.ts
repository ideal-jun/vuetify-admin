// dept page messages
// Keep the English and Chinese shapes identical; the Chinese object is typed from the English one.
export const deptEn = {
  dept: {
    listTitle: 'Department list',
    add: 'Add department',
    edit: 'Edit department',
    addChild: 'Add child department',
    drawerDesc: 'Fill in the department information.',
    empty: 'No departments match the current filters.',
    expand: 'Expand',
    collapse: 'Collapse',
    rootParent: 'Root department',
    columns: {
      deptName: 'Department name',
      orderNum: 'Order',
      status: 'Status',
      createTime: 'Created at',
      actions: 'Actions',
    },
    form: {
      parentId: 'Parent department',
      deptName: 'Please enter the department name',
      orderNum: 'Please enter the order number',
      leader: 'Please enter the leader',
      phone: 'Please enter the phone number',
      email: 'Please enter the email',
      status: 'Department status',
    },
  },
};

export type DeptMessages = typeof deptEn;

export const deptZh: DeptMessages = {
  dept: {
    listTitle: '部门列表',
    add: '新增部门',
    edit: '编辑部门',
    addChild: '新增子部门',
    drawerDesc: '请填写部门信息。',
    empty: '没有匹配当前条件的部门。',
    expand: '展开',
    collapse: '收起',
    rootParent: '顶级部门',
    columns: {
      deptName: '部门名称',
      orderNum: '排序',
      status: '状态',
      createTime: '创建时间',
      actions: '操作',
    },
    form: {
      parentId: '上级部门',
      deptName: '请输入部门名称',
      orderNum: '请输入排序',
      leader: '请输入负责人',
      phone: '请输入联系电话',
      email: '请输入邮箱',
      status: '部门状态',
    },
  },
};
