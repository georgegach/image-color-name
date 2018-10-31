/**
*  Extract a named color from an image
*  https://github.com/georgegach/imagecolor
*
**/

window.onload = function () {

    window.colors = colorNameList.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {});
    window.nearest = nearestColor.from(colors);

    console.log('Globals: nearest(hex), colorNamedList[17530] and colors{17530}')

    var downFlag = false;
    var canvas = document.querySelector('#canvas')
    var button = document.querySelector('#chooseBtn')
    var Hex = document.querySelector('#Hex')
    var R = document.querySelector('#R')
    var G = document.querySelector('#G')
    var B = document.querySelector('#B')
    var H = document.querySelector('#H')
    var S = document.querySelector('#S')
    var V = document.querySelector('#V')
    var C = document.querySelector('#C')
    var M = document.querySelector('#M')
    var Y = document.querySelector('#Y')
    var K = document.querySelector('#K')
    var Name = document.querySelector('.card-title')
    var colorView = document.querySelector('#colorView')
    var img = new Image();

    button.onchange = function (e) {
        if (this.files.length == 0)
            img.src = 'assets/default.jpg'
        else
            img.src = URL.createObjectURL(this.files[0]);

        img.onload = function () {
            canvas.width = this.width;
            canvas.height = this.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);

            var getColor = function (e) {
                var rect = canvas.getBoundingClientRect();
                var relX = e.pageX - (rect.left + document.body.scrollLeft);
                var relY = e.pageY - (rect.top + document.body.scrollTop);
                relX /= rect.width / canvas.width
                relY /= rect.height / canvas.height
                cursorData = canvas.getContext('2d').getImageData(relX, relY, 1, 1).data;
                return cursorData
            };

            canvas.onmousemove = function (e) {
                cursorData = getColor(e)
                var color = 'rgba(' + cursorData[0] + ',' + cursorData[1] + ',' + cursorData[2] + ',' + (cursorData[3] / 255) + ')';
                makeCursor(color);
                if (downFlag)
                    updatePanel(cursorData)
            };

            canvas.onmousedown = function (e) {
                downFlag = true
            };

            canvas.onmouseup = function(e) {
                downFlag = false
                cursorData = getColor(e)
                updatePanel(cursorData)
            }

        };
    }

    var event = new Event('change');
    button.dispatchEvent(event);

    function updatePanel(cursorData) {
        hex = rgb2hex(cursorData)
        Hex.innerText = hex

        Name.innerText = nearest('#' + hex).name

        R.innerText = cursorData[0]
        G.innerText = cursorData[1]
        B.innerText = cursorData[2]

        hsv = toHSV(cursorData)
        H.innerText = hsv.h
        S.innerText = hsv.s
        V.innerText = hsv.v

        cmyk = toCMYK(cursorData)
        C.innerText = cmyk.c
        M.innerText = cmyk.m
        Y.innerText = cmyk.y
        K.innerText = cmyk.k
        colorView.style.backgroundColor = '#' + hex;
    }

    function makeCursor(color) {
        var cursor = document.createElement('canvas'),
            ctx = cursor.getContext('2d');
        cursor.width = 100;
        cursor.height = 100;

        var cross = 20, pad = 30;

        ctx.beginPath();
        ctx.arc(cross + pad, cross + pad, cross + pad, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.globalCompositeOperation = 'destination-out'
        ctx.arc(cross + pad, cross + pad, cross + pad / 3, 0, 2 * Math.PI, false);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        ctx.fill();

        ctx.globalCompositeOperation = 'destination-over'
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.arc(cross + pad, cross + pad, cross / 3, 0, 2 * Math.PI, false);
        ctx.stroke();

        document.getElementById('canvas').style.cursor = 'crosshair';
        document.getElementById('canvas').style.cursor = 'url(' + cursor.toDataURL() + ') ' + (pad + cross) + ' ' + (pad + cross) + ' , crosshair';
    }


    function rgb2hex(cursorData) {
        return ("0"+cursorData[0].toString(16)).slice(-2) + ("0"+cursorData[1].toString(16)).slice(-2) + ("0"+cursorData[2].toString(16)).slice(-2);
    }

}


// Adapted from https://gist.github.com/felipesabino/5066336

function toHSV(cursorData) {
    var result = {}

    r = cursorData[0] / 255;
    g = cursorData[1] / 255;
    b = cursorData[2] / 255;

    var minVal = Math.min(r, g, b);
    var maxVal = Math.max(r, g, b);
    var delta = maxVal - minVal;

    result.v = maxVal;

    if (delta == 0) {
        result.h = 0;
        result.s = 0;
    } else {
        result.s = delta / maxVal;
        var del_R = (((maxVal - r) / 6) + (delta / 2)) / delta;
        var del_G = (((maxVal - g) / 6) + (delta / 2)) / delta;
        var del_B = (((maxVal - b) / 6) + (delta / 2)) / delta;

        if (r == maxVal) { result.h = del_B - del_G; }
        else if (g == maxVal) { result.h = (1 / 3) + del_R - del_B; }
        else if (b == maxVal) { result.h = (2 / 3) + del_G - del_R; }

        if (result.h < 0) { result.h += 1; }
        if (result.h > 1) { result.h -= 1; }
    }

    result.h = Math.round(result.h * 360);
    result.s = Math.round(result.s * 100);
    result.v = Math.round(result.v * 100);

    return result;
}

function toCMYK(cursorData) {
    var result = {}

    r = cursorData[0] / 255;
    g = cursorData[1] / 255;
    b = cursorData[2] / 255;

    result.k = Math.min(1 - r, 1 - g, 1 - b);
    result.c = (1 - r - result.k) / (1 - result.k);
    result.m = (1 - g - result.k) / (1 - result.k);
    result.y = (1 - b - result.k) / (1 - result.k);

    result.c = Math.round(result.c * 100);
    result.m = Math.round(result.m * 100);
    result.y = Math.round(result.y * 100);
    result.k = Math.round(result.k * 100);

    return result;
}

