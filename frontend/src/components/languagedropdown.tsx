'use client';

import {usePathname, useRouter} from 'next/navigation';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' }
];

export default function LanguageDropdown() {
  const router = useRouter();
  const pathname = usePathname();

  const changeLang = (lang: string) => {
    const segments = pathname.split('/');
    segments[1] = lang;
    router.push(segments.join('/'));
  };

  return (
    <div className="relative">
      <select
        className="bg-black text-white p-2 rounded"
        onChange={(e) => changeLang(e.target.value)}
        defaultValue={pathname.split('/')[1]}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
