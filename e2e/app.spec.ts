import { expect, test } from '@playwright/test';

import { installToken, loginThroughApi } from './helpers/auth';

test.beforeEach(async ({ page, request }) => {
  const token = await loginThroughApi(request);

  await installToken(page, token);
});

test('renders the dashboard and every backend menu page', async ({ page }) => {
  await expect(page.locator('body')).toContainText('欢迎回来');

  const routes = [
    ['/system/user', '用户管理'],
    ['/system/role', '角色管理'],
    ['/system/menu', '菜单管理'],
    ['/system/dept', '部门管理'],
    ['/system/post', '岗位管理'],
    ['/system/dict', '字典管理'],
    ['/system/config', '参数设置'],
    ['/system/notice', '通知公告'],
    ['/system/log/operlog', '操作日志'],
    ['/system/log/logininfor', '登录日志'],
    ['/monitor/online', '在线用户'],
    ['/monitor/job', '定时任务'],
    ['/tool/gen', '代码生成'],
    ['/tool/build', '表单构建'],
    ['/user/profile', 'Profile'],
  ] as const;

  for (const [path, title] of routes) {
    await page.goto(path);
    await expect(page).toHaveTitle(new RegExp(title));
    await expect(page.locator('body')).not.toContainText('页面不存在');
  }
});

test('filters the user list by department', async ({ page }) => {
  await page.goto('/system/user');

  const deptItem = page.locator('.v-treeview-item').filter({ hasText: '研发部门' }).first();

  await expect(deptItem).toBeVisible();
  await deptItem.click();

  await expect(page.locator('tbody')).toContainText('admin');
  await expect(page.locator('tbody')).toContainText('研发部门');
});
