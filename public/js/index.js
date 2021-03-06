/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { booknow } from './stripe';
import { showAlert } from './alert';

const signupBtn = document.querySelector('.navigation__content--signup');
const loginBtn = document.querySelector('.navigation__content--login');
const sectionLogin = document.querySelector('.section__login');
const loginForm = document.querySelector('.form__login');
const signupForm = document.querySelector('.form__signup');
const cancelBtn = document.querySelector('.section__login--span');
const tourHeader = document.querySelector('.tour__header');

const mapbox = document.getElementById('map');
const book = document.querySelector('.book_tour');

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

window.addEventListener('click', (e) => {
  if (e.target === loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sectionLogin.classList.remove('hidden');
      loginForm.classList.remove('hidden');
    });
  }
});

if (tourHeader) {
  const image = tourHeader.dataset.image;
  tourHeader.style.backgroundImage = `url(/img/combine/${image})`;
}

if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}

if (book) {
  book.addEventListener('click', (e) => {
    e.preventDefault();
    e.target.textContent = 'Processing...';
    const tourID = book.dataset.tourId;
    booknow(tourID);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) {
  const message = alertMessage.split('/');
  console.log(message);
  showAlert(message[0], message[1]);
}
