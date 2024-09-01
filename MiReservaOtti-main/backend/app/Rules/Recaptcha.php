<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\Rule;
use Illuminate\Support\Facades\Http;

class Recaptcha implements Rule
{
    /**
     * Run the validation rule.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * 
     *
     * @param string $attribute
     * @param mixed $value
     * @return bool
     */

    public function passes($attribute, $value)
    {
        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => '6LcXKe0pAAAAAAsojlj2cwfT_G5he6DYNuKg_bkx',
            'response' => $value
        ])->object();

        if ($response->success && $response->score >= 0.7) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Run the validation rule.
     *
     * @return string
     */
    public function message()
    {
        return "La verificacion de reCaptcha ha fallado.";
    }
}
