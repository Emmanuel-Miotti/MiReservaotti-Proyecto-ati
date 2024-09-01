<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use MercadoPago;
use MercadoPago\SDK;

class MercadoPagoController extends Controller
{
    public function createPreference(Request $request)
    {
        MercadoPago\SDK::setAccessToken("APP_USR-3022119767391992-033019-de56a7a3580b1468f4c55cd1ae0ffd17-1340217969");
    
        $preference = new MercadoPago\Preference();
    
        $items = array_map(function ($item) {
            $mpItem = new MercadoPago\Item();
            $mpItem->title = $item['title'];
            $mpItem->quantity = $item['quantity'];
            $mpItem->unit_price = (float) $item['unit_price'];
            return $mpItem;
        }, $request->items);
    
        $preference->items = $items;
        $preference->save();
    
        return response()->json(['init_point' => $preference->init_point]);
    }
}
