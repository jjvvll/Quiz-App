<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResponseAnswer extends Model
{
    protected $fillable = ['response_id', 'quiz_item_id', 'answer', 'is_correct', 'points_awarded', 'time_taken'];
}
