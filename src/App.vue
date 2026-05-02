<script setup lang="ts">
import { ref, computed } from 'vue';
import { CryptoService } from './services/api';

type Mode = 'encrypt' | 'decrypt';

const mode = ref<Mode>('encrypt');
const inputText = ref('');
const secretKey = ref('');
const result = ref('');
const error = ref('');
const isLoading = ref(false);
const isCopied = ref(false);

const actionLabel = computed(() => mode.value === 'encrypt' ? 'Encrypt Now' : 'Decrypt Now');
const inputPlaceholder = computed(() => mode.value === 'encrypt' ? 'Enter plain text to encrypt...' : 'Enter cipher text to decrypt...');

async function handleAction() {
  if (!inputText.value || !secretKey.value) {
    error.value = 'Please fill in both text and secret key.';
    return;
  }

  error.value = '';
  result.value = '';
  isLoading.value = true;

  try {
    if (mode.value === 'encrypt') {
      result.value = await CryptoService.processEncrypt(inputText.value, secretKey.value);
    } else {
      result.value = await CryptoService.processDecrypt(inputText.value, secretKey.value);
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred during processing.';
  } finally {
    isLoading.value = false;
  }
}

function copyToClipboard() {
  navigator.clipboard.writeText(result.value);
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 2000);
}

function setMode(newMode: Mode) {
  mode.value = newMode;
  result.value = '';
  error.value = '';
}
</script>

<template>
  <div class="glass-card">
    <h1>Ciphra</h1>
    <p class="subtitle">Securely encrypt and decrypt your messages</p>

    <div class="mode-toggle">
      <div class="mode-indicator" :style="{ transform: mode === 'encrypt' ? 'translateX(0)' : 'translateX(100%)' }"></div>
      <button 
        class="mode-btn" 
        :class="{ active: mode === 'encrypt' }"
        @click="setMode('encrypt')"
      >
        Encrypt
      </button>
      <button 
        class="mode-btn" 
        :class="{ active: mode === 'decrypt' }"
        @click="setMode('decrypt')"
      >
        Decrypt
      </button>
    </div>

    <div class="input-group">
      <label>Input Message</label>
      <textarea 
        v-model="inputText" 
        class="input-field" 
        :placeholder="inputPlaceholder"
        rows="4"
      ></textarea>
    </div>

    <div class="input-group">
      <label>Secret Key</label>
      <input 
        v-model="secretKey" 
        type="password" 
        class="input-field" 
        placeholder="Enter your private key..."
      />
    </div>

    <button class="action-btn" @click="handleAction" :disabled="isLoading">
      <span v-if="isLoading">Processing...</span>
      <span v-else>{{ actionLabel }}</span>
      <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    </button>

    <p v-if="error" class="error-msg">{{ error }}</p>

    <transition>
      <div v-if="result" class="result-area">
        <div class="result-header">
          <span class="result-title">Result</span>
          <button class="copy-btn" @click="copyToClipboard">
            {{ isCopied ? 'Copied!' : 'Copy Result' }}
          </button>
        </div>
        <div class="result-text">{{ result }}</div>
      </div>
    </transition>
  </div>
</template>

<style>
/* Styles are imported in main.ts */
</style>
