(function () {
    const minInput = document.getElementById('range-min');
    const maxInput = document.getElementById('range-max');
    const range    = document.getElementById('slider-range');
    const labelMin = document.getElementById('label-min');
    const labelMax = document.getElementById('label-max');

    const MIN = +minInput.min;
    const MAX = +maxInput.max;

    function update() {
        let minVal = +minInput.value;
        let maxVal = +maxInput.value;

        if (minVal > maxVal - 100) { minVal = maxVal - 100; minInput.value = minVal; }
        if (maxVal < minVal + 100) { maxVal = minVal + 100; maxInput.value = maxVal; }

        range.style.left  = ((minVal - MIN) / (MAX - MIN)) * 100 + '%';
        range.style.right = ((MAX - maxVal) / (MAX - MIN)) * 100 + '%';

        labelMin.textContent = 'От ' + minVal + ' ₽';
        labelMax.textContent = 'до ' + maxVal + ' ₽';
    }

    minInput.addEventListener('input', update);
    maxInput.addEventListener('input', update);
    update();
})();
