require "test_helper"

class RecipeSearchTest < ActiveSupport::TestCase
  test "user input 'radish' matches a radishes recipe line" do
    stored = IngredientNormalizer.call("1 bunch radishes, trimmed")
    pantry = IngredientNormalizer.call("radishes")

    assert RecipeSearch.matches?(pantry, stored)
    assert RecipeSearch.matches?(IngredientNormalizer.call("radish"), stored)
  end

  test "user input 'banana' matches medium bananas, sliced" do
    stored = IngredientNormalizer.call("medium bananas, sliced")
    pantry = IngredientNormalizer.call("banana")

    assert_equal "medium banana sliced", stored
    assert RecipeSearch.matches?(pantry, stored)
  end

  test "whole-word matching avoids substring false positives" do
    assert RecipeSearch.matches?(
      IngredientNormalizer.call("egg"),
      IngredientNormalizer.call("2 eggs")
    )
    refute RecipeSearch.matches?(
      IngredientNormalizer.call("egg"),
      IngredientNormalizer.call("1 eggplant")
    )

    assert RecipeSearch.matches?(
      IngredientNormalizer.call("radish"),
      IngredientNormalizer.call("1 bunch radishes, trimmed")
    )
    refute RecipeSearch.matches?(
      IngredientNormalizer.call("radish"),
      IngredientNormalizer.call("2 tablespoons horseradish")
    )

    refute RecipeSearch.matches?(
      IngredientNormalizer.call("salt"),
      IngredientNormalizer.call("salted butter")
    )
  end

  test "an empty or blank pantry returns nothing" do
    assert_equal({ results: [], total: 0 }, RecipeSearch.call([]))
    assert_equal({ results: [], total: 0 }, RecipeSearch.call([ "", "  " ]))
  end

  test "ranks doable recipes first, then most matches, then fewest missing, then rating" do
    # Pancakes (3 matched, 0 missing), Fried Egg (1/0, ★4.6), Boiled Egg (1/0, ★4.0), Crepes (3/2)
    assert_equal [ "Pancakes", "Fried Egg", "Boiled Egg", "Crepes" ],
      titles(RecipeSearch.call(%w[egg flour milk]))
  end

  test "among partial matches, more matches beats fewer missing" do
    # Crepes (3 matched, 2 missing) ranks above Pancakes (2 matched, 1 missing)
    result_titles = titles(RecipeSearch.call(%w[egg flour sugar]))

    assert_operator result_titles.index("Crepes"), :<, result_titles.index("Pancakes")
  end

  test "among equal matches, fewer missing ranks higher" do
    # Pancakes (1 matched, 2 missing) ranks above Crepes (1 matched, 4 missing)
    assert_equal [ "Fried Egg", "Boiled Egg", "Pancakes", "Crepes" ],
      titles(RecipeSearch.call(%w[egg]))
  end

  test "reports matched and missing ingredients" do
    crepes = RecipeSearch.call(%w[egg flour milk])[:results]
      .find { |result| result.recipe == recipes(:crepes) }

    assert_equal 3, crepes.match_count
    assert_equal 2, crepes.missing_count
    assert_equal %w[butter sugar], crepes.missing_ingredients.sort
  end

  test "normalizes and de-duplicates pantry items" do
    assert_equal titles(RecipeSearch.call(%w[egg])),
      titles(RecipeSearch.call([ "Eggs ", "egg", "EGG" ]))
  end

  test "excludes recipes that only match part of a word" do
    # "egg" is a substring of "eggplant" and "parmigiano-reggiano" but not a whole-word match
    result_titles = titles(RecipeSearch.call(%w[egg]))

    refute_includes result_titles, "Grilled Eggplant"
    refute_includes result_titles, "Spinach Toasts"
  end

  test "paginates with limit and offset while total counts all results" do
    search = RecipeSearch.call(%w[egg flour milk], limit: 2, offset: 1)

    assert_equal [ "Fried Egg", "Boiled Egg" ], titles(search)
    assert_equal 4, search[:total]
  end

  test "without limit returns the full ranked list" do
    search = RecipeSearch.call(%w[egg flour milk])

    assert_equal 4, search[:total]
    assert_equal 4, search[:results].size
    assert_equal [ "Pancakes", "Fried Egg", "Boiled Egg", "Crepes" ], titles(search)
  end

  private

  def titles(search)
    search[:results].map { |result| result.recipe.title }
  end
end
