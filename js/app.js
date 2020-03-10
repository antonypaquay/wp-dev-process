const showTheName = () => {
    alert('Javascript is running');
}

window.onload = () => {
    showTheName();
    console.log('You are ready to use babel');
}

const btn = document.getElementsByTagName('button');
btn[0].addEventListener('click', () => {
    alert('I am a button element');
})
