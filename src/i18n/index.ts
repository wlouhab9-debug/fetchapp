import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './languages/en.json';
import es from './languages/es.json';
import fr from './languages/fr.json';
import de from './languages/de.json';
import it from './languages/it.json';
import pt from './languages/pt.json';
import ar from './languages/ar.json';
import zh from './languages/zh.json';
import ja from './languages/ja.json';
import ko from './languages/ko.json';
import ru from './languages/ru.json';
import hi from './languages/hi.json';
import nl from './languages/nl.json';
import pl from './languages/pl.json';
import tr from './languages/tr.json';
import sv from './languages/sv.json';
import da from './languages/da.json';
import fi from './languages/fi.json';
import no from './languages/no.json';
import el from './languages/el.json';
import he from './languages/he.json';
import th from './languages/th.json';
import vi from './languages/vi.json';
import id from './languages/id.json';
import uk from './languages/uk.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
      pt: { translation: pt },
      ar: { translation: ar },
      zh: { translation: zh },
      ja: { translation: ja },
      ko: { translation: ko },
      ru: { translation: ru },
      hi: { translation: hi },
      nl: { translation: nl },
      pl: { translation: pl },
      tr: { translation: tr },
      sv: { translation: sv },
      da: { translation: da },
      fi: { translation: fi },
      no: { translation: no },
      el: { translation: el },
      he: { translation: he },
      th: { translation: th },
      vi: { translation: vi },
      id: { translation: id },
      uk: { translation: uk },
    },
  });

export default i18n;
