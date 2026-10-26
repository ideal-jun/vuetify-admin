declare namespace Api {
  /**
   * namespace MonitorJob
   *
   * The scheduled job pages talk to the backend fields directly.
   */
  namespace MonitorJob {
    /** backend job status: "0" normal, "1" paused */
    type JobStatus = '0' | '1';

    /** A scheduled job returned by /schedule/job endpoints */
    interface Job {
      jobId: number;
      jobName: string;
      jobGroup: string;
      invokeTarget: string;
      cronExpression: string;
      /** 0 default, 1 fire immediately, 2 fire once, 3 do nothing */
      misfirePolicy?: string | null;
      /** 0 allow, 1 forbid */
      concurrent?: string | null;
      status: JobStatus;
      nextValidTime?: number | string | null;
      createTime?: string | null;
      remark?: string | null;
    }

    type JobList = Api.Backend.TableData<Job>;

    /** The search model kept by the job search panel */
    type SearchModel = {
      jobName: string | null;
      jobGroup: string | null;
      status: JobStatus | null;
    };

    type SearchParams = SearchModel & {
      pageNum: number;
      pageSize: number;
    };

    /** The fields of the create/update job form */
    type JobForm = Pick<
      Job,
      | 'jobName'
      | 'jobGroup'
      | 'invokeTarget'
      | 'cronExpression'
      | 'misfirePolicy'
      | 'concurrent'
      | 'status'
    >;

    type CreateJob = JobForm;
    type UpdateJob = JobForm & Pick<Job, 'jobId'>;

    /** A job execution log returned by GET /schedule/job/log/list */
    interface JobLog {
      jobLogId: number;
      jobName: string;
      jobGroup: string;
      invokeTarget: string;
      jobMessage: string;
      /** "0" success, "1" failure */
      status: JobStatus;
      exceptionInfo?: string | null;
      createTime?: string | null;
    }

    type JobLogList = Api.Backend.TableData<JobLog>;

    /** The search model kept by the job log dialog */
    type JobLogSearchModel = {
      jobName: string | null;
      jobGroup: string | null;
      status: JobStatus | null;
      beginTime: string | null;
      endTime: string | null;
    };

    type JobLogSearchParams = JobLogSearchModel & {
      pageNum: number;
      pageSize: number;
    };
  }
}
