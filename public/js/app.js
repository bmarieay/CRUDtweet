const navBar = document.querySelector('#nav');
const burger = document.querySelector('input')
const navigation = document.querySelector('.nav__item')


burger.addEventListener('change', () => {
    navigation.classList.toggle('show');
})