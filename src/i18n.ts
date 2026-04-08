import { createI18n } from 'vue-i18n';
import en from "./locales/en";
import zh from "./locales/zh";

/**
 * 获取默认语言（优先级：本地存储 > 浏览器默认）
 * @returns 语言标识（zh 或 en）
 */
const getDefaultLanguage = (): 'zh' | 'en' => {
  // 优先读取统一设置（用户之前切换过的语言）
  // Note: Cannot use useLocalStorage here as this is outside Vue setup
  const storedSettings = localStorage.getItem('userSettings');
  if (storedSettings) {
    try {
      const settings = JSON.parse(storedSettings);
      if (settings.language === 'zh' || settings.language === 'en') {
        return settings.language;
      }
    } catch {
      // 解析失败继续下一步
    }
  }

  // 读取浏览器默认语言
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.includes('zh')) {
    return 'zh';
  }
  return 'zh';
};

export const availableLocales = ['zh', 'en'] as const;
export const localeLabels: Record<(typeof availableLocales)[number], string> = {
  zh: '中文',
  en: 'English',
};

const i18n = createI18n({
  legacy: false,
  globalInjection: true, // 全局注册 $t 方法
  locale: getDefaultLanguage(),
  fallbackLocale: 'en',
  messages: {
    en, zh
  },
  availableLocales, // 可用语言列表
  silentTranslationWarn: true, // 静默翻译警告
  silentFallbackWarn: true // 静默回退警告
})

export default i18n;
