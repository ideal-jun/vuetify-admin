import { request } from '../request';

/**
 * Get the scheduled job list
 *
 * @param params The backend query params
 */
export function fetchGetJobList(params: Api.MonitorJob.SearchParams) {
  return request<Api.MonitorJob.JobList>({
    url: '/schedule/job/list',
    params: params as unknown as Record<string, unknown>,
  });
}

/**
 * Get a scheduled job detail
 *
 * @param jobId The job id
 */
export function fetchGetJob(jobId: number) {
  return request<Api.MonitorJob.Job>({ url: `/schedule/job/${jobId}` });
}

/**
 * Create a scheduled job
 *
 * @param data The job payload
 */
export function fetchCreateJob(data: Api.MonitorJob.CreateJob) {
  return request<null>({ url: '/schedule/job', method: 'POST', data });
}

/**
 * Update a scheduled job
 *
 * @param data The job payload, including the job id
 */
export function fetchUpdateJob(data: Api.MonitorJob.UpdateJob) {
  return request<null>({ url: '/schedule/job', method: 'PUT', data });
}

/**
 * Delete scheduled jobs
 *
 * @param jobIds The job ids
 */
export function fetchDeleteJobs(jobIds: number[]) {
  return request<null>({ url: `/schedule/job/${jobIds.join(',')}`, method: 'DELETE' });
}

/**
 * Change the status of a scheduled job
 *
 * @param jobId The job id
 * @param status The backend job status
 */
export function fetchChangeJobStatus(jobId: number, status: Api.MonitorJob.JobStatus) {
  return request<null>({
    url: '/schedule/job/changeStatus',
    method: 'PUT',
    data: { jobId, status },
  });
}

/**
 * Run a scheduled job once
 *
 * @param jobId The job id
 * @param jobGroup The job group
 */
export function fetchRunJob(jobId: number, jobGroup: string) {
  return request<null>({
    url: '/schedule/job/run',
    method: 'PUT',
    data: { jobId, jobGroup },
  });
}

/**
 * Get the scheduled job log list
 *
 * @param params The backend query params, including the execution time range
 */
export function fetchGetJobLogList(params: Api.MonitorJob.JobLogSearchParams) {
  const { beginTime, endTime, ...rest } = params;
  const query: Record<string, unknown> = { ...rest };

  if (beginTime) {
    query['params[beginTime]'] = beginTime;
  }

  if (endTime) {
    query['params[endTime]'] = endTime;
  }

  return request<Api.MonitorJob.JobLogList>({
    url: '/schedule/job/log/list',
    params: query,
  });
}

/**
 * Delete scheduled job logs
 *
 * @param jobLogIds The job log ids
 */
export function fetchDeleteJobLogs(jobLogIds: number[]) {
  return request<null>({
    url: `/schedule/job/log/${jobLogIds.join(',')}`,
    method: 'DELETE',
  });
}

/** Clean all scheduled job logs */
export function fetchCleanJobLogs() {
  return request<null>({ url: '/schedule/job/log/clean', method: 'DELETE' });
}
