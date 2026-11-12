// Commit'ten önce yalnızca değişen (staged) dosyalar denetlenir ve biçimlendirilir.
export default {
  '*.{js,mjs,cjs,jsx,ts,tsx}': ['eslint --fix --max-warnings=0', 'prettier --write'],
  '*.{json,yml,yaml,css}': 'prettier --write',
};
