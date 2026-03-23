<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE quizzes MODIFY COLUMN status ENUM('draft', 'published', 'closed') DEFAULT 'draft'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE quizzes MODIFY COLUMN status ENUM('draft', 'published') DEFAULT 'draft'");
    }
};
