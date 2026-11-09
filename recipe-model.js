/* Generated from lib/ingredients.ts: shared server/browser recipe logic. */
(function(){const exports={};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRecipe = exports.hasIce = exports.personalBases = exports.surfaceDesigns = exports.pickEyeColor = exports.eyeColors = exports.cupColors = exports.isFood = exports.ingredientDefaults = void 0;
exports.normalizeCup = normalizeCup;
exports.cupEmblem = cupEmblem;
exports.effectiveProduct = effectiveProduct;
exports.hasFoam = hasFoam;
exports.normalizeRecipe = normalizeRecipe;
exports.recipePrice = recipePrice;
exports.consumption = consumption;
const ingredient = (id, name, type, unit, stock, price, color) => ({ id, name, type, unit, stock, price, color, active: 1 });
exports.ingredientDefaults = [
    ingredient('coffee', 'Кавове зерно', 'base', 'г', 5000, 0, '#513125'), ingredient('cocoa', 'Темне какао', 'base', 'г', 2000, 0, '#684438'), ingredient('matcha', 'Матча', 'base', 'г', 1000, 0, '#84985c'), ingredient('tea', 'Чайна суміш', 'base', 'г', 1200, 0, '#ad7958'), ingredient('water', 'Питна вода', 'base', 'мл', 100000, 0, '#b5d8df'), ingredient('ice', 'Лід', 'base', 'г', 12000, 0, '#bddde5'), ingredient('sugar', 'Цукор', 'base', 'г', 3000, 0, '#f0e9db'),
    ingredient('milk-classic', 'Класичне 3,2%', 'milk', 'мл', 15000, 0, '#ecddc7'), ingredient('milk-oat', 'Вівсяне', 'milk', 'мл', 8000, 2000, '#d7bb96'), ingredient('milk-almond', 'Мигдалеве', 'milk', 'мл', 6000, 2500, '#e4cfaa'), ingredient('milk-coconut', 'Кокосове', 'milk', 'мл', 6000, 2500, '#f4e8d9'), ingredient('milk-lactofree', 'Безлактозне', 'milk', 'мл', 6000, 1500, '#eee0c8'), ingredient('milk-banana', 'Бананове', 'milk', 'мл', 6000, 2500, '#ead8a2'),
    ingredient('blueberry', 'Чорниця', 'syrup', 'мл', 2000, 1500, '#755080'), ingredient('caramel', 'Солона карамель', 'syrup', 'мл', 2500, 1500, '#b3773f'), ingredient('vanilla', 'Бурбонська ваніль', 'syrup', 'мл', 2200, 1500, '#d6b777'), ingredient('hazelnut', 'Лісовий горіх', 'syrup', 'мл', 2000, 1500, '#9d6e49'), ingredient('pistachio', 'Фісташка', 'syrup', 'мл', 1800, 2000, '#9aa76a'), ingredient('lavender', 'Лаванда', 'syrup', 'мл', 1800, 2000, '#aa8dc4'), ingredient('rose', 'Троянда', 'syrup', 'мл', 1600, 2000, '#c58d9b'), ingredient('cherry', 'Вишня', 'syrup', 'мл', 2000, 1500, '#9c3b51'), ingredient('strawberry', 'Полуниця', 'syrup', 'мл', 2400, 1500, '#d5848b'), ingredient('mango', 'Манго-маракуя', 'syrup', 'мл', 2400, 2000, '#e5a44a'), ingredient('pear', 'Груша-кардамон', 'syrup', 'мл', 1800, 2000, '#c2a769'), ingredient('orange', 'Сицилійський апельсин', 'syrup', 'мл', 2200, 1500, '#d78946'), ingredient('banana', 'Банан', 'syrup', 'мл', 1800, 1500, '#d8bc72'), ingredient('white-chocolate', 'Білий шоколад', 'syrup', 'мл', 2000, 2000, '#e2d0b3'),
    ingredient('pumpkin', 'Гарбузові прянощі', 'syrup', 'мл', 2000, 2000, '#ca8546'), ingredient('jelly-eye', 'Желейне око', 'extra', 'порц.', 60, 2000, '#dcdba9'),
    ingredient('mint', 'М’ятна свіжість', 'syrup', 'мл', 2400, 1500, '#a8c894'),
    ingredient('shot', 'Додаткове еспресо', 'extra', 'порц.', 100, 2500, '#513125'), ingredient('cream', 'Вершкова шапочка', 'extra', 'мл', 4000, 1500, '#f3e8d4'), ingredient('cinnamon', 'Кориця', 'extra', 'г', 500, 0, '#a67751'), ingredient('chocolate', 'Шоколадна крихта', 'extra', 'г', 1500, 1500, '#674437'),
    ingredient('cane-sugar', 'Тростинний цукор', 'extra', 'г', 1500, 500, '#ad8b5c'), ingredient('rainbow-sprinkles', 'Кольорова посипка', 'extra', 'г', 1000, 500, '#d7a8be'), ingredient('marshmallow', 'Маршмелоу', 'extra', 'г', 1500, 1000, '#f2dce5'),
    ingredient('sea-buckthorn-honey-blend', 'Обліпиха, апельсин і мед', 'syrup', 'мл', 1800, 1500, '#e7a755'),
    ingredient('cornelian-lemon', 'Кизил і лимон', 'syrup', 'мл', 1800, 1500, '#c47781'),
    ingredient('toasted-buckwheat', 'Підсмажена гречка', 'syrup', 'мл', 1800, 1500, '#bd935f'),
    ingredient('smoked-uzvar-base', 'Основа димного узвару', 'syrup', 'мл', 1800, 1500, '#b38967'),
    ingredient('butterfly-elderflower', 'Анчан і бузина', 'syrup', 'мл', 1800, 1500, '#8a98d1'),
    ingredient('apple-herbs', 'Яблуко, м’ята й розмарин', 'syrup', 'мл', 1800, 1500, '#a6b987'),
    ingredient('blackcurrant-orange', 'Смородина й апельсин', 'syrup', 'мл', 1800, 1500, '#97688c'),
    ingredient('brown-sugar', 'Карамелізований цукор', 'syrup', 'мл', 1800, 1500, '#ac7551'),
    ingredient('peach-tea', 'Персик', 'syrup', 'мл', 1800, 1500, '#e6a880'),
    ingredient('blackcurrant-apple', 'Смородина й яблуко', 'syrup', 'мл', 1800, 1500, '#c26e88'),
    ingredient('cranberry-hibiscus', 'Журавлина й каркаде', 'syrup', 'мл', 1800, 1500, '#c96a83'),
    ingredient('taro', 'Таро', 'syrup', 'мл', 1800, 1500, '#b8a4cc'),
    ingredient('cranberry-spice', 'Журавлина, апельсин і прянощі', 'syrup', 'мл', 1800, 1500, '#bb6f83'),
    ingredient('cranberry', 'Журавлина', 'syrup', 'мл', 1800, 1500, '#b9556f'),
    ingredient('cranberry-rosemary-blend', 'Журавлина й розмарин', 'syrup', 'мл', 1800, 1500, '#c77b89'),
    ingredient('honey', 'Мед', 'syrup', 'мл', 1800, 1500, '#d3a253'),
    ingredient('kutia-honey-nut', 'Мед і лісовий горіх', 'syrup', 'мл', 1800, 1500, '#c99a65'),
    ingredient('gingerbread-orange', 'Пряник і апельсин', 'syrup', 'мл', 1800, 1500, '#c78a59'),
    ingredient('mandarin-ginger', 'Мандарин, імбир і бадьян', 'syrup', 'мл', 1800, 1500, '#e0a254'),
    ingredient('sparkling-water', 'Газована вода', 'base', 'мл', 16000, 0, '#c2ddea'),
    ingredient('tonic', 'Тонік', 'base', 'мл', 12000, 0, '#d6e0c8'),
    ingredient('lemon-juice', 'Лимонний сік', 'base', 'мл', 1500, 0, '#f4db8b'),
    ingredient('white-cocoa', 'Біле какао', 'base', 'г', 1600, 0, '#efe0c6'),
    ingredient('green-tea', 'Зелений чай', 'base', 'г', 1000, 0, '#8ca878'),
    ingredient('jasmine-tea', 'Жасминовий чай', 'base', 'г', 1000, 0, '#a7ae81'),
    ingredient('linden-thyme', 'Липа й чебрець', 'base', 'г', 1000, 0, '#b5a277'),
    ingredient('berry-jelly', 'Ягідне желе', 'base', 'г', 1500, 0, '#aa7096'),
    ingredient('chocolate-crescent', 'Шоколадний півмісяць', 'base', 'порц.', 32, 0, '#664537'),
    ingredient('poppy-seeds', 'Мак', 'base', 'г', 600, 0, '#5d526b'),
    ingredient('black-tapioca', 'Чорна тапіока', 'base', 'г', 2800, 0, '#53373a'),
    ingredient('boba-passionfruit', 'Кульки маракуї', 'base', 'г', 1700, 0, '#ecb663'),
    ingredient('boba-lychee', 'Кульки лічі', 'base', 'г', 1700, 0, '#eadbc7'),
    ingredient('boba-strawberry', 'Полуничні кульки', 'base', 'г', 1700, 0, '#c98393'),
    ingredient('boba-sea-buckthorn', 'Обліпихові кульки', 'base', 'г', 1700, 0, '#edac58'),
    ingredient('apple-pear-compote', 'Основа компоту з яблук і груш', 'syrup', 'мл', 1800, 1000, '#c9a673'),
    ingredient('maple', 'Кленовий сироп', 'syrup', 'мл', 1800, 2000, '#ba8956'),
    ingredient('chicory', 'Цикорій', 'base', 'г', 1000, 0, '#8d6a50'),
    ingredient('mango-puree', 'Пюре манго', 'base', 'г', 4000, 0, '#bba7bd'),
    ingredient('banana-puree', 'Пюре банана', 'base', 'г', 4000, 0, '#bba7bd'),
    ingredient('berry-puree', 'Ягідне пюре', 'base', 'г', 4000, 0, '#bba7bd'),
    ingredient('kiwi-puree', 'Пюре ківі', 'base', 'г', 4000, 0, '#bba7bd'),
    ingredient('apple-puree', 'Яблучне пюре', 'base', 'г', 4000, 0, '#bba7bd'),
    ingredient('spinach-puree', 'Шпинат для смузі', 'base', 'г', 4000, 0, '#bba7bd'),
    ingredient('peach-puree', 'Персикове пюре', 'base', 'г', 4000, 0, '#bba7bd'),
    ingredient('cherry-puree', 'Вишневе пюре', 'base', 'г', 4000, 0, '#bba7bd'),
    ingredient('pineapple-puree', 'Пюре ананаса', 'base', 'г', 4000, 0, '#bba7bd'),
    ingredient('blueberry-puree', 'Чорничне пюре', 'base', 'г', 4000, 0, '#bba7bd'),
    ingredient('sea-buckthorn-puree', 'Обліпихове пюре', 'base', 'г', 4000, 0, '#bba7bd'),
    ingredient('raspberry-puree', 'Малинове пюре', 'base', 'г', 4000, 0, '#bba7bd'),
    ingredient('flax-seeds', 'Насіння льону', 'base', 'г', 4000, 0, '#bba7bd'),
    ingredient('chia-seeds', 'Насіння чіа', 'base', 'г', 4000, 0, '#bba7bd'),
];
const isFood = (p) => p?.base === 'dessert' || ['dessert', 'savoury'].includes(p?.category);
exports.isFood = isFood;
exports.cupColors = [{ color: '#bda5c9', name: 'Бузковий' }, { color: '#bad8c5', name: 'М’ятний' }, { color: '#ecd9bb', name: 'Вершковий' }, { color: '#dba8b7', name: 'Трояндовий' }, { color: '#35303f', name: 'Сливовий' }, { color: '#e2b896', name: 'Абрикосовий' }, { color: '#abc7dc', name: 'Небесний' }, { color: '#9cae94', name: 'Шавлієвий' }, { color: '#c8c4bd', name: 'Перлинний' }];
exports.eyeColors = [{ id: 'green', name: 'Зелене', color: '#83ad66' }, { id: 'red', name: 'Червоне', color: '#bf5360' }, { id: 'blue', name: 'Блакитне', color: '#6fabc8' }, { id: 'brown', name: 'Каре', color: '#a17b52' }];
const pickEyeColor = (random = Math.random) => exports.eyeColors[Math.min(3, Math.max(0, Math.floor(random() * 4)))].id;
exports.pickEyeColor = pickEyeColor;
exports.surfaceDesigns = [
    { id: 'heart', name: 'Серце', art: '<path d="M0 35C-13 22-47 4-43-20C-38-45-9-43 0-21C9-43 38-45 43-20C47 4 13 22 0 35Z"/>' },
    { id: 'leaf', name: 'Листочок', art: '<path d="M0 39C-14 21-37 13-34-3C-31-6-15 2-5 10C-19-5-39-15-30-24C-26-28-14-17-5-10C-15-24-23-37-13-40C-6-43-1-32 0-22C1-32 6-43 13-40C23-37 15-24 5-10C14-17 26-28 30-24C39-15 19-5 5 10C15 2 31-6 34-3C37 13 14 21 0 39Z"/><path d="M0 39Q-1 5 0-39" fill="none" stroke="#96744b" stroke-opacity=".38" stroke-width="2.2"/>' },
    { id: 'star', name: 'Зірка', art: '<path d="M0-40 9-10 39 0 9 10 0 40-9 10-39 0-9-10Z"/><circle cx="29" cy="-26" r="3"/><circle cx="-29" cy="27" r="2"/>' },
    { id: 'moon', name: 'Місяць', art: '<path d="M15-38A40 40 0 1 0 30 28A35 35 0 0 1 15-38Z"/><path d="m29-16 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/>' },
    { id: 'tulip', name: 'Тюльпан', art: '<path d="M0 30C-18 22-46 5-37-8C-29-18-10-7 0 8C10-7 29-18 37-8C46 5 18 22 0 30ZM0 9C-15 0-32-15-24-25C-16-33-6-24 0-14C6-24 16-33 24-25C32-15 15 0 0 9ZM0-13C-10-22-14-32-7-38C-1-43 8-39 10-32C12-25 4-17 0-13Z"/><path d="M0 36V-33" fill="none" stroke="currentColor" stroke-width="2.4"/>' },
    { id: 'rosetta', name: 'Розетта', art: '<path d="M0 38Q-30 28-39 12Q-41 5-31 8L-4 26Q-34 9-41-7Q-43-17-32-12L-3 11Q-31-11-33-25Q-33-34-23-26L-2-5Q-21-27-15-39Q-9-44-1-26Q7-44 14-39Q21-27 2-5L23-26Q33-34 33-25Q31-11 3 11L32-12Q43-17 41-7Q34 9 4 26L31 8Q41 5 39 12Q30 28 0 38Z"/><path d="M0 39Q-2 1 0-39" fill="none" stroke="#96744b" stroke-opacity=".4" stroke-width="2.4"/>' },
    { id: 'flower', name: 'Квітка', art: '<path d="M0-9C-25-39 25-39 0-9ZM7-7C11-45 46-10 7-7ZM9 0C39-25 39 25 9 0ZM7 7C45 11 10 46 7 7ZM0 9C25 39-25 39 0 9ZM-7 7C-11 45-46 10-7 7ZM-9 0C-39 25-39-25-9 0ZM-7-7C-45-11-10-46-7-7Z"/><circle r="8"/>' },
    { id: 'swan', name: 'Лебідь', art: '<path d="M-40 16Q-16 36 15 25Q29 18 24 6Q9-7-11 5Q-27 12-40 16Z"/><path d="M19 9C-1-18 4-44 24-40C40-37 38-20 29-15C20-10 18 0 23 9L15 13C10 0 15-14 25-21C31-25 29-32 23-32C12-32 13-13 25 5Z"/><path d="M-30 14Q-23-21 0-14Q-15-2-12 14ZM-16 13Q-5-25 11-12Q-1 0-1 15Z"/><circle cx="27" cy="-29" r="1.8" fill="#866346"/><path d="m33-27 10 4-11 2Z"/>' }
];
function normalizeCup(raw) { const mode = String(raw?.mode || 'glass'); if (!['glass', 'paper', 'own', 'mug'].includes(mode))
    throw Error('Обери посуд для напою.'); if (mode === 'own')
    return { mode, color: '#c8c4bd', pattern: 'none', text: '', lid: false, straw: false }; const color = String(raw?.color || '#bda5c9'), pattern = mode === 'paper' ? 'none' : String(raw?.pattern || 'moon'), text = mode === 'paper' ? String(raw?.text || '').trim() : ''; if (!exports.cupColors.some(c => c.color === color) || !['moon', 'star', 'orbit', 'none'].includes(pattern) || text.length > 28 || raw?.lid !== undefined && typeof raw.lid !== 'boolean' || raw?.straw !== undefined && typeof raw.straw !== 'boolean')
    throw Error('Перевір оформлення чашки: до 28 символів.'); return { mode, color, pattern, text, lid: mode === 'paper' && !!raw?.lid, straw: mode === 'paper' && !!raw?.straw }; }
function cupEmblem(pattern) { const detail = '<path d="m29-30 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="currentColor" stroke="none"/>'; return { moon: '<path d="M13-36A39 39 0 1 0 28 28A33 33 0 0 1 13-36Z" fill="none" stroke="currentColor" stroke-width="2.5"/>' + detail, star: '<path d="M0-40C4-12 12-4 40 0C12 4 4 12 0 40C-4 12-12 4-40 0C-12-4-4-12 0-40Z" fill="none" stroke="currentColor" stroke-width="2.5"/>' + detail, orbit: '<ellipse rx="43" ry="15" transform="rotate(-27)" fill="none" stroke="currentColor" stroke-width="1.7"/><ellipse rx="43" ry="15" transform="rotate(32)" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".65"/><path d="M0-25 5-5 25 0 5 5 0 25-5 5-25 0-5-5Z" fill="currentColor" stroke="none"/><circle cx="34" cy="-18" r="3" fill="currentColor" stroke="none"/>', none: '' }[pattern] || ''; }
exports.personalBases = [{ id: 'espresso', name: 'Еспресо з молоком', adjust: 0 }, { id: 'black', name: 'Чорна кава', adjust: -1000 }, { id: 'matcha', name: 'Матча', adjust: 2500 }, { id: 'cocoa', name: 'Какао', adjust: 1000 }, { id: 'tea', name: 'Чай', adjust: -500 }, { id: 'lemonade', name: 'Фруктовий напій', adjust: -500 }];
function effectiveProduct(p, r) { if (p?.id !== 'my-drink')
    return p; const choice = exports.personalBases.find(b => b.id === r?.base) || exports.personalBases[0]; return { ...p, base: choice.id, price: Math.max(100, p.price + choice.adjust), defaultMilk: ['black', 'tea', 'lemonade'].includes(choice.id) ? 'none' : 'classic' }; }
const hasIce = (r) => r.temp === 'iced' && r.ice !== false;
exports.hasIce = hasIce;
function hasFoam(p, r) { const base = effectiveProduct(p, r)?.base; return !!r.extras?.includes('cream') || r.temp === 'hot' && r.milk !== 'none' && ['espresso', 'matcha', 'cocoa'].includes(base); }
const defaultRecipe = (p) => ({ base: p?.base || 'espresso', size: '250', milk: p?.defaultMilk || (['tea', 'lemonade', 'black'].includes(p?.base) ? 'none' : 'classic'), temp: p?.icedOnly ? 'iced' : 'hot', ice: !!p?.icedOnly, surface: 'none', surfaceByBarista: false, mixed: false, eyeColor: p?.defaultExtras?.includes('jelly-eye') ? (0, exports.pickEyeColor)() : undefined, extras: [...(p?.defaultExtras || [])], cup: normalizeCup({ mode: p?.icedOnly ? 'glass' : 'mug' }), syrups: p?.defaultSyrup ? [{ id: p.defaultSyrup, dose: 20 }] : [], sugar: 0 });
exports.defaultRecipe = defaultRecipe;
function normalizeRecipe(raw, p, ingredients) {
    if ((0, exports.isFood)(p))
        return (0, exports.defaultRecipe)();
    const baseType = p.id === 'my-drink' ? String(raw?.base || 'espresso') : p.base || 'espresso';
    if (p.id === 'my-drink' && !exports.personalBases.some(b => b.id === baseType))
        throw Error('Обери основу свого напою.');
    const selected = effectiveProduct(p, { base: baseType }), base = (0, exports.defaultRecipe)(selected), size = String(raw?.size || base.size), milk = String(raw?.milk || base.milk), temp = p.icedOnly && p.collections?.includes('boba') ? 'iced' : String(raw?.temp || base.temp), extras = Array.isArray(raw?.extras) ? [...new Set(raw.extras.map(String))] : base.extras;
    const syrups = Array.isArray(raw?.syrups) ? raw.syrups.map((s) => ({ id: String(s.id), dose: Number(s.dose) })) : base.syrups;
    const sugar = Number(raw?.sugar || 0), milkId = milk.startsWith('milk-') ? milk : 'milk-' + milk;
    if (!['250', '350', '450'].includes(size) || !['hot', 'iced'].includes(temp) || (!Number.isSafeInteger(sugar) || sugar < 0) || extras.some(key => key !== 'caramel' && !ingredients.some(i => i.id === key && i.type === 'extra' && i.active)) || milk !== 'none' && !ingredients.some(i => i.id === milkId && i.type === 'milk' && i.active) || new Set(syrups.map((s) => s.id)).size !== syrups.length || syrups.some((s) => (!Number.isSafeInteger(s.dose) || s.dose <= 0) || !ingredients.some(i => i.id === s.id && i.type === 'syrup' && i.active)))
        throw Error('Перевір склад рецепта: молоко, сиропи та добавки.');
    if (raw?.ice !== undefined && typeof raw.ice !== 'boolean' || raw?.mixed !== undefined && typeof raw.mixed !== 'boolean')
        throw Error('Перевір лід і перемішування.');
    const surface = String(raw?.surface || 'none');
    if (surface !== 'none' && !exports.surfaceDesigns.some(d => d.id === surface))
        throw Error('Обери доступний узор на пінці.');
    if (raw?.surfaceByBarista !== undefined && typeof raw.surfaceByBarista !== 'boolean')
        throw Error('Перевір вибір бариста.');
    const eyeColor = extras.includes('jelly-eye') ? String(raw?.eyeColor || 'green') : undefined;
    if (eyeColor && !exports.eyeColors.some(c => c.id === eyeColor))
        throw Error('Перевір колір желейного ока.');
    const result = { base: baseType, size, milk, temp, extras, syrups, sugar, ice: temp === 'iced' && raw?.ice !== false, surface, surfaceByBarista: !!raw?.surfaceByBarista && surface !== 'none', eyeColor, mixed: !!raw?.mixed, cup: normalizeCup(raw?.cup) };
    if (!hasFoam(p, result)) {
        result.surface = 'none';
        result.surfaceByBarista = false;
    }
    return result;
}
function recipePrice(product, r, ingredients) { if ((0, exports.isFood)(product))
    return product.price; const p = effectiveProduct(product, r), get = (id) => ingredients.find(i => i.id === id); let value = p.price + { '250': 0, '350': 2000, '450': 3500 }[r.size]; if (r.milk !== 'none')
    value += Math.max(0, (get(r.milk.startsWith('milk-') ? r.milk : 'milk-' + r.milk)?.price || 0) - (p.defaultMilk && p.defaultMilk !== 'classic' ? (get(p.defaultMilk.startsWith('milk-') ? p.defaultMilk : 'milk-' + p.defaultMilk)?.price || 0) : 0)); for (const syrup of r.syrups) {
    const dose = Math.max(0, syrup.dose - (p.defaultSyrup === syrup.id ? 20 : 0));
    value += Math.round((get(syrup.id)?.price || 0) * dose / 20);
} for (const id of r.extras)
    if (!p.defaultExtras?.includes(id))
        value += get(id)?.price || (id === 'caramel' ? 1500 : 0); return value; }
function consumption(product, r) {
    const used = new Map(), add = (id, n) => { if (n > 0)
        used.set(id, (used.get(id) || 0) + Math.round(n)); };
    if ((0, exports.isFood)(product))
        return used;
    const p = effectiveProduct(product, r), size = Number(r.size), ice = (0, exports.hasIce)(r) ? Math.round(size * .28) : 0, syrup = r.syrups.reduce((s, x) => s + x.dose, 0);
    const type = p.base || 'espresso', baseMl = type === 'espresso' || type === 'black' ? 50 : type === 'matcha' ? 35 : type === 'cocoa' ? 25 : type === 'tea' ? 80 : 0;
    if (type === 'espresso' || type === 'black')
        add('coffee', size >= 450 ? 27 : 18);
    if (type === 'matcha')
        add('matcha', size >= 450 ? 5 : 3);
    if (type === 'cocoa')
        add(p.brewIngredient || 'cocoa', size >= 450 ? 30 : 22);
    if (type === 'tea')
        add(p.brewIngredient || 'tea', size >= 450 ? 6 : 4);
    const milkId = r.milk.startsWith('milk-') ? r.milk : 'milk-' + r.milk;
    if (r.milk !== 'none')
        add(milkId, Math.max(20, size - ice - syrup - baseMl));
    else
        add(p.waterIngredient || 'water', Math.max(0, size - ice - syrup - baseMl));
    for (const [id, amount] of Object.entries(p.stockComponents || {}))
        add(id, Number(amount));
    add('water', baseMl);
    add('ice', ice);
    add('sugar', r.sugar * 5);
    for (const s of r.syrups)
        add(s.id, s.dose);
    for (const extra of r.extras) {
        if (extra === 'shot') {
            add('shot', 1);
            add('coffee', 9);
        }
        else if (extra === 'cream')
            add(extra, 30);
        else if (extra === 'chocolate')
            add(extra, 10);
        else if (extra === 'cinnamon')
            add(extra, 1);
        else if (extra === 'caramel')
            add('caramel', 20);
        else if (extra === 'jelly-eye')
            add(extra, 1);
        else if (extra === 'cane-sugar' || extra === 'rainbow-sprinkles')
            add(extra, 5);
        else if (extra === 'marshmallow')
            add(extra, 15);
    }
    return used;
}

globalThis.CoffeeRecipe=exports;})();
