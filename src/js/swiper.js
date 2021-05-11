// core version + pagination modules:
import Swiper, { Pagination } from 'swiper/core';

// configure Swiper to use modules
Swiper.use([Pagination]);

// import Swiper bundle with all modules installed
// import Swiper from 'swiper/bundle';

const swiper = new Swiper('.swiper-container-home', {
  preloadImages: false,
  lazy: true,
  slidesPerView: 3,
  watchSlidesVisibility: true,
  spaceBetween: 30,
  pagination: {
    el: '.swiper-pagination-home',
    clickable: true,
  },
  breakpoints: {
    250: {
      slidesPerView: 1,
    },
    768: {
      slidesPerView: 2,
    },
    992: {
      slidesPerView: 3,
    },
  },
});
