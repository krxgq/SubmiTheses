import type { Locale } from './i18n-config'
import enCommon from '../locales/en/common.json'
import czCommon from '../locales/cz/common.json'

const dictionaries = {
  'en': enCommon,
  'cz': czCommon,
}

export const getDictionary = (locale: Locale) => dictionaries[locale]