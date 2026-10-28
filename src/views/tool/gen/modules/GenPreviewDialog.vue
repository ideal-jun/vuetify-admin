<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { $t } from '@/locales';
import { fetchPreviewGenTable } from '@/service/api/tool-gen';

defineOptions({ name: 'GenPreviewDialog' });

interface Props {
  /** The generation config id, null means nothing to load */
  tableId: number | null;
  /** The table name shown in the dialog subtitle */
  tableName?: string | null;
}

const { tableId, tableName } = defineProps<Props>();

const visible = defineModel<boolean>('visible', { required: true });

interface PreviewTemplate {
  path: string;
  label: string;
  language: string;
  content: string;
}

const loading = ref(false);
const previewMap = ref<Api.ToolGen.PreviewMap>({});
const activePath = ref('');

const templates = computed<PreviewTemplate[]>(() =>
  Object.entries(previewMap.value).map(([path, content]) => {
    const fileName = path.slice(path.lastIndexOf('/') + 1).replace(/\.vm$/u, '');
    const dotIndex = fileName.lastIndexOf('.');

    return {
      path,
      label: fileName,
      language: dotIndex === -1 ? 'text' : fileName.slice(dotIndex + 1),
      content,
    };
  }),
);

function countLines(content: string) {
  return content ? content.replace(/\r\n/gu, '\n').split('\n').length : 0;
}

async function loadPreview() {
  if (!tableId) {
    previewMap.value = {};
    activePath.value = '';

    return;
  }

  loading.value = true;
  previewMap.value = {};
  activePath.value = '';

  try {
    const { data, error } = await fetchPreviewGenTable(tableId);

    if (error) {
      return;
    }

    previewMap.value = data ?? {};

    const preferred = templates.value.find((template) => template.path.includes('domain.java'));

    activePath.value = preferred?.path ?? templates.value[0]?.path ?? '';
  } finally {
    loading.value = false;
  }
}

async function copyCode(content: string) {
  try {
    await navigator.clipboard.writeText(content);
    window.$message?.success($t('page.gen.preview.copySuccess'));
  } catch {
    window.$message?.error($t('page.gen.preview.copyFailed'));
  }
}

watch(visible, (value) => {
  if (value) {
    void loadPreview();
  }
});
</script>

<template>
  <VDialog v-model="visible" max-width="1400" scrollable>
    <VCard rounded="xl">
      <VCardTitle class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-base font-600">{{ $t('page.gen.preview.title') }}</div>
          <div class="mt-1 truncate text-xs opacity-60">
            {{ $t('page.gen.preview.desc', { table: tableName || '—' }) }}
          </div>
        </div>

        <VBtn
          :aria-label="$t('page.gen.preview.close')"
          icon="mdi-close"
          size="small"
          variant="text"
          @click="visible = false"
        />
      </VCardTitle>

      <VDivider />

      <VProgressLinear v-if="loading" indeterminate />

      <template v-else-if="templates.length > 0">
        <VTabs v-model="activePath" class="px-2" density="comfortable" show-arrows>
          <VTab v-for="template in templates" :key="template.path" :value="template.path">
            <span class="font-mono text-xs">{{ template.label }}</span>
            <VChip class="ml-1" size="x-small" variant="tonal">
              {{ template.language }}
            </VChip>
          </VTab>
        </VTabs>

        <VDivider />

        <VWindow v-model="activePath">
          <VWindowItem v-for="template in templates" :key="template.path" :value="template.path">
            <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
              <span class="truncate text-xs opacity-60">{{ template.path }}</span>

              <div class="flex items-center gap-1">
                <span class="text-xs opacity-60">
                  {{ $t('page.gen.preview.lines', { count: countLines(template.content) }) }}
                </span>

                <VBtn
                  prepend-icon="mdi-content-copy"
                  size="small"
                  variant="text"
                  @click="copyCode(template.content)"
                >
                  {{ $t('page.gen.preview.copy') }}
                </VBtn>
              </div>
            </div>

            <VSheet class="mx-4 mb-4" color="surface-variant" rounded="lg">
              <pre
                class="max-h-[58vh] overflow-auto whitespace-pre p-4 font-mono text-xs leading-relaxed"
                >{{ template.content }}</pre>
            </VSheet>
          </VWindowItem>
        </VWindow>
      </template>

      <VCardText v-else class="py-10 text-center text-sm opacity-60">
        {{ $t('page.gen.preview.empty') }}
      </VCardText>

      <VDivider />

      <VCardActions class="justify-end">
        <VBtn variant="text" @click="visible = false">
          {{ $t('page.gen.preview.close') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
