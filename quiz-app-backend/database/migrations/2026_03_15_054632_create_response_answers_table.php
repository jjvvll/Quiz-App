<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quiz_response_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_response_id')->constrained()->cascadeOnDelete();
            $table->foreignId('quiz_item_id')->constrained()->cascadeOnDelete();

            $table->text('answer')->nullable();         // what the respondent answered
            $table->boolean('is_correct')->nullable();  // null for essay, graded manually
            $table->integer('points_awarded')->default(0);
            $table->integer('time_taken')->nullable();  // per question time in seconds

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('response_answers');
    }
};
