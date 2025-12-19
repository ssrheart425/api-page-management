<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import {
  apiCreateLink,
  apiDeleteLink,
  apiFetchLinks,
  apiUpdateLink,
  type LinkItem,
} from '@/api/links'

const TYPE_OPTIONS = [
  { label: 'WhatsApp', value: 1 },
  { label: 'Telegram', value: 2 },
] as const

const tableLoading = ref(false)
const rows = ref<LinkItem[]>([])
const total = ref(0)

const query = reactive({
  type: undefined as number | undefined,
  link: '',
})

const page = reactive({
  current: 1,
  size: 10,
})

const selectedRows = ref<LinkItem[]>([])

async function fetchList() {
  tableLoading.value = true
  try {
    const res = await apiFetchLinks({
      type: query.type,
      link: query.link.trim() || undefined,
      page: page.current,
      size: page.size,
    })
    rows.value = res.items
    total.value = res.total
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '查询失败')
  } finally {
    tableLoading.value = false
  }
}

function onSearch() {
  page.current = 1
  fetchList()
}

function onReset() {
  query.type = undefined
  query.link = ''
  page.current = 1
  fetchList()
}

function onSelectionChange(rows: LinkItem[]) {
  selectedRows.value = rows
}

function onPageChange(current: number) {
  page.current = current
  fetchList()
}

function onSizeChange(size: number) {
  page.size = size
  page.current = 1
  fetchList()
}

const dialog = reactive({
  visible: false,
  mode: 'create' as 'create' | 'edit',
  form: {
    id: 0,
    type: 1,
    link: '',
  },
})

const dialogFormRef = ref<FormInstance>()
const dialogRules: FormRules = {
  type: [{ required: true, message: '请输入类型', trigger: 'change' }],
  link: [{ required: true, message: '请输入 link', trigger: 'blur' }],
}

function openCreate() {
  dialog.mode = 'create'
  dialog.form = {
    id: 0,
    type: 1,
    link: '',
  }
  dialog.visible = true
}

function openEdit(row?: LinkItem) {
  const target = row ?? selectedRows.value[0]
  if (!target) return
  dialog.mode = 'edit'
  dialog.form = {
    id: target.id,
    type: target.type,
    link: target.link,
  }
  dialog.visible = true
}

async function onDialogSubmit() {
  if (!dialogFormRef.value) return
  const valid = await dialogFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    if (dialog.mode === 'create') {
      await apiCreateLink({
        type: dialog.form.type,
        link: dialog.form.link.trim(),
      })
      ElMessage.success('新增成功')
    } else {
      if (!dialog.form.id) throw new Error('缺少 id')
      await apiUpdateLink(dialog.form.id, {
        type: dialog.form.type,
        link: dialog.form.link.trim(),
      })
      ElMessage.success('保存成功')
    }

    dialog.visible = false
    await fetchList()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '操作失败')
  }
}

async function onDelete(rows?: LinkItem[]) {
  const targets = rows ?? selectedRows.value
  if (!targets.length) return

  try {
    await ElMessageBox.confirm(`确认删除选中的 ${targets.length} 条记录？`, '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  try {
    await Promise.all(targets.map((i) => apiDeleteLink(i.id)))
    selectedRows.value = []
    ElMessage.success('删除成功')
    await fetchList()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '删除失败')
  }
}

onMounted(() => {
  fetchList()
})

function formatDate(value: string) {
  if (!value) return ''
  return value.replace('T', ' ').split('.')[0]?.replace(/Z$/, '') ?? value
}

function typeLabel(type: number) {
  if (type === 1) return 'WhatsApp'
  if (type === 2) return 'Telegram'
  return String(type)
}
</script>

<template>
  <div class="page">
    <el-card shadow="never" class="card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="类型">
          <el-select v-model="query.type" placeholder="全部" clearable style="width: 160px">
            <el-option v-for="opt in TYPE_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="Link">
          <el-input v-model="query.link" placeholder="请输入 link" clearable style="width: 260px" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="card">
      <template #header>
        <div class="card-header">
          <div class="card-title">Link 查询</div>
          <div class="card-actions">
            <el-button type="primary" @click="openCreate">新增</el-button>
            <el-button :disabled="selectedRows.length !== 1" @click="openEdit()">编辑</el-button>
            <el-button type="danger" :disabled="selectedRows.length === 0" @click="onDelete()">删除</el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="tableLoading"
        :data="rows"
        row-key="id"
        border
        @selection-change="onSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="46" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 1 ? 'success' : row.type === 2 ? 'warning' : 'info'">
              {{ typeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="link" label="Link" min-width="260" show-overflow-tooltip />
        <el-table-column label="创建时间" width="200">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="onDelete([row])">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.mode === 'create' ? '新增 Link' : '编辑 Link'" width="520px">
      <el-form ref="dialogFormRef" :model="dialog.form" :rules="dialogRules" label-width="80px">
        <el-form-item label="类型" prop="type">
          <el-select v-model="dialog.form.type" placeholder="请选择类型" style="width: 100%">
            <el-option v-for="opt in TYPE_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="Link" prop="link">
          <el-input v-model="dialog.form.link" placeholder="请输入 link" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="onDialogSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  border-radius: 10px;
}

.search-form {
  padding-top: 4px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  padding-top: 14px;
}
</style>
