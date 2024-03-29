import type { ImportedLocales, Locale, LocaleOptions } from "../types";

export const getContentLocale = async <Locales extends ImportedLocales>(
	locales: Locales,
	contentLocale: LocaleOptions<Locales>,
) => {
	let locale = "";

	if (contentLocale.locale) {
		locale = contentLocale.locale;
	}

	if (!locale) {
		const storedLocale = contentLocale.persistentLocale?.get?.();
		if (typeof storedLocale === "string") {
			locale = storedLocale;
		} else if (storedLocale instanceof Promise) {
			try {
				locale = (await storedLocale) ?? "";
			} catch (error) {
				console.error("Erro ao obter locale da promessa:", error);
			}
		}
	}

	if (!(locale in locales)) {
		locale = contentLocale.defaultLocale;
	}

	return (await locales[locale]()).default as Locale<Locales[keyof Locales]>;
};
