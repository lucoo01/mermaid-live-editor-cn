import type { ErrorHash, MarkerData, State, ValidatedState } from '$lib/types';
import { debounce } from 'lodash-es';
import type { MermaidConfig } from 'mermaid';
import { derived, get, writable, type Readable } from 'svelte/store';
import {
  extractErrorLineText,
  findMostRelevantLineNumber,
  replaceLineNumberInErrorMessage
} from './errorHandling';
import { parse } from './mermaid';
import { localStorage, persist } from './persist';
import { deserializeState, serializeState } from './serde';
import { errorDebug, formatJSON } from './util';

export const defaultState: State = {
  code: `flowchart TD
    A[春节] -->|拿到红包| B(去编程狮)
    B --> C{让我想想}
    C -->|一是| D[学Python]
    C -->|二是| E[学前端]
    C -->|三是| F[学人工智能]
  `,
  mermaid: formatJSON({
    theme: 'default'
  }),
  autoSync: true,
  rough: false,
  updateDiagram: true
};

const urlParseFailedState = `flowchart TD
    A[URL加载失败，让我们来分析原因] -->|解析JSON| B(请查看控制台以获取JSON和错误详情)
    B --> C{JSON格式是否正确?}
    C -->|是| D(点击此处在GitHub上提交问题<br/>在问题中包含失效链接<br/>可以加快修复速度)
    C -->|否| E{是否是他人<br/>分享的链接?}
    E -->|是| F[请他们重新发送<br/>完整的链接]
    E -->|否| G{是否复制了<br/>完整的URL?}
    G --> |是| D
    G --> |"不是:("| H(尝试在历史记录的时间线标签中<br/>查找您在相同浏览器中创建的图表)
    click D href "https://github.com/mermaid-js/mermaid-live-editor/issues/new?assignees=&labels=bug&template=bug_report.md&title=Broken%20link" "提交问题"`;

// inputStateStore handles all updates and is shared externally when exporting via URL, History, etc.
export const inputStateStore = persist(writable(defaultState), localStorage(), 'codeStore');

export const currentState: ValidatedState = (() => {
  const state = get(inputStateStore);
  return {
    ...state,
    serialized: serializeState(state),
    errorMarkers: [],
    error: undefined,
    editorMode: state.editorMode ?? 'code'
  };
})();

const processState = async (state: State) => {
  const processed: ValidatedState = {
    ...state,
    serialized: '',
    errorMarkers: [],
    error: undefined,
    editorMode: state.editorMode ?? 'code'
  };
  // No changes should be done to fields part of `state`.
  try {
    processed.serialized = serializeState(state);
    await parse(state.code);
    JSON.parse(state.mermaid);
  } catch (error) {
    processed.error = error as Error;
    errorDebug();
    console.error(error);
    if ('hash' in error) {
      try {
        let errorString = processed.error.toString();
        const errorLineText = extractErrorLineText(errorString);
        const realLineNumber = findMostRelevantLineNumber(errorLineText, state.code);

        let first_line: number, last_line: number, first_column: number, last_column: number;
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          ({ first_line, last_line, first_column, last_column } = (error.hash as ErrorHash).loc);
        } catch {
          const lineNo = findMostRelevantLineNumber(errorString, state.code);
          first_line = lineNo;
          last_line = lineNo + 1;
          first_column = 0;
          last_column = 0;
        }

        if (realLineNumber !== -1) {
          errorString = replaceLineNumberInErrorMessage(errorString, realLineNumber);
        }

        processed.error = new Error(errorString);
        const marker: MarkerData = {
          severity: 8, // Error
          startLineNumber: realLineNumber,
          startColumn: first_column,
          endLineNumber: last_line + (realLineNumber - first_line),
          endColumn: last_column + (first_column === last_column ? 0 : 5),
          message: errorString || '语法错误'
        };
        processed.errorMarkers = [marker];
      } catch (error) {
        console.error('Error without line helper', error);
      }
    }
  }
  return processed;
};

// All internal reads should be done via stateStore, but it should not be persisted/shared externally.
export const stateStore: Readable<ValidatedState> = derived(
  [inputStateStore],
  ([state], set) => {
    void processState(state).then(set);
  },
  currentState
);

export const loadState = (data: string): void => {
  let state: State;
  console.log(`Loading '${data}'`);
  try {
    state = deserializeState(data);
    if (!state.mermaid) {
      state.mermaid = defaultState.mermaid;
    }
    const mermaidConfig: MermaidConfig =
      typeof state.mermaid === 'string'
        ? (JSON.parse(state.mermaid) as MermaidConfig)
        : state.mermaid;
    if (
      mermaidConfig.securityLevel &&
      mermaidConfig.securityLevel !== 'strict' &&
      confirm(
        `Removing "securityLevel":"${mermaidConfig.securityLevel}" from the config for safety.\nClick Cancel if you trust the source of this Diagram.`
      )
    ) {
      delete mermaidConfig.securityLevel; // Prevent setting overriding securityLevel when loading state to mitigate possible XSS attack
    }
    state.mermaid = formatJSON(mermaidConfig);
  } catch (error) {
    state = get(inputStateStore);
    if (data) {
      console.error('Init error', error);
      state.code = urlParseFailedState;
      state.mermaid = defaultState.mermaid;
    }
  }
  updateCodeStore(state);
};

export const updateCodeStore = (newState: Partial<State>): void => {
  inputStateStore.update((state) => {
    return { ...state, ...newState };
  });
};

export const updateCode = (
  code: string,
  {
    updateDiagram = false,
    resetPanZoom = false
  }: { updateDiagram?: boolean; resetPanZoom?: boolean } = {}
): void => {
  errorDebug();

  inputStateStore.update((state) => {
    if (resetPanZoom) {
      state.pan = undefined;
      state.zoom = undefined;
    }
    return { ...state, code, updateDiagram };
  });
};

export const updateConfig = (config: string): void => {
  // console.log('updateConfig', config);
  inputStateStore.update((state) => {
    return { ...state, mermaid: config };
  });
};

export const toggleDarkTheme = (dark: boolean): void => {
  inputStateStore.update((state) => {
    const config = JSON.parse(state.mermaid) as MermaidConfig;
    if (!config.theme || ['dark', 'default'].includes(config.theme)) {
      config.theme = dark ? 'dark' : 'default';
    }

    return { ...state, mermaid: formatJSON(config) };
  });
};

export const initURLSubscription = (): void => {
  const updateHash = debounce((hash) => {
    history.replaceState(undefined, '', `#${hash}`);
  }, 250);

  stateStore.subscribe(({ serialized }) => {
    updateHash(serialized);
  });
};

export const getStateString = (): string => {
  return JSON.stringify(get(inputStateStore));
};
