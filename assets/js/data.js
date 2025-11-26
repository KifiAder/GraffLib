// assets/js/data.js
window.artworks = [
  {
    id: 'w1',
    title: 'Уличная революция',
    image: 'assets/images/sketch.png',
    artist: 'Алексей Петров',
    city: 'Москва',
    style: 'Мурал',
    price: '15000 ₽',
    tags: ['мурал', 'большой', 'цветной']
  },
  {
    id: 'w2', 
    title: 'Граффити волна',
    image: 'assets/images/sketch.png',
    artist: 'Мария Иванова',
    city: 'Санкт-Петербург',
    style: 'Шрифты',
    price: '12000 ₽',
    tags: ['шрифты', 'текст', 'минимализм']
  },
  {
    id: 'w3',
    title: 'Урбан мечты',
    image: 'assets/images/sketch.png', 
    artist: 'Дмитрий Сидоров',
    city: 'Москва',
    style: 'Персонажи',
    price: '18000 ₽',
    tags: ['персонажи', 'портрет', 'реализм']
  },
  {
    id: 'w4',
    title: 'Металлический взгляд',
    image: 'assets/images/sketch.png',
    artist: 'Ольга Козлова', 
    city: 'Екатеринбург',
    style: '3D',
    price: '20000 ₽',
    tags: ['3d', 'объем', 'техника']
  },
  {
    id: 'w5',
    title: 'Цветные мысли',
    image: 'assets/images/sketch.png',
    artist: 'Сергей Новиков',
    city: 'Москва',
    style: 'Абстракция',
    price: '16000 ₽',
    tags: ['абстракция', 'цвет', 'форма']
  },
  {
    id: 'w6',
    title: 'Ночной город',
    image: 'assets/images/sketch.png',
    artist: 'Анна Смирнова',
    city: 'Казань', 
    style: 'Реализм',
    price: '14000 ₽',
    tags: ['реализм', 'город', 'ночь']
  }
];

// Данные для фильтров
window.filterData = {
  cities: ['Все', 'Москва', 'Санкт-Петербург', 'Екатеринбург', 'Казань'],
  styles: ['Все', 'Мурал', 'Шрифты', 'Персонажи', '3D', 'Абстракция', 'Реализм']
};