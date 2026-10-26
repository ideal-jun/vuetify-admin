declare namespace Api {
  /**
   * namespace SystemManage — department endpoints
   *
   * /system/dept/list returns the departments as a flat array inside "data".
   */
  namespace SystemManage {
    type Dept = Api.Backend.Dept;

    /** The department list returned by GET /system/dept/list */
    type DeptList = Dept[];

    /** The search model kept by the department search panel */
    type DeptSearchModel = {
      deptName: string | null;
      status: Api.Backend.Status | null;
    };

    type DeptSearchParams = DeptSearchModel;

    /** The department fields edited by the operate drawer */
    type DeptForm = {
      parentId: number;
      deptName: string;
      orderNum: number;
      leader: string;
      phone: string;
      email: string;
      status: Api.Backend.Status;
    };

    type CreateDept = DeptForm;

    type UpdateDept = DeptForm & Pick<Dept, 'deptId'>;
  }
}
