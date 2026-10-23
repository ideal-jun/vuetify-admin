<script setup lang="ts">
import { computed } from 'vue';

import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({ name: 'UserAvatar' });

const authStore = useAuthStore();
const { toLogin } = useRouterPush();

const initials = computed(() => authStore.userInfo.userName.slice(0, 1).toUpperCase() || 'A');

function loginOrRegister() {
  void toLogin();
}

function logout() {
  window.$dialog?.info({
    title: $t('common.tip'),
    content: $t('common.logoutConfirm'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: () => authStore.resetStore(),
  });
}
</script>

<template>
  <VBtn
    v-if="!authStore.isLogin"
    color="primary"
    size="small"
    variant="tonal"
    @click="loginOrRegister"
  >
    {{ $t('page.login.common.loginOrRegister') }}
  </VBtn>

  <VMenu v-else location="bottom end">
    <template #activator="{ props: activatorProps }">
      <VBtn v-bind="activatorProps" class="px-2" rounded="lg" variant="text">
        <VAvatar class="mr-2 text-sm font-700" color="primary" size="32">
          {{ initials }}
        </VAvatar>

        <span class="hidden text-sm font-600 sm:block">{{ authStore.userInfo.userName }}</span>

        <VIcon class="ml-1" icon="mdi-chevron-down" size="18" />
      </VBtn>
    </template>

    <VList density="compact" min-width="220" nav>
      <VListItem>
        <template #prepend>
          <VAvatar class="text-sm font-700" color="primary" size="38">{{ initials }}</VAvatar>
        </template>
        <VListItemTitle class="font-600">{{ authStore.userInfo.userName }}</VListItemTitle>
        <VListItemSubtitle>
          {{ authStore.userInfo.roles.join(' · ') }}
        </VListItemSubtitle>
      </VListItem>

      <VDivider class="my-1" />

      <VListItem :prepend-icon="'mdi-account-outline'" :title="$t('common.userCenter')" />

      <VListItem
        base-color="error"
        :prepend-icon="'mdi-logout'"
        :title="$t('common.logout')"
        @click="logout"
      />
    </VList>
  </VMenu>
</template>
