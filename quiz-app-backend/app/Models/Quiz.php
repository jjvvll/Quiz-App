<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'token',
        'title',
        'description',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function quizItems()
    {
        return $this->hasMany(QuizItem::class);
    }

    public function responses()
    {
        return $this->hasMany(QuizResponse::class);
    }
}
