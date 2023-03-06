const profileImg = document.querySelector('.intro-img');
const pictures = ['one.jpg', 'two.jpg', 'three.jpg', 'four.jpg']

let currentImg = 0;

function rotateImg() {
    currentImg += 1;
    if (currentImg > 3) {
        currentImg = 0;
    }
    profileImg.src = 'img/' + pictures[currentImg];
}

profileImg.addEventListener('click', rotateImg);