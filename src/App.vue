<script setup lang="ts">
import { ref, computed } from 'vue';
import { CryptoService } from './services/api';

type Mode = 'encrypt' | 'decrypt';

const mode = ref<Mode>('encrypt');
const selectedType = ref<'gcm' | 'cbc'>('gcm');
const inputText = ref('');
const secretKey = ref('');
const rawResult = ref('');

const isBeautified = ref(false);
const error = ref('');
const isLoading = ref(false);
const isCopied = ref(false);

const actionLabel = computed(() => mode.value === 'encrypt' ? 'Encrypt Now' : 'Decrypt Now');
const inputPlaceholder = computed(() => mode.value === 'encrypt' ? 'Enter plain text to encrypt...' : 'Enter cipher text to decrypt...');

const canBeautify = computed(() => {
  try {
    JSON.parse(rawResult.value);
    return true;
  } catch {
    return false;
  }
});

const displayResult = computed(() => {
  if (isBeautified.value && canBeautify.value) {
    try {
      return JSON.stringify(JSON.parse(rawResult.value), null, 2);
    } catch {
      return rawResult.value;
    }
  }
  return rawResult.value;
});

async function handleAction() {
  if (!inputText.value || !secretKey.value) {
    error.value = 'Please fill in both text and secret key.';
    return;
  }

  error.value = '';
  rawResult.value = '';

  isLoading.value = true;

  try {
    if (mode.value === 'encrypt') {
      rawResult.value = await CryptoService.processEncrypt(inputText.value, secretKey.value, selectedType.value);
    } else {
      rawResult.value = await CryptoService.processDecrypt(inputText.value, secretKey.value, selectedType.value);
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred during processing.';
  } finally {
    isLoading.value = false;
  }
}

function toggleBeautify() {
  isBeautified.value = !isBeautified.value;
}



async function copyToClipboard() {
  if (!displayResult.value) return;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(displayResult.value);
    } else {
      // Fallback for non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = displayResult.value;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
    error.value = 'Failed to copy to clipboard.';
  }
}


function setMode(newMode: Mode) {
  mode.value = newMode;
  inputText.value = '';
  secretKey.value = '';
  rawResult.value = '';
  error.value = '';
  isBeautified.value = false;
}


</script>

<template>
  <div class="glass-card">
    <h1>Encrypt Decrypt</h1>
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
      <label>Algorithm Type</label>
      <div class="type-selection">
        <label class="type-option">
          <input type="radio" v-model="selectedType" value="gcm" />
          <span>AES-GCM</span>
        </label>
        <label class="type-option">
          <input type="radio" v-model="selectedType" value="cbc" />
          <span>AES-CBC</span>
        </label>
      </div>
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
      <label>Secret Key (32 chars)</label>
      <input 
        v-model="secretKey" 
        type="password" 
        class="input-field" 
        placeholder="Enter your 32-character key..."
      />
    </div>

    <button class="action-btn" @click="handleAction" :disabled="isLoading">
      <span v-if="isLoading">Processing...</span>
      <span v-else>{{ actionLabel }}</span>
      <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    </button>


    <p v-if="error" class="error-msg">{{ error }}</p>

    <transition>
      <div v-if="rawResult" class="result-area">
        <div class="result-header">
          <div class="result-title-group">
            <span class="result-title">Result</span>
            <button 
              v-if="canBeautify" 
              class="beautify-toggle" 
              :class="{ active: isBeautified }"
              @click="toggleBeautify"
            >
              {{ isBeautified ? 'Raw' : 'Beautify' }}
            </button>
          </div>
          <button class="copy-btn" @click="copyToClipboard">
            {{ isCopied ? 'Copied!' : 'Copy Result' }}
          </button>
        </div>
        <div class="result-text">{{ displayResult }}</div>
      </div>
    </transition>

  </div>
</template>

<style>
/* Styles are imported in main.ts */
</style>
