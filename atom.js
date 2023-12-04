import { atom, RecoilEnv, selector } from 'recoil';

RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED = false;
export const name = atom({
  key: 'sdf',
  default: '',
});

export const dataCategory = atom({
  key: 'category',
  default: 'cosmetic',
});

export const tmp = atom({
  key: '?',
  default: 'tmp',
});

export const fetchingData = atom({
  key: 'd',
  default: {},
});

export const getCategoryData = selector({
  key: 'get/categoryData',
  get: ({ get }) => {
    const category = get(dataCategory);
    const data = get(fetchingData);
    if (Object.keys(data).length === 0) {
      return;
    }
    const targetData = data[category];

    const result1 = [];
    const result2 = [];
    const result3 = [];

    const urls = targetData['urls'];
    const images = targetData['images'];
    const descriptions = targetData['descriptions'];
    const prices = targetData['prices'];

    for (let i = 0; i < 3; i++) {
      const tmpData = {
        url: urls[i],
        image: images[i],
        description: descriptions[i],
        price: prices[i],
      };
      result1.push(tmpData);
    }

    for (let i = 3; i < 6; i++) {
      const tmpData = {
        url: urls[i],
        image: images[i],
        description: descriptions[i],
        price: prices[i],
      };
      result2.push(tmpData);
    }

    for (let i = 6; i < 9; i++) {
      const tmpData = {
        url: urls[i],
        image: images[i],
        description: descriptions[i],
        price: prices[i],
      };
      result3.push(tmpData);
    }

    const result = [result1, result2, result3];
    return result;
  },
});

export const getData = selector({
  key: 'get/datastate',
  get: async ({ get }) => {
    const category = get(dataCategory);
    if (category === ' ') return false;
    else {
      const url = `http://localhost:8000/crawl/${category}`;
      try {
        const res = await fetch(url, { method: 'GET' });
        const result = await res.json();
        return {
          descriptions: result.descriptions,
          images: result.images,
          prices: result.prices,
          urls: result.urls,
        };
      } catch (error) {
        console.log(error);
      }
    }
  },
});
