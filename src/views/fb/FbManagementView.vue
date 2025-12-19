<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import { apiCreateFb, apiDeleteFb, apiFetchFbList, apiUpdateFb, type FbItem } from '@/api/fb'

const tableLoading = ref(false)
const rows = ref<FbItem[]>([])
const total = ref(0)
const selectedRows = ref<FbItem[]>([])

const query = reactive({
  type: '',
  token: '',
  pixel_id: '',
})

const page = reactive({
  current: 1,
  size: 10,
})

function formatDate(value?: string) {
  if (!value) return '-'
  return value.replace('T', ' ').split('.')[0]?.replace(/Z$/, '') ?? value
}

async function fetchList() {
  tableLoading.value = true
  try {
    const res = await apiFetchFbList({
      type: query.type.trim() || undefined,
      token: query.token.trim() || undefined,
      pixel_id: query.pixel_id.trim() || undefined,
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
  query.type = ''
  query.token = ''
  query.pixel_id = ''
  page.current = 1
  fetchList()
}

function onSelectionChange(value: FbItem[]) {
  selectedRows.value = value
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
    type: '',
    token: '',
    pixel_id: '',
  },
})

const dialogFormRef = ref<FormInstance>()
const dialogRules: FormRules = {
  type: [{ required: true, message: '请输入 type', trigger: 'change' }],
  token: [{ required: true, message: '请输入 token', trigger: 'blur' }],
  pixel_id: [{ required: true, message: '请输入 pixel_id', trigger: 'blur' }],
}

function openCreate() {
  dialog.mode = 'create'
  dialog.form = {
    id: 0,
    type: '',
    token: '',
    pixel_id: '',
  }
  dialog.visible = true
}

function openEdit(row?: FbItem) {
  const target = row ?? selectedRows.value[0]
  if (!target) return
  dialog.mode = 'edit'
  dialog.form = {
    id: target.id,
    type: target.type,
    token: target.token,
    pixel_id: target.pixelId,
  }
  dialog.visible = true
}

async function onDialogSubmit() {
  if (!dialogFormRef.value) return
  const valid = await dialogFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    if (dialog.mode === 'create') {
      await apiCreateFb({
        type: dialog.form.type.trim(),
        token: dialog.form.token.trim(),
        pixel_id: dialog.form.pixel_id.trim(),
      })
      ElMessage.success('新增成功')
    } else {
      if (!dialog.form.id) throw new Error('缺少 id')
      await apiUpdateFb(dialog.form.id, {
        type: dialog.form.type.trim(),
        token: dialog.form.token.trim(),
        pixel_id: dialog.form.pixel_id.trim(),
      })
      ElMessage.success('保存成功')
    }

    dialog.visible = false
    await fetchList()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '操作失败')
  }
}

async function onDelete(rows?: FbItem[]) {
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
    await Promise.all(targets.map((i) => apiDeleteFb(i.id)))
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
</script>

<template>
  <div class="page">
    <el-card shadow="never" class="card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="Type">
          <el-input v-model="query.type" placeholder="请输入 type" clearable style="width: 160px" />
        </el-form-item>

        <el-form-item label="Token">
          <el-input v-model="query.token" placeholder="请输入 token" clearable style="width: 260px" />
        </el-form-item>

        <el-form-item label="Pixel ID">
          <el-input v-model="query.pixel_id" placeholder="请输入 pixel_id" clearable style="width: 220px" />
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
          <div class="card-title">FB 管理</div>
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
        <el-table-column prop="type" label="Type" width="90" />
        <el-table-column prop="token" label="Token" min-width="260" show-overflow-tooltip />
        <el-table-column prop="pixelId" label="Pixel ID" min-width="180" show-overflow-tooltip />
        <el-table-column label="创建时间" width="200">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="200">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
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

    <el-dialog v-model="dialog.visible" :title="dialog.mode === 'create' ? '新增 FB' : '编辑 FB'" width="520px">
      <el-form ref="dialogFormRef" :model="dialog.form" :rules="dialogRules" label-width="100px">
        <el-form-item label="Type" prop="type">
          <el-input v-model="dialog.form.type" placeholder="例如：share" />
        </el-form-item>

        <el-form-item label="Token" prop="token">
          <el-input v-model="dialog.form.token" type="textarea" :rows="3" placeholder="请输入 token" />
        </el-form-item>

        <el-form-item label="Pixel ID" prop="pixel_id">
          <el-input v-model="dialog.form.pixel_id" placeholder="请输入 pixel_id" />
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
