<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const activeMenu = computed(() => route.path)

async function onLogout() {
  try {
    await ElMessageBox.confirm('确认退出登录？', '提示', {
      type: 'warning',
      confirmButtonText: '退出',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  auth.logout()
  await router.replace('/login')
}
</script>

<template>
  <el-container class="admin-root">
    <el-header class="admin-header">
      <div class="admin-title">后台管理</div>
      <div class="admin-actions">
        <span class="admin-user">{{ auth.username }}</span>
        <el-button size="small" plain @click="onLogout">退出</el-button>
      </div>
    </el-header>

    <el-container class="admin-body">
      <el-aside width="200px" class="admin-aside">
        <el-menu
          class="admin-menu"
          router
          :default-active="activeMenu"
          background-color="#001529"
          text-color="#bfcbd9"
          active-text-color="#409eff"
        >
          <el-menu-item index="/links">Link 管理</el-menu-item>
          <el-menu-item index="/fb">FB 管理</el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-root {
  height: 100%;
}

.admin-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;
}

.admin-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-user {
  font-size: 13px;
  color: #606266;
}

.admin-body {
  height: calc(100% - 56px);
}

.admin-aside {
  background: #001529;
}

.admin-menu {
  border-right: none;
}

.admin-main {
  background: #f5f7fa;
  padding: 16px;
  overflow: auto;
}
</style>
