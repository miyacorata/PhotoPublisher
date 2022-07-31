/**
 * ImagePublisher.js
 * K Miyano (miyacorata)
 */

let image = new Image();

let preview = document.getElementById('preview');
let context = preview.getContext('2d');

const font = ' "VL PGothic", "Meiryo", sans';

// EXIFタグを追加
EXIF.Tags[0xA434] = 'LensModel';

// preview更新関数
const updatePreview = () => {
    // 画像を読み込み
    const imageInput = document.getElementById('image-input').files[0];
    if (imageInput === undefined) {
        return;
    }

    // ファイル名を表示
    document.getElementById('file-name').innerText = imageInput.name;

    // EXIF解析
    EXIF.getData(imageInput, function() {
        let exifData = {};
        console.dir(EXIF.getAllTags(this));

        // 撮影日
        const dateRaw = String(EXIF.getTag(this, 'DateTimeOriginal')).split(' ');
        document.getElementById('DateTimeOriginal').innerText = exifData['DateTimeOriginal']
            = dateRaw[0].replaceAll(':','/');

        // シャッタースピード
        const exposureTime = EXIF.getTag(this, 'ExposureTime');
        document.getElementById('ExposureTime').innerText = exifData['ExposureTime'] = exposureTime < 1
            ? (exposureTime.numerator + '/' + exposureTime.denominator)
            : (exposureTime + 's');

        // 単純な値
        const commonTags = [
            'Model',
            'LensModel',
            'FocalLength',
            'FNumber',
            'ISOSpeedRatings',
        ];
        // 単位とか
        const prefix = {
            'FNumber': 'F',
        }
        const suffix = {
            'FocalLength': 'mm',
        }
        commonTags.map((tag) => {
            document.getElementById(tag).innerText = exifData[tag] =
                (prefix[tag] ?? '') + EXIF.getTag(this, tag) + (suffix[tag] ?? '');
        });

        // canvas#preview に画像を表示
        const reader = new FileReader();
        reader.readAsDataURL(imageInput);
        reader.addEventListener('load', () => {
            image.src = reader.result;
        });
        image.addEventListener('load', () => {
            // 画像サイズに応じてCanvasサイズを変更
            preview.height = image.height / (image.width / 1920);

            // 画像を描画
            context.drawImage(image, 0, 0, preview.width, preview.height);

            // テキストの初期設定
            context.fillStyle = 'white';
            context.textAlign = 'right';
            context.textBaseline = 'ideographic';
            // ドロップシャドウを設定
            context.shadowColor = 'rgba(0,0,0,0.7)';
            context.shadowBlur = 10;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.font = '20px' + font;
            context.fillText('hoge', 0,0);
            // 文字列表示位置の初期化
            var textY = preview.height - 20;
            const lineHeight = 27;

            // 撮影情報と作者名を出力
            let summary = [];
            summary.push(document.getElementById('description').value);
            summary.push(exifData['DateTimeOriginal'] + '  ' + document.getElementById('author').value);
            summary.push(
                exifData['Model'] + ' - ' + exifData['LensModel'] + ' (' + exifData['FocalLength'] + ') ' +
                exifData['FNumber'] + ' ' + exifData['ExposureTime'] + ' ISO' + exifData['ISOSpeedRatings']
            );
            console.dir(summary);
            summary.reverse().map((text) => {
                if (text.length === 0) return;
                context.fillText(text, 1890, textY, 1000);
                textY -= lineHeight;
            });
            context.font = '30px' + font;
            context.fillText(document.getElementById('title').value, 1890, textY - 6, 1000);
            context.font = '20px' + font;
        });
    });
};

document.getElementById('image-input').addEventListener('change', updatePreview);
document.getElementById('author').addEventListener('change', updatePreview);
document.getElementById('title').addEventListener('change', updatePreview);
document.getElementById('description').addEventListener('change', updatePreview);
