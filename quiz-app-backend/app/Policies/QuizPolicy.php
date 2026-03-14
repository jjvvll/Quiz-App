<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class QuizPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Quiz $quiz): bool
    {
        return $user->id === $quiz->user_id;
    }

    public function create(User $user): bool
    {
        return $user !== null;
    }

    public function update(User $user, Quiz $quiz): bool
    {
        return $user->id === $quiz->user_id;
    }

    public function delete(User $user, Quiz $quiz): bool
    {
        return $user->id === $quiz->user_id;
    }

    public function restore(User $user, Quiz $quiz): bool
    {
        return false;
    }

    public function forceDelete(User $user, Quiz $quiz): bool
    {
        return false;
    }
}
