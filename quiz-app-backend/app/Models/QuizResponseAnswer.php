<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizResponseAnswer extends Model
{
    protected $fillable = ['quiz_response_id', 'quiz_item_id', 'answer', 'is_correct', 'points_awarded', 'time_taken'];

    public function quizItem()
    {
        return $this->belongsTo(QuizItem::class);
    }
}
