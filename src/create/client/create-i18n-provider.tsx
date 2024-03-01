import { Suspense, useState,  type Context } from "react";
import type { ImportedLocales, LocaleOptions } from "../../types/i18n";
import {
	QueryClient,
	QueryClientProvider,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";

export type LocaleContextType<T extends Record<string, unknown>> = {
	dictionary: Record<string, unknown>;
	locale: keyof T;
	updateLocale: (locale: string) => void;
};

export function createI18nProvider<Locales extends ImportedLocales>({
	locales,
	I18nContext,
	options
}: {
	locales: Locales;
	options: LocaleOptions<Locales>;
	I18nContext: Context<LocaleContextType<Locales> | null>;
}) {
	function LocaleProvider({children,locale}:{
		locale?: keyof Locales;
		children: React.ReactNode;
	}) {
		const queryClient = useQueryClient();
		const [currentLocale, setCurrentLocale] = useState(locale);

		const fetchLocale = async (_locale: keyof Locales | null | undefined) => {
			if(!Object.keys(locales).includes(_locale as string)){
				return (await locales[options.defaultLocale]).default;
			}
			return (await locales[_locale as string]).default;
		};

		const { data } = useSuspenseQuery({
			queryKey: ["locale"],
			queryFn: async () => {
				const _locale = currentLocale || await options.storedLocale.get();
				return fetchLocale(_locale);
			},
		});

		const updateLocale = async (newLocale: keyof Locales) => {
			const newLocaleData = await fetchLocale(newLocale);
			queryClient.setQueryData(["locale"], newLocaleData);
			options.storedLocale.set(newLocale as string);
			setCurrentLocale(newLocale);
		};

		return (
			<I18nContext.Provider
				value={{
					dictionary: data,
					locale: currentLocale || options.defaultLocale,
					updateLocale: (newLocale: keyof ImportedLocales) =>
						updateLocale(newLocale),
				}}
			>
				{children}
			</I18nContext.Provider>
		);
	}

	return function WrappedLocaleProvider(props:{
		locale?: keyof Locales;
		children: React.ReactNode;
	}) {
		const queryClient = new QueryClient()

		return (
			<QueryClientProvider client={queryClient}>
				<Suspense>
					<LocaleProvider {...props} />
				</Suspense>
			</QueryClientProvider>
		);
	};
}
