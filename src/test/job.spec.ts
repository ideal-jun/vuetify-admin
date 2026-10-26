import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchCreateJob, fetchGetJobList } from '@/service/api/monitor-job';
import { setupTestAuth } from '@/test/auth';
import { waitForButton, waitForDrawer, waitForTableRows, waitForText } from '@/test/wait';
import MonitorJob from '@/views/monitor/job/index.vue';

vi.mock('@/service/api/monitor-job', () => ({
  fetchChangeJobStatus: vi.fn(),
  fetchCleanJobLogs: vi.fn(),
  fetchCreateJob: vi.fn(),
  fetchDeleteJobLogs: vi.fn(),
  fetchDeleteJobs: vi.fn(),
  fetchGetJob: vi.fn(),
  fetchGetJobList: vi.fn(),
  fetchGetJobLogList: vi.fn(),
  fetchRunJob: vi.fn(),
  fetchUpdateJob: vi.fn(),
}));

const jobs: Api.MonitorJob.Job[] = [
  {
    jobId: 1,
    jobName: '系统默认（无参）',
    jobGroup: 'DEFAULT',
    invokeTarget: 'ryTask.ryNoParams',
    cronExpression: '0/10 * * * * ?',
    misfirePolicy: '1',
    concurrent: '1',
    status: '0',
    nextValidTime: 1_792_000_000_000,
  },
  {
    jobId: 2,
    jobName: '系统默认（有参）',
    jobGroup: 'SYSTEM',
    invokeTarget: "ryTask.ryParams('ry')",
    cronExpression: '0/15 * * * * ?',
    misfirePolicy: '3',
    concurrent: '0',
    status: '1',
    nextValidTime: null,
  },
];

const getJobListMock = vi.mocked(fetchGetJobList);
const createJobMock = vi.mocked(fetchCreateJob);

beforeEach(() => {
  setupTestAuth();

  getJobListMock.mockResolvedValue({
    data: {
      code: 200,
      msg: '查询成功',
      total: jobs.length,
      rows: jobs,
    },
    error: null,
  });

  createJobMock.mockResolvedValue({ data: null, error: null });
});

function mountPage() {
  return mount({
    components: { MonitorJob },
    template: '<VApp><MonitorJob /></VApp>',
  });
}

describe('scheduled jobs page', () => {
  it('renders the backend scheduled jobs', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '第 1-2 条，共 2 条');

    expect(wrapper.text()).toContain('定时任务');
    expect(wrapper.text()).toContain('系统默认（无参）');
    expect(wrapper.text()).toContain('ryTask.ryNoParams');
    expect(wrapper.text()).toContain('0/10 * * * * ?');
    expect(wrapper.text()).toContain('默认');
    expect(wrapper.text()).toContain('系统');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    wrapper.unmount();
  });

  it('creates a job from the operate drawer', async () => {
    const wrapper = mountPage();

    await waitForTableRows(wrapper, 2);

    const addButton = await waitForButton(wrapper, '新增');

    await addButton.trigger('click');

    const drawer = await waitForDrawer(wrapper, '新增任务');

    await drawer.find('input[placeholder="请输入任务名称"]').setValue('测试任务');
    await drawer.find('input[placeholder="请输入调用目标字符串"]').setValue('ryTask.ryNoParams');
    await drawer.find('input[placeholder="请输入 cron 执行表达式"]').setValue('0 0/5 * * * ?');

    const confirmButton = drawer
      .findAll('button')
      .find((button) => button.text().trim() === '确认');

    expect(confirmButton).toBeDefined();

    await confirmButton?.trigger('click');

    await vi.waitFor(() => {
      expect(createJobMock).toHaveBeenCalledWith(
        expect.objectContaining({
          jobName: '测试任务',
          invokeTarget: 'ryTask.ryNoParams',
          cronExpression: '0 0/5 * * * ?',
          jobGroup: 'DEFAULT',
          status: '0',
        }),
      );
    });

    wrapper.unmount();
  });
});
