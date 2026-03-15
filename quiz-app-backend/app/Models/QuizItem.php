<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizItem extends Model
{

    protected $fillable = [
        'quiz_id',
        'question',
        'answer',
        'options',
        'type',
        'points',
        'order',
        'time_limit',
    ];

    protected $casts = [
        'options' => 'array',
    ];
}
