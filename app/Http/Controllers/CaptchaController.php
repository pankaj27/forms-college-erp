<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class CaptchaController extends Controller
{
    public function image(): Response
    {
        $code = substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 6);

        session(['captcha_code' => $code]);

        $width = 140;
        $height = 40;

        $image = imagecreatetruecolor($width, $height);

        $backgroundColor = imagecolorallocate($image, 243, 244, 246);
        $textColor = imagecolorallocate($image, 55, 65, 81);
        $lineColor = imagecolorallocate($image, 209, 213, 219);

        imagefilledrectangle($image, 0, 0, $width, $height, $backgroundColor);

        for ($i = 0; $i < 4; $i++) {
            imageline(
                $image,
                rand(0, $width),
                rand(0, $height),
                rand(0, $width),
                rand(0, $height),
                $lineColor
            );
        }

        $fontSize = 5;
        $textBoxWidth = imagefontwidth($fontSize) * strlen($code);
        $textBoxHeight = imagefontheight($fontSize);
        $x = (int) (($width - $textBoxWidth) / 2);
        $y = (int) (($height - $textBoxHeight) / 2);

        imagestring($image, $fontSize, $x, $y, $code, $textColor);

        ob_start();
        imagepng($image);
        imagedestroy($image);
        $imageData = ob_get_clean();

        return response($imageData, 200)
            ->header('Content-Type', 'image/png')
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    }
}

