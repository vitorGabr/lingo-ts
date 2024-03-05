export type ImportedLocales = Record<string,Promise<{
	default: Record<string, unknown>;
}>>;

export type Locale<T extends ImportedLocales[keyof ImportedLocales]> =
	T extends Promise<infer R>
		? R extends { default: infer T }
			? T extends Record<string, unknown>
				? T
				: never
			: never
		: never;

type PersistLocale = {
	get?: () => (string | Promise<string | null | undefined> | null | undefined);
	set?: (locale: string) => Promise<void>;
}

export type LocaleOptions<T extends ImportedLocales, K extends keyof T = keyof T> = {
	defaultLocale: Extract<K, string>;
	persistentLocale?: {
		server: PersistLocale,
		client: PersistLocale,
	} | PersistLocale;
};