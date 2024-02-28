import 'client-only';

import { Suspense } from "react";
import {
	retrieveValueAtPath,
	retrieveScopeValueAtPath,
	getServerLocale,
} from "../functions";
import { LocaleProvider, useLocale } from "../providers/locale-provider";
import type {
	CreateI18nOptions,
	CreateI18nProps,
	DeepKeyStringUnion,
	DeepKeyUnion,
	FlattenedValueByPath,
	NestedValueByPath,
	StringParameters,
} from "../types";

export const createClientI18n = <T,>(
	locales: CreateI18nProps<T>,
	options: CreateI18nOptions<typeof locales>,
) => {
	const firstLocale = Object.keys(locales)[0] as keyof T;
	type FirstLocale = (typeof locales)[typeof firstLocale] extends () => Promise<
		infer R
	>
		? R extends Record<string, unknown>
			? R
			: never
		: never;

	return {
		Provider: async ({ children }: { children: React.ReactNode }) => {
			const _defaultLocale = await getServerLocale(locales, options);
			return (
				<Suspense>
					<LocaleProvider
						defaultLocale={_defaultLocale}
						locales={locales}
						options={options}
					>
						{children}
					</LocaleProvider>
				</Suspense>
			);
		},
		useI18n: () => {
			const { dictionary } = useLocale();
			return <
				T extends DeepKeyStringUnion<FirstLocale>,
				V extends NestedValueByPath<FirstLocale, T>,
				S extends StringParameters<V extends string ? V : "">,
			>(
				key: T,
				params?: S,
			) => {
				if (!Object.keys(dictionary).length) return "";

				return retrieveValueAtPath({
					obj: dictionary,
					path: key,
					params,
				});
			};
		},
		useScopedI18n: <DP extends DeepKeyUnion<FirstLocale>>(scope: DP) => {
			const { dictionary } = useLocale();
			return <
				T extends FlattenedValueByPath<FirstLocale, DP>,
				V extends NestedValueByPath<FirstLocale, T>,
				S extends StringParameters<V extends string ? V : "">,
			>(
				key: T,
				params?: S,
			) => {
				if (!Object.keys(dictionary).length) return "";
				return retrieveScopeValueAtPath({
					obj: dictionary as FirstLocale,
					scope,
					path: key,
					params,
				});
			};
		},
		useChangeLocale: () => {
			const { setLocale } = useLocale();
			return setLocale;
		},
		useGetLocale: () => {
			const { locale } = useLocale();
			return locale;
		},
	};
};
