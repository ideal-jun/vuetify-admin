<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { $t } from '@/locales';
import { fetchGetDeptList } from '@/service/api/system-dept';

defineOptions({ name: 'UserDeptTree' });

interface DeptTreeNode {
  id: number;
  title: string;
  children?: DeptTreeNode[];
}

const selectedDeptId = defineModel<number | null>('selectedDeptId', { default: null });

const keyword = ref('');
const deptTree = ref<DeptTreeNode[]>([]);
const opened = ref<string[]>([]);
const loading = ref(false);

const activated = computed(() => (selectedDeptId.value === null ? [] : [selectedDeptId.value]));

function buildTree(depts: Api.SystemManage.Dept[]): DeptTreeNode[] {
  const nodes = new Map<number, DeptTreeNode>();

  for (const dept of depts) {
    nodes.set(dept.deptId, { id: dept.deptId, title: dept.deptName });
  }

  const roots: DeptTreeNode[] = [];

  for (const dept of depts.toSorted((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0))) {
    const node = nodes.get(dept.deptId);

    if (!node) {
      continue;
    }

    const parent = dept.parentId == null ? undefined : nodes.get(dept.parentId);

    if (parent && dept.parentId !== dept.deptId) {
      parent.children ??= [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

async function loadDepts() {
  loading.value = true;

  const { data, error } = await fetchGetDeptList();

  loading.value = false;

  if (error || !data) {
    return;
  }

  deptTree.value = buildTree(data);
  opened.value = collectIds(deptTree.value);
}

function collectIds(nodes: DeptTreeNode[]): string[] {
  return nodes.flatMap((node) => [
    String(node.id),
    ...(node.children ? collectIds(node.children) : []),
  ]);
}

function handleActivated(value: unknown[]) {
  const first = value[0];

  selectedDeptId.value = typeof first === 'number' ? first : null;
}

function selectAll() {
  selectedDeptId.value = null;
}

onMounted(() => {
  void loadDepts();
});
</script>

<template>
  <VCard class="app-panel flex min-h-0 flex-1 flex-col overflow-hidden" variant="flat">
    <div class="shrink-0 px-3 py-3">
      <VTextField
        v-model="keyword"
        clearable
        density="compact"
        hide-details
        :label="$t('page.system.user.deptSearch')"
        prepend-inner-icon="mdi-magnify"
      />
    </div>

    <VDivider />

    <div class="min-h-0 flex-1 overflow-y-auto px-2 py-2">
      <VList density="compact" nav>
        <VListItem
          :active="selectedDeptId === null"
          :prepend-icon="'mdi-domain'"
          :title="$t('page.system.user.allDepts')"
          @click="selectAll"
        />
      </VList>

      <VTreeview
        activatable
        :activated="activated"
        density="compact"
        item-title="title"
        item-value="id"
        :items="deptTree"
        :loading="loading"
        open-all
        :search="keyword"
        @update:activated="handleActivated"
      />
    </div>
  </VCard>
</template>
