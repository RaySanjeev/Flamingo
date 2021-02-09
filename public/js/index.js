/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { booknow } from './stripe';

const signupBtn = document.querySelector('.navigation__content--signup');
const loginBtn = document.querySelector('.navigation__content--login');
const sectionLogin = document.querySelector('.section__login');
const loginForm = document.querySelector('.form__login');
const signupForm = document.querySelector('.form__signup');
const cancelBtn = document.querySelector('.section__login--span');
const tourHeader = document.querySelector('.tour__header');

const mapbox = document.getElementById('map');
const book = document.querySelector('.bookNow__btn');

if (signupBtn) {
  // SIGNUP FORM
  signupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sectionLogin.classList.remove('hidden');
    signupForm.classList.remove('hidden');
  });
}

if (cancelBtn) {
  // CANCEL BUTTON
  cancelBtn.addEventListener('click', (e) => {
    sectionLogin.classList.add('hidden');
    signupForm.classList.add('hidden');
    loginForm.classList.add('hidden');
  });
}

if (loginBtn) {
  // LOGIN FORM
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sectionLogin.classList.remove('hidden');
    loginForm.classList.remove('hidden');
  });
}

if (tourHeader) {
  const image = tourHeader.dataset.image;
  tourHeader.style.backgroundImage = `url(/img/combine/${image})`;
}

if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  console.log('fnksfkfkdjfhkjd');
  displayMap(locations);
}

if (book) {
  book.addEventListener('click', (e) => {
    e.preventDefault();
    const tourID = book.dataset.tourId;
    booknow(tourID);
  });
}
