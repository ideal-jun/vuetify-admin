import { reactive } from 'vue';

import { $t } from '@/locales';

export interface MessageItem {
  id: number;
  type: App.Global.MessageType;
  content: string;
}

export interface NotificationItem {
  id: number;
  type: App.Global.MessageType;
  title: string;
  content: string;
  duration: number;
}

export interface DialogState {
  visible: boolean;
  type: App.Global.MessageType;
  options: App.Global.DialogOptions | null;
}

let seed = 0;

export const messageQueue = reactive<MessageItem[]>([]);

export const notificationQueue = reactive<NotificationItem[]>([]);

export const dialogState = reactive<DialogState>({
  visible: false,
  type: 'info',
  options: null,
});

function pushMessage(type: App.Global.MessageType, content: string) {
  const id = seed++;

  messageQueue.push({ id, type, content });

  setTimeout(() => {
    const index = messageQueue.findIndex((item) => item.id === id);

    if (index !== -1) {
      messageQueue.splice(index, 1);
    }
  }, 3200);
}

function pushNotification(type: App.Global.MessageType, options: App.Global.NotificationOptions) {
  const id = seed++;
  const duration = options.duration ?? 4500;

  notificationQueue.push({
    id,
    type,
    title: options.title,
    content: options.content,
    duration,
  });

  setTimeout(() => {
    const index = notificationQueue.findIndex((item) => item.id === id);

    if (index !== -1) {
      notificationQueue.splice(index, 1);
    }
  }, duration);
}

function openDialog(type: App.Global.MessageType, options: App.Global.DialogOptions) {
  dialogState.type = type;
  dialogState.options = options;
  dialogState.visible = true;
}

function closeDialog() {
  const options = dialogState.options;

  dialogState.visible = false;
  dialogState.options = null;

  options?.onClose?.();
}

async function confirmDialog() {
  const options = dialogState.options;

  await options?.onPositiveClick?.();

  dialogState.visible = false;
  dialogState.options = null;
}

async function cancelDialog() {
  const options = dialogState.options;

  await options?.onNegativeClick?.();

  dialogState.visible = false;
  dialogState.options = null;
}

/** Register the global feedback APIs on window */
export function setupGlobalFeedback() {
  window.$message = {
    success: (content) => pushMessage('success', content),
    error: (content) => pushMessage('error', content),
    warning: (content) => pushMessage('warning', content),
    info: (content) => pushMessage('info', content),
  };

  window.$dialog = {
    info: (options) => openDialog('info', options),
    success: (options) => openDialog('success', options),
    warning: (options) => openDialog('warning', options),
    error: (options) => openDialog('error', options),
  };

  window.$notification = {
    success: (options) => pushNotification('success', options),
    info: (options) => pushNotification('info', options),
    warning: (options) => pushNotification('warning', options),
    error: (options) => pushNotification('error', options),
  };
}

export { cancelDialog, closeDialog, confirmDialog, openDialog };

/** The default dialog title by severity */
export function getDialogTitle(type: App.Global.MessageType) {
  const titles: Record<App.Global.MessageType, string> = {
    success: $t('common.tip'),
    info: $t('common.tip'),
    warning: $t('common.warning'),
    error: $t('common.error'),
  };

  return titles[type];
}
