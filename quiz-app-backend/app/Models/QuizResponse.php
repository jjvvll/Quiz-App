<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizResponse extends Model
{
    protected $fillable = ['quiz_id', 'respondent_name', 'respondent_email', 'score', 'total_points', 'percentage', 'time_taken', 'started_at', 'completed_at', 'status', 'token'];

    public function responseAnswers()
    {
        return $this->hasMany(QuizResponseAnswer::class);
    }
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}
