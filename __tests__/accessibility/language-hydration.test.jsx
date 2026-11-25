import { act, render } from '@testing-library/react';

test('hydrates the English sign-in label before restoring a saved Arabic preference', () => {
    const storageKey = 'smartmenu-language';
    localStorage.setItem(storageKey, JSON.stringify({ state: { language: 'ar' }, version: 0 }));
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';

    // Load the client modules after storage is populated, as on a return visit.
    const { useTranslation, useTranslationStore } = require('@/store/useTranslation');
    const { LanguageSync } = require('@/components/providers/LanguageSync');
    expect(useTranslationStore.getState().language).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');

    function SignInLabel() {
        const { t } = useTranslation();
        return <span>{t('auth.login.title')}</span>;
    }

    const container = document.createElement('div');
    container.innerHTML = '<span>Sign in</span>';
    document.body.appendChild(container);
    const onRecoverableError = jest.fn();
    render(<><LanguageSync /><SignInLabel /></>, { container, hydrate: true, onRecoverableError });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container).toHaveTextContent('تسجيل الدخول');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');

    act(() => useTranslationStore.getState().setLanguage('en'));
    expect(container).toHaveTextContent('Sign in');
    expect(document.documentElement.dir).toBe('ltr');
    expect(JSON.parse(localStorage.getItem(storageKey)).state.language).toBe('en');
});
