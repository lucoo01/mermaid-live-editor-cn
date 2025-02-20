<script lang="ts">
  import { stopPropagation } from 'svelte/legacy';

  import Card from '$lib/components/Card/Card.svelte';
  import type { HistoryEntry, HistoryType, State, Tab } from '$lib/types';
  import { notify, prompt } from '$lib/util/notify';
  import { getStateString, inputStateStore } from '$lib/util/state';
  import { logEvent } from '$lib/util/stats';
  import dayjs from 'dayjs';
  import dayjsRelativeTime from 'dayjs/plugin/relativeTime';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import {
    addHistoryEntry,
    clearHistoryData,
    getPreviousState,
    historyModeStore,
    historyStore,
    loaderHistoryStore,
    restoreHistory
  } from './history';

  dayjs.extend(dayjsRelativeTime);

  const HISTORY_SAVE_INTERVAL = 60_000;

  const tabSelectHandler = (tab: Tab) => {
    historyModeStore.set(tab.id as HistoryType);
  };
  let tabs: Tab[] = $state([
    {
      id: 'manual',
      title: '已保存',
      icon: 'far fa-bookmark'
    },
    {
      id: 'auto',
      title: '时间线',
      icon: 'fas fa-history'
    }
  ]);

  const downloadHistory = () => {
    const data = get(historyStore);
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mermaid-历史记录-${dayjs().format('YYYY-MM-DD-HHmmss')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logEvent('history', {
      action: 'download'
    });
  };

  const uploadHistory = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', async ({ target }: Event) => {
      const file = (target as HTMLInputElement)?.files?.[0];
      if (!file) {
        return;
      }
      const data: HistoryEntry[] = JSON.parse(await file.text());
      restoreHistory(data);
    });
    input.click();
  };

  const saveHistory = (auto = false) => {
    const currentState: string = getStateString();
    const previousState: string = getPreviousState(auto);
    if (previousState !== currentState) {
      addHistoryEntry({
        state: $inputStateStore,
        time: Date.now(),
        type: auto ? 'auto' : 'manual'
      });
    } else if (!auto) {
      notify('状态已保存。');
    }
  };

  const clearHistory = (id?: string): void => {
    if (!id && !prompt('确定要清除所有已保存的项目吗？')) {
      return;
    }
    clearHistoryData(id);
  };

  const restoreHistoryItem = (state: State): void => {
    inputStateStore.set({ ...state, updateDiagram: true });
  };

  const relativeTime = (time: number) => {
    const t = new Date(time);
    return `${new Date(t).toLocaleString()} (${dayjs(t).fromNow()})`;
  };

  onMount(() => {
    historyModeStore.set('manual');
    setInterval(() => {
      saveHistory(true);
    }, HISTORY_SAVE_INTERVAL);
  });

  loaderHistoryStore.subscribe((entries) => {
    if (entries.length > 0 && tabs.length === 2) {
      tabs = [
        {
          id: 'loader',
          title: 'Revisions',
          icon: 'fab fa-git-alt'
        },
        ...tabs
      ];
      historyModeStore.set('loader');
    }
  });
</script>

<Card onselect={tabSelectHandler} isOpen={false} {tabs} title="历史记录">
  {#snippet actions()}
    <div>
      <button
        id="uploadHistory"
        class="btn btn-secondary btn-xs w-12"
        onclick={stopPropagation(() => uploadHistory())}
        title="上传历史记录"
        aria-label="上传历史记录"><i class="fa fa-upload"></i></button>
      {#if $historyStore.length > 0}
        <button
          id="downloadHistory"
          class="btn btn-secondary btn-xs w-12"
          onclick={stopPropagation(() => downloadHistory())}
          title="下载历史记录"
          aria-label="下载历史记录"><i class="fa fa-download"></i></button>
      {/if}
      |
      <button
        id="saveHistory"
        class="btn btn-success btn-xs w-12"
        onclick={stopPropagation(() => saveHistory())}
        title="保存当前状态"
        aria-label="保存当前状态"><i class="far fa-save"></i></button>
      {#if $historyModeStore !== 'loader'}
        <button
          id="clearHistory"
          class="btn btn-error btn-xs w-12"
          onclick={stopPropagation(() => clearHistory())}
          title="删除所有已保存的状态"
          aria-label="删除所有已保存的状态"><i class="fas fa-trash-alt"></i></button>
      {/if}
    </div>
  {/snippet}
  <ul class="h-56 space-y-2 overflow-auto p-2" id="historyList">
    {#if $historyStore.length > 0}
      {#each $historyStore as { id, state, time, name, url, type }}
        <li class="flex-col rounded p-2 shadow">
          <div class="flex">
            <div class="flex-1">
              <div class="flex flex-col text-base-content">
                {#if url}
                  <a
                    href={url}
                    target="_blank"
                    title="在新标签页中打开修订版本"
                    class="text-blue-500 hover:underline">{name}</a>
                {:else}
                  <span>{name}</span>
                {/if}
                <span class="text-sm text-gray-400">{relativeTime(time)}</span>
              </div>
            </div>
            <div class="flex content-center gap-2">
              <button class="btn btn-success" onclick={() => restoreHistoryItem(state)}
                ><i class="fas fa-undo mr-1"></i>恢复</button>
              {#if type !== 'loader'}
                <button class="btn btn-error" onclick={() => clearHistory(id)}
                  ><i class="fas fa-trash-alt mr-1"></i>删除</button>
              {/if}
            </div>
          </div>
        </li>
      {/each}
    {:else}
      <div class="m-2">
        暂无历史记录<br />
        点击保存按钮可以保存当前状态并在之后恢复。<br />
        时间线会每分钟自动保存一次。
      </div>
    {/if}
  </ul>
</Card>
